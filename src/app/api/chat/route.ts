// src/app/api/chat/route.ts
// 集成了OpenManus AI代理功能的聊天API
import { NextRequest, NextResponse } from 'next/server';
import { ChatRequest, PageContext } from '@/types';

// 删除重复的PageContextProcessor类定义，使用下面已有的更完整版本

interface SearchResult {
  name: string;
  url: string;
  snippet: string;
  summary?: string;
  siteName: string;
  datePublished?: string;
  siteIcon?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_call_id?: string;
}

// 移除未使用的接口定义

interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

// Helper 函数
async function parseStream(
  reader: ReadableStreamDefaultReader,
  onLine: (line: string) => void
) {
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += new TextDecoder().decode(value);
    const lines = buf.split('\n');
    buf = lines.pop() || '';
    lines.forEach(l => l.startsWith('data: ') && onLine(l.slice(6)));
  }
}

// 工具定义
const TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "获取指定城市的天气信息",
      parameters: {
        type: "object",
        properties: {
          location: { type: "string", description: "城市名称" },
          adm: { type: "string", description: "行政区域" }
        },
        required: ["location"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "web_search",
      description: "公共互联网关键词搜索，获取新闻、事实性资料、公开数据等",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "搜索关键词" }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "submit_feedback",
      description: "向智慧残健平台提交用户反馈",
      parameters: {
        type: "object",
        properties: {
          content: { type: "string", description: "反馈正文，≤200 字" },
          type:    { type: "integer", description: "反馈类别 0~3", default: 0 },
          name:    { type: "string", description: "反馈人姓名", nullable: true },
          phone:   { type: "string", description: "手机号(11 位)", nullable: true },
          satoken: { type: "string", description: "当前登录 token(自动注入)", nullable: true }
        },
        required: ["content"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "openmanus_web_automation",
      description: "浏览器自动化/网页抓取，支持登录、点击、滚动、批量抓取结构化数据等复杂交互",
      parameters: {
        type: "object",
        properties: {
          task_description: { type: "string", description: "详细的任务描述" },
          url: { type: "string", description: "目标网页URL（可选）" }
        },
        required: ["task_description"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "openmanus_code_execution",
      description: "执行Python代码进行数据分析、计算、文件处理等",
      parameters: {
        type: "object",
        properties: {
          task_description: { type: "string", description: "详细的任务描述" },
          code_type: {
            type: "string",
            description: "代码类型：data_analysis、file_processing、calculation、visualization",
            enum: ["data_analysis", "file_processing", "calculation", "visualization"]
          }
        },
        required: ["task_description"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "openmanus_file_operations",
      description: "文件读写/编辑/格式转换等本地或远程文件操作",
      parameters: {
        type: "object",
        properties: {
          task_description: { type: "string", description: "详细的任务描述" },
          operation_type: {
            type: "string",
            description: "操作类型：read、write、edit、convert、delete",
            enum: ["read", "write", "edit", "convert", "delete"]
          }
        },
        required: ["task_description"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "openmanus_general_task",
      description: "通用智能代理，适合多步骤规划或需要同时使用多种工具的复杂任务",
      parameters: {
        type: "object",
        properties: {
          task_description: { type: "string", description: "详细的任务描述" },
          complexity: {
            type: "string", 
            description: "任务复杂度：simple、medium、complex",
            enum: ["simple", "medium", "complex"]
          }
        },
        required: ["task_description"]
      }
    }
  }
];

// 👇 新增：统一的系统提示词常量，确保每次调用 DeepSeek 都能携带相同的系统级约束
const SYSTEM_PROMPT = `你是一个有用的AI助手。你可以使用以下工具来帮助用户：
                     如果对工具调用结果不满意可以尝试重复调用工具（最多不超过三次），直到得到满意的结果为止。

可用工具：
- get_weather: 城市天气查询（实时天气、空气质量、指数等）
- web_search: 公共互联网关键词搜索，获取新闻、事实性资料、公开数据等
- submit_feedback: 向智慧残健平台提交用户反馈（如用户提出反馈需求，请优先使用此工具）
- openmanus_web_automation: 浏览器自动化/网页抓取，支持登录、点击、滚动、批量抓取结构化数据等复杂交互
- openmanus_code_execution: Python 代码执行（数据分析、计算、可视化、文件处理等）
- openmanus_file_operations: 文件读写/编辑/格式转换等本地或远程文件操作
- openmanus_general_task: 通用智能代理，适合多步骤规划或需要同时使用多种工具的复杂任务

请根据用户的问题判断是否需要使用工具，并在你的推理过程中说明你的决策。如果需要使用工具，请调用相应的工具函数。

对于OpenManus工具，如果任务比较复杂可能需要一些时间执行，请耐心等待任务完成。

## 工具调用处理指导
当收到工具返回的结果时，请严格遵循以下原则：
1. 忠实地润色和报告调用结果：清晰、准确地解释工具返回的信息，不要添加工具结果中没有的内容
2. 保持客观性：如实反映工具执行的成功、失败或部分完成状态
3. 提供相关建议：基于工具结果的实际内容，给出有建设性的建议或后续行动指导
4. 整合多个工具结果：如果使用了多个工具，请综合分析结果并给出完整的回答
5. 错误处理：如果工具执行失败，请说明可能的原因并建议替代方案
6. 根据用户问题，从工具返回中提取核心内容，并根据核心内容回答用户问题`;

// 页面上下文处理器
class PageContextProcessor {
  // 生成页面上下文的系统消息
  static generateContextSystemMessage(pageContext: PageContext): string {
    if (!pageContext) return '';

    const { basic, metadata, structure, extracted } = pageContext;
    
    let contextMessage = `[页面上下文信息]\n`;
    
    // 基本信息
    contextMessage += `当前页面：${basic.title}\n`;
    contextMessage += `页面URL：${basic.url}\n`;
    contextMessage += `页面类型：${this.getPageTypeDescription(basic.type)}\n`;
    if (basic.description) {
      contextMessage += `页面描述：${basic.description}\n`;
    }
    
    // 元数据信息
    if (metadata) {
      if (metadata.author) {
        contextMessage += `作者：${metadata.author}\n`;
      }
      if (metadata.publishDate) {
        contextMessage += `发布时间：${metadata.publishDate}\n`;
      }
      if (metadata.keywords && metadata.keywords.length > 0) {
        contextMessage += `关键词：${metadata.keywords.join(', ')}\n`;
      }
    }
    
    // 页面结构
    if (structure?.sections && structure.sections.length > 0) {
      contextMessage += `\n页面结构：\n`;
      structure.sections.slice(0, 8).forEach((section) => {
        contextMessage += `- ${section}\n`;
      });
    }
    
    // 页面内容摘要
    if (extracted?.summary) {
      contextMessage += `\n页面主要内容：\n${extracted.summary}\n`;
    }
    
    // 关键要点
    if (extracted?.keyPoints && extracted.keyPoints.length > 0) {
      contextMessage += `\n页面关键要点：\n`;
      extracted.keyPoints.slice(0, 5).forEach(point => {
        contextMessage += `- ${point}\n`;
      });
    }
    
    // 内容统计
    if (structure?.wordCount && structure?.readingTime) {
      contextMessage += `\n内容统计：约${structure.wordCount}字，预计阅读时间${structure.readingTime}分钟\n`;
    }
    
    contextMessage += `\n---\n`;
    contextMessage += `请基于以上页面上下文信息来回答用户的问题。当用户询问"这个页面"、"当前页面"、"总结页面内容"等相关问题时，请参考上述信息进行回答。\n`;
    
    return contextMessage;
  }

  // 获取页面类型描述
  static getPageTypeDescription(pageType: string): string {
    const typeMap: Record<string, string> = {
      'homepage': '首页',
      'about': '关于页面',
      'contact': '联系页面',
      'blog_post': '博客文章',
      'product': '产品页面',
      'portfolio': '作品展示页面',
      'general': '一般页面'
    };
    
    return typeMap[pageType] || '未知页面类型';
  }

  // 检测是否为页面相关问题
  static isPageRelatedQuestion(userMessage: string): boolean {
    const pageKeywords = [
      '这个页面', '当前页面', '这页', '本页',
      '总结页面', '页面内容', '页面说什么', '页面讲什么',
      '这里写的什么', '这里说的什么', '这个网站',
      '这个作品', '这个项目', '这篇文章',
      '页面主要内容', '这个页面讲的是什么'
    ];
    
    return pageKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // 增强用户消息（为页面相关问题添加上下文提示）
  static enhanceUserMessage(userMessage: string, pageContext: PageContext): string {
    if (!pageContext || !this.isPageRelatedQuestion(userMessage)) {
      return userMessage;
    }

    // 为页面相关问题添加明确的上下文提示
    return userMessage + `\n\n[请基于当前页面"${pageContext.basic.title}"的内容来回答这个问题]`;
  }
}

// 移除未使用的 ToolResultProcessor 类

export async function POST(request: NextRequest) {
  try {
    const { 
      messages, 
      model = 'deepseek-reasoner', 
      temperature = 0.7, 
      max_tokens = 2048,
      pageContext
    }: ChatRequest = await request.json();

    console.log('🚀 收到聊天请求:', {
      messagesCount: messages?.length,
      model,
      hasPageContext: !!pageContext
    });

    // 验证请求数据
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: '无效的消息格式' },
        { status: 400 }
      );
    }

    // 检查 API 密钥
    if (!process.env.DEEPSEEK_API_KEY) {
      console.error('❌ DeepSeek API 密钥未配置');
      return NextResponse.json({
        message: '抱歉，AI 服务配置有误。',
        messageId: Date.now().toString(),
        error: 'API密钥未配置',
        isSimulated: true
      });
    }

    // 处理页面上下文
    const processedMessages = [...messages];
    if (pageContext && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        const enhancedContent = PageContextProcessor.enhanceUserMessage(
          lastMessage.content, 
          pageContext
        );
        processedMessages[processedMessages.length - 1] = {
          ...lastMessage,
          content: enhancedContent
        };
      }
    }

    // 构建系统消息
    const systemMessage: ChatMessage = {
      role: 'system',
      content: SYSTEM_PROMPT
    };

    // 🔑 统一流式处理架构
    const encoder = new TextEncoder();
    
    return new Response(new ReadableStream({
      async start(controller) {
        const messageId = `msg_${Date.now()}`;
        let reasoningContent = '';
        let finalContent = '';
        const toolCalls: ToolCall[] = [];
        let keepOpen = false; // 如果存在pending任务保持流打开

        try {
          console.log('📤 发送DeepSeek请求（第一阶段 - 推理和工具调用）');
          
          // 第一阶段：DeepSeek推理，可能包含工具调用
          const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
      model,
      messages: [systemMessage, ...processedMessages],
      temperature,
      max_tokens,
              stream: true,
              tools: TOOL_DEFINITIONS,
              tool_choice: 'auto'
            })
          });

          if (!response.ok) {
            throw new Error(`DeepSeek API错误: ${response.status}`);
          }

          // 处理流式响应
          const reader = response.body?.getReader();
          if (!reader) throw new Error('无法获取响应流');

          await parseStream(reader, line => {
            if (line === '[DONE]') return;

            try {
              const parsed = JSON.parse(line);
              const delta = parsed.choices?.[0]?.delta;

              if (delta?.reasoning_content) {
                reasoningContent += delta.reasoning_content;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'reasoning',
                  content: delta.reasoning_content,
                  messageId
                })}\n\n`));
              } else if (delta?.content) {
                finalContent += delta.content;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'content',
                  content: delta.content,
                  messageId
                })}\n\n`));
              } else if (delta?.tool_calls) {
                // 处理工具调用（累积分片数据）
                delta.tool_calls.forEach((toolCall: {
                  index?: number;
                  id?: string;
                  function?: { name?: string; arguments?: string };
                }) => {
                  if (typeof toolCall.index === 'number') {
                    const index = toolCall.index;
                    
                    // 确保数组长度足够
                    while (toolCalls.length <= index) {
                      toolCalls.push({
                        id: `temp_${index}`,
                        type: 'function',
                        function: { name: '', arguments: '' }
                      });
                    }
                    
                    // 累积工具调用数据
                    if (toolCall.id) toolCalls[index].id = toolCall.id;
                    if (toolCall.function?.name) {
                      toolCalls[index].function.name = toolCall.function.name;
                    }
                    if (toolCall.function?.arguments) {
                      toolCalls[index].function.arguments += toolCall.function.arguments;
                    }
                  }
                });
              }
            } catch (e) {
              console.error('解析流式数据错误:', e);
            }
          });

          // 第二阶段：如果有工具调用，执行工具
          if (toolCalls.length > 0) {
            console.log('🛠️ 检测到工具调用，开始执行:', toolCalls.map(t => t.function.name));
            
            // 过滤有效的工具调用
            const validToolCalls = toolCalls.filter(tc => 
              tc.function.name && 
              tc.function.arguments && 
              !tc.id.startsWith('temp_')
            );

            if (validToolCalls.length > 0) {
            // 发送工具执行开始信号
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'tool_execution',
              tool_calls: validToolCalls,
              messageId
            })}\n\n`));

              // 🔑 统一调用 /api/tools 执行所有工具
              const toolResults = await executeTools(validToolCalls, controller, encoder, messageId, pageContext);
                
              // 检查是否有pending的OpenManus任务
              const pendingOpenManusTasks = extractPendingTasks(toolResults);
              
              if (pendingOpenManusTasks.length > 0) {
                console.log('⏳ 检测到pending OpenManus任务:', pendingOpenManusTasks);
                
                // 发送pending信号
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'pending_openmanus',
                task_ids: pendingOpenManusTasks,
                messageId
              })}\n\n`));

                // 启动任务监控
                monitorPendingTasks(pendingOpenManusTasks, processedMessages, validToolCalls, toolResults, controller, encoder, messageId);
                keepOpen = true; // 标记保持流式连接
                return; // 暂停，等待任务完成
              }

              // 第三阶段：将工具结果发回DeepSeek继续推理
              await continueWithToolResults(processedMessages, validToolCalls, toolResults, controller, encoder, messageId);
            }
          } else {
            // 没有工具调用，直接完成
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      type: 'done',
                      reasoning_content: reasoningContent,
              final_content: finalContent,
                      messageId
                    })}\n\n`));
          }
        } catch (error) {
          console.error('❌ 聊天处理错误:', error);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              error: error instanceof Error ? error.message : '处理失败',
              messageId
            })}\n\n`));
        } finally {
            if (!keepOpen) {
              controller.close();
            }
        }
        }
    }), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('❌ API错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 🔑 统一工具执行函数
async function executeTools(toolCalls: ToolCall[], controller: any, encoder: any, messageId: string, pageContext?: PageContext) {
  try {
    console.log('📤 调用统一工具API执行工具');
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        tool_calls: toolCalls,
        pageContext: pageContext
      })
    });

    if (!response.ok) {
      throw new Error(`工具API调用失败: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`工具执行失败: ${data.error}`);
    }

    // 发送系统提示词
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
      type: 'system_instruction',
      content: '请根据以下工具执行结果回答用户问题。处理工具结果时请注意：1）重点提取和总结关键内容信息，忽略技术细节和代码；2）基于获取的信息内容，结合用户问题提供有价值的分析和建议；3）如果结果包含多个信息源，请进行整合分析；4）保持回答的准确性和实用性。',
      messageId
    })}\n\n`));

    // 发送工具结果
    data.results.forEach((result: any) => {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
        type: 'tool_result',
        tool_call_id: result.tool_call_id,
        result: JSON.parse(result.content),
        messageId
      })}\n\n`));
    });

    console.log('✅ 所有工具执行完成');
    return data.results;
    
  } catch (error) {
    console.error('❌ 工具执行错误:', error);
    throw error;
  }
}

// 🔑 提取pending任务
function extractPendingTasks(toolResults: any[]): string[] {
  const pendingTasks: string[] = [];
  
  toolResults.forEach(result => {
    try {
      const content = JSON.parse(result.content);
      if (content.task_id && content.status === 'pending') {
        pendingTasks.push(content.task_id);
      }
    } catch (e) {
      // 忽略解析错误
    }
  });
  
  return pendingTasks;
}

// 🔑 监控pending任务
async function monitorPendingTasks(
  taskIds: string[], 
  messages: any[], 
  toolCalls: ToolCall[], 
  toolResults: any[],
  controller: any, 
  encoder: any, 
  messageId: string
) {
  console.log('🔍 开始监控pending任务:', taskIds);
    
  const checkInterval = setInterval(async () => {
    try {
      let allCompleted = true;
      const updatedResults = [...toolResults];
      
      for (let i = 0; i < taskIds.length; i++) {
        const taskId = taskIds[i];
        
        // 使用专门的任务状态查询端点
        const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/openmanus/status?task_id=${taskId}`);
        const statusData = await statusResponse.json();
        
        if (statusData.success && statusData.status === 'completed') {
          console.log(`✅ 任务完成: ${taskId}`);
          
          // 更新工具结果
          const resultIndex = updatedResults.findIndex(r => {
            const content = JSON.parse(r.content);
            return content.task_id === taskId;
          });
      
          if (resultIndex !== -1) {
            updatedResults[resultIndex] = {
              ...updatedResults[resultIndex],
              content: JSON.stringify({
                success: true,
                task_id: taskId,
                status: 'completed',
                result: statusData.result,
                message: '任务已完成'
              })
        };
      }
        } else if (statusData.status === 'failed') {
          console.log(`❌ 任务失败: ${taskId}`);
          // 标记为失败但继续
        } else {
          allCompleted = false;
        }
      }
      
      if (allCompleted) {
        clearInterval(checkInterval);
        console.log('🎉 所有OpenManus任务完成，继续DeepSeek推理');
        
        // 继续DeepSeek推理
        await continueWithToolResults(messages, toolCalls, updatedResults, controller, encoder, messageId);
    }
  } catch (error) {
      console.error('❌ 监控任务状态失败:', error);
    }
  }, 3000); // 每3秒检查一次
  
  // 超时保护（5分钟后强制完成）
  setTimeout(() => {
    clearInterval(checkInterval);
    console.log('⏰ 任务监控超时，强制完成');
  }, 300000);
  }

// 🔑 带工具结果继续DeepSeek推理
async function continueWithToolResults(
  messages: any[], 
  toolCalls: ToolCall[], 
  toolResults: any[],
  controller: any, 
  encoder: any, 
  messageId: string
) {
      try {
    console.log('🔄 使用工具结果继续DeepSeek推理');
    
    // 构建完整的消息历史（确保始终包含系统提示词）
    const baseMessages = (messages.length > 0 && messages[0].role === 'system')
      ? messages
      : [{ role: 'system', content: SYSTEM_PROMPT }, ...messages];

    const fullMessages = [
      ...baseMessages,
      {
        role: 'assistant',
        content: '',
        tool_calls: toolCalls
      },
      ...toolResults
    ];
    
    // 调用DeepSeek继续推理
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-reasoner',
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 2048,
        stream: true,
        tools: TOOL_DEFINITIONS,
        tool_choice: 'auto'
      })
    });
    
    if (!response.ok) {
      throw new Error(`DeepSeek API错误: ${response.status}`);
    }
    
    // 处理续写的流式响应
    const reader = response.body?.getReader();
    if (!reader) throw new Error('无法获取响应流');

    let finalContent = '';
    const localToolCalls: ToolCall[] = [];
    
    await parseStream(reader, line => {
      if (line === '[DONE]') return;

      try {
        const parsed = JSON.parse(line);
        const delta = parsed.choices?.[0]?.delta;

        // 🚀 同步支持后续阶段的思维链输出
        if (delta?.reasoning_content) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'reasoning',
            content: delta.reasoning_content,
            messageId
          })}\n\n`));
        }

        if (delta?.content) {
          finalContent += delta.content;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'content',
            content: delta.content,
            messageId
          })}\n\n`));
        } else if (delta?.tool_calls) {
          // 处理工具调用（累积分片数据）
          delta.tool_calls.forEach((toolCall: {
            index?: number;
            id?: string;
            function?: { name?: string; arguments?: string };
          }) => {
            if (typeof toolCall.index === 'number') {
              const index = toolCall.index;
              
              while (localToolCalls.length <= index) {
                localToolCalls.push({
                  id: `temp_${index}`,
                  type: 'function',
                  function: { name: '', arguments: '' }
                });
              }
              
              if (toolCall.id) localToolCalls[index].id = toolCall.id;
              if (toolCall.function?.name) localToolCalls[index].function.name = toolCall.function.name;
              if (toolCall.function?.arguments) localToolCalls[index].function.arguments += toolCall.function.arguments;
            }
          });
        }
      } catch (e) {
        console.error('解析续写响应错误:', e);
      }
    });

    // 如果本阶段出现工具调用，执行并递归下一阶段
    const validToolCalls = localToolCalls.filter(tc => tc.function.name && tc.function.arguments && !tc.id.startsWith('temp_'));

    if (validToolCalls.length > 0) {
      // 通知前端工具执行开始
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
        type: 'tool_execution',
        tool_calls: validToolCalls,
        messageId
      })}\n\n`));

      const newToolResults = await executeTools(validToolCalls, controller, encoder, messageId);

      // 检测pending任务
      const pendingOpenManusTasks = extractPendingTasks(newToolResults);
      if (pendingOpenManusTasks.length > 0) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'pending_openmanus',
          task_ids: pendingOpenManusTasks,
          messageId
        })}\n\n`));

        await monitorPendingTasks(pendingOpenManusTasks, messages, validToolCalls, newToolResults, controller, encoder, messageId);
        return; // monitorPendingTasks 内部会在完成后继续递归
      }

      // 递归进入下一阶段
      await continueWithToolResults(messages, validToolCalls, newToolResults, controller, encoder, messageId);
      return;
    }

    // 若无更多工具调用，则发送完成信号
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
      type: 'done',
      final_content: finalContent,
      messageId
    })}\n\n`));

    console.log('✅ DeepSeek推理完成');

    controller.close();
  } catch (error) {
    console.error('❌ 续写DeepSeek推理失败:', error);
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
      type: 'error',
      error: error instanceof Error ? error.message : '续写失败',
      messageId
    })}\n\n`));
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: '聊天API运行正常',
    timestamp: new Date().toISOString(),
    supportedModels: ['deepseek-reasoner'],
    features: ['工具调用', '流式响应', 'OpenManus集成']
  });
}