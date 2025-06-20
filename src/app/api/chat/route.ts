// src/app/api/chat/route.ts
// 集成了OpenManus AI代理功能的聊天API
import { NextRequest } from 'next/server';
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

interface ToolDefinition {
  type: string;
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

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

// 工具调用结果解析器
class ToolResultProcessor {
  // 检测消息中是否包含工具调用结果
  static containsToolResults(messages: ChatMessage[]): boolean {
    return messages.some(msg => 
      msg.role === 'tool' || 
      (msg.role === 'assistant' && msg.content === '')
    );
  }

  // 从工具调用结果中提取搜索来源
  static extractSearchSources(messages: ChatMessage[]): SearchResult[] {
    const searchSources: SearchResult[] = [];
    
    messages.forEach(message => {
      if (message.role === 'tool') {
        try {
          const toolData = JSON.parse(message.content);
          
          // 检查是否是搜索工具的结果
          if (toolData.success && toolData.results && Array.isArray(toolData.results)) {
            // 验证结果是否符合 SearchResult 格式
            const validResults = toolData.results.filter((result: unknown) => 
              result && 
              typeof result === 'object' && 
              result !== null &&
              'name' in result &&
              'url' in result &&
              'snippet' in result &&
              typeof (result as Record<string, unknown>).name === 'string' && 
              typeof (result as Record<string, unknown>).url === 'string' && 
              typeof (result as Record<string, unknown>).snippet === 'string'
            );
            
            searchSources.push(...validResults);
          }
        } catch (e) {
          // 忽略解析错误，继续处理其他消息
          console.log('解析工具结果时出错:', e);
        }
      }
    });
    
    // 去重并限制数量
    const uniqueSources = searchSources.filter((source, index, self) => 
      index === self.findIndex(s => s.url === source.url)
    );
    
    return uniqueSources.slice(0, 10); // 最多返回10个来源
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      messages, 
      model = 'deepseek-reasoner', 
      temperature = 0.7, 
      max_tokens = 2000,
      pageContext
    }: ChatRequest = await request.json();

    if (!process.env.DEEPSEEK_API_KEY) {
      return new Response('API密钥未配置', { status: 500 });
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

    // 系统消息 - 包含工具使用指导
    const systemMessage = {
      role: 'system',
      content: `你是一个有用的AI助手。你可以使用以下工具来帮助用户：

可用工具：
- get_weather: 查询天气信息
- web_search: 搜索最新信息
- openmanus_web_automation: 网页自动化
- openmanus_code_execution: 代码执行
- openmanus_file_operations: 文件操作
- openmanus_general_task: 通用任务处理

请根据用户的问题判断是否需要使用工具，并在你的推理过程中说明你的决策。如果需要使用工具，请调用相应的工具函数。

${pageContext ? '\n\n' + PageContextProcessor.generateContextSystemMessage(pageContext) : ''}`
    };

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let currentStage = 'reasoning'; // reasoning -> tool_execution -> final
        let messageId = `msg_${Date.now()}`;
        let reasoningContent = '';
        let finalContent = '';
        let toolCalls: any[] = [];
        let toolResults: any[] = [];

        try {
          // 第一阶段：获取推理和可能的工具调用
          const initialResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
              tools: [
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
                    description: "搜索最新信息",
                    parameters: {
                      type: "object",
                      properties: {
                        query: { type: "string", description: "搜索关键词" }
                      },
                      required: ["query"]
                    }
                  }
                }
                // 可以添加更多工具定义
              ]
            }),
          });

          if (!initialResponse.ok) {
            throw new Error(`API 错误: ${initialResponse.status}`);
          }

          const reader = initialResponse.body?.getReader();
          if (!reader) {
            throw new Error('无法读取响应流');
          }

          let buffer = '';

          // 处理初始流式响应
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += new TextDecoder().decode(value);
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  // 第一阶段完成
                  if (toolCalls.length > 0) {
                    // 有工具调用，进入工具执行阶段
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      type: 'tool_decision',
                      reasoning_content: reasoningContent,
                      tool_calls: toolCalls,
                      messageId
                    })}\n\n`));
                    
                    currentStage = 'tool_execution';
                  } else {
                    // 无工具调用，直接完成
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      type: 'done',
                      reasoning_content: reasoningContent,
                      final_content: finalContent,
                      messageId
                    })}\n\n`));
                    controller.close();
                    return;
                  }
                  break;
    }

    try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices?.[0]?.delta;

                  if (delta?.reasoning_content) {
                    reasoningContent += delta.reasoning_content;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      type: 'reasoning',
                      content: delta.reasoning_content,
                      full_reasoning: reasoningContent,
                      messageId
                    })}\n\n`));
                  } else if (delta?.content) {
                    finalContent += delta.content;
                  } else if (delta?.tool_calls) {
                    // 收集工具调用 - 处理流式分片数据
                    delta.tool_calls.forEach((toolCall: any) => {
                      // DeepSeek可能发送不完整的分片，我们需要更灵活的处理
                      if (!toolCall) return;
                      
                      // 如果有index，说明是分片数据
                      if (typeof toolCall.index === 'number') {
                        const index = toolCall.index;
                        
                        // 确保工具调用数组有足够的位置
                        while (toolCalls.length <= index) {
                          toolCalls.push({
                            id: `temp_${index}`,
                            type: 'function',
                            function: { name: '', arguments: '' }
                          });
                        }
                        
                        // 更新分片数据
                        if (toolCall.id) {
                          toolCalls[index].id = toolCall.id;
                        }
                        if (toolCall.type) {
                          toolCalls[index].type = toolCall.type;
                        }
                        if (toolCall.function?.name) {
                          toolCalls[index].function.name = toolCall.function.name;
                        }
                        if (toolCall.function?.arguments) {
                          toolCalls[index].function.arguments += toolCall.function.arguments;
                        }
                      } else {
                        // 处理完整的工具调用（旧逻辑保留）
                        if (!toolCall.id || !toolCall.function?.name) {
                          console.warn('忽略格式不正确的工具调用:', toolCall);
                          return;
                        }
                        
                        const existingIndex = toolCalls.findIndex(tc => tc.id === toolCall.id);
                        if (existingIndex >= 0) {
                          // 更新现有工具调用
                          if (toolCall.function?.arguments) {
                            toolCalls[existingIndex].function.arguments += toolCall.function.arguments;
                          }
                        } else {
                          // 新的工具调用
                          toolCalls.push({
                            id: toolCall.id,
                            type: toolCall.type || 'function',
                            function: {
                              name: toolCall.function.name,
                              arguments: toolCall.function.arguments || ''
                            }
                          });
                        }
                      }
                    });
                  }
                } catch (e) {
                  console.error('解析流式数据错误:', e);
                }
              }
            }
          }

          // 如果有工具调用，执行工具
          if (currentStage === 'tool_execution' && toolCalls.length > 0) {
            // 过滤并验证工具调用
            const validToolCalls = toolCalls.filter(toolCall => {
              // 检查基本结构
              if (!toolCall?.function?.name) {
                console.warn('过滤掉无效的工具调用（缺少名称）:', toolCall);
                return false;
              }
              
              // 检查是否有有效的ID
              if (!toolCall.id || toolCall.id.startsWith('temp_')) {
                console.warn('过滤掉无效的工具调用（临时ID）:', toolCall);
                return false;
              }
              
              return true;
            });

            if (validToolCalls.length === 0) {
              console.warn('没有有效的工具调用，跳过工具执行阶段');
              // 直接完成，无工具调用
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'done',
                reasoning_content: reasoningContent,
                final_content: finalContent,
                messageId
              })}\n\n`));
              controller.close();
              return;
            }

            console.log('有效的工具调用:', validToolCalls);

            // 发送工具执行开始信号
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'tool_execution',
              tool_calls: validToolCalls,
              messageId
            })}\n\n`));

            // 执行所有工具调用
            const toolExecutionResults = [];
            for (const toolCall of validToolCalls) {
              try {
                // 验证工具调用完整性
                if (!toolCall?.function?.name) {
                  console.error('工具调用缺少必要信息:', toolCall);
                  continue;
                }
                
                console.log(`执行工具: ${toolCall.function.name}`, toolCall);
                const toolResult = await executeToolCall(toolCall);
                
                toolExecutionResults.push({
                  tool_call_id: toolCall.id,
                  role: 'tool',
                  content: JSON.stringify(toolResult)
                });
                
                // 发送工具结果
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'tool_result',
                  tool_call_id: toolCall.id,
                  tool_name: toolCall.function.name,
                  result: toolResult,
                  messageId
                })}\n\n`));
                
              } catch (error) {
                console.error(`工具执行失败: ${toolCall?.function?.name || 'unknown'}`, error);
                
                // 确保有有效的工具调用ID
                const callId = toolCall?.id || `error_${Date.now()}`;
                
                toolExecutionResults.push({
                  tool_call_id: callId,
                  role: 'tool',
                  content: JSON.stringify({
                    error: error instanceof Error ? error.message : '工具执行失败',
                    success: false,
                    tool_name: toolCall?.function?.name || 'unknown'
                  })
                });
                
                // 发送错误结果
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'tool_result',
                  tool_call_id: callId,
                  tool_name: toolCall?.function?.name || 'unknown',
                  result: {
                    error: error instanceof Error ? error.message : '工具执行失败',
                    success: false
                  },
                  messageId
                })}\n\n`));
              }
            }

            // 第二阶段：工具结果整合和最终回复
            const finalResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
              body: JSON.stringify({
                model,
                messages: [
                  systemMessage,
                  ...processedMessages,
                  {
                    role: 'assistant',
                    content: finalContent,
                    tool_calls: toolCalls
                  },
                  ...toolExecutionResults
                ],
                temperature,
                max_tokens,
                stream: true
              }),
            });

            if (!finalResponse.ok) {
              throw new Error(`最终响应API错误: ${finalResponse.status}`);
            }

            const finalReader = finalResponse.body?.getReader();
            if (!finalReader) {
              throw new Error('无法读取最终响应流');
            }

            let finalBuffer = '';
            let postToolReasoning = '';
            let finalFinalContent = '';

            while (true) {
              const { done, value } = await finalReader.read();
              if (done) break;

              finalBuffer += new TextDecoder().decode(value);
              const lines = finalBuffer.split('\n');
              finalBuffer = lines.pop() || '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') {
                    // 全部完成
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      type: 'done',
                      reasoning_content: reasoningContent,
                      post_tool_reasoning: postToolReasoning,
                      final_content: finalFinalContent,
                      tool_calls: toolCalls,
                      tool_results: toolExecutionResults,
                      messageId
                    })}\n\n`));
                    controller.close();
                    return;
                  }

                  try {
                    const parsed = JSON.parse(data);
                    const delta = parsed.choices?.[0]?.delta;

                    if (delta?.reasoning_content) {
                      postToolReasoning += delta.reasoning_content;
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                        type: 'reasoning',
                        content: delta.reasoning_content,
                        full_reasoning: postToolReasoning,
                        phase: 'post_tool',
                        messageId
                      })}\n\n`));
                    } else if (delta?.content) {
                      finalFinalContent += delta.content;
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                        type: 'final_content',
                        content: delta.content,
                        full_content: finalFinalContent,
                        messageId
                      })}\n\n`));
                    }
                  } catch (e) {
                    console.error('解析最终响应错误:', e);
                  }
                }
              }
            }
          }

        } catch (error) {
          console.error('流式处理错误:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : '未知错误',
            messageId
          })}\n\n`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('API错误:', error);
    return new Response('服务器错误', { status: 500 });
  }
}

// 工具执行函数
async function executeToolCall(toolCall: any) {
  try {
    console.log('执行工具调用:', toolCall);
    
    if (!toolCall || !toolCall.function || !toolCall.function.name) {
      throw new Error('工具调用格式不正确');
    }

    switch (toolCall.function.name) {
      case 'get_weather':
        return await executeWeatherTool(toolCall.function.arguments);
      case 'web_search':
        return await executeWebSearchTool(toolCall.function.arguments);
      case 'openmanus_web_automation':
      case 'openmanus_code_execution':
      case 'openmanus_file_operations':
      case 'openmanus_general_task':
        return await executeOpenManusTools(toolCall);
      default:
        throw new Error(`未知工具: ${toolCall.function.name}`);
    }
  } catch (error) {
    console.error('工具执行错误:', error);
    throw error;
  }
}

// 实现实际的天气工具
async function executeWeatherTool(argumentsStr: string) {
  try {
    console.log('天气工具参数:', argumentsStr);
    
    let args;
    if (!argumentsStr || argumentsStr.trim() === '') {
      return {
        success: false,
        error: '缺少位置参数，请提供要查询的城市名称',
        location: 'unknown'
      };
    }
    
    if (typeof argumentsStr === 'string') {
      try {
        args = JSON.parse(argumentsStr);
      } catch (parseError) {
        console.error('参数解析失败:', parseError);
        return {
          success: false,
          error: `参数格式错误: ${argumentsStr}`,
          location: 'unknown'
        };
      }
    } else {
      args = argumentsStr;
    }
    
    const { location } = args;
    
    if (!location || typeof location !== 'string') {
      return {
        success: false,
        error: '位置参数无效，请提供有效的城市名称',
        location: location || 'unknown'
      };
    }
    console.log('查询天气:', { location });
    
    const QWEATHER_TOKEN = process.env.QWEATHER_API_KEY;
    if (!QWEATHER_TOKEN) {
      return {
        success: false,
        error: '和风天气API密钥未配置',
        location
      };
    }
    
    try {
      // 1. 获取城市位置信息
      const locationResponse = await fetch(
        `https://geoapi.qweather.com/v2/city/lookup?location=${encodeURIComponent(location)}&key=${QWEATHER_TOKEN}&lang=zh`
      );
      
      if (!locationResponse.ok) {
        throw new Error(`位置查询失败: ${locationResponse.status}`);
      }
      
      const locationData = await locationResponse.json();
      console.log('位置查询结果:', locationData);
      
      if (!locationData.location || locationData.location.length === 0) {
        return {
          success: false,
          error: `未找到城市: ${location}`,
          location
        };
      }
      
      const cityInfo = locationData.location[0];
      
      // 2. 获取天气信息
      const weatherResponse = await fetch(
        `https://devapi.qweather.com/v7/weather/now?location=${cityInfo.id}&key=${QWEATHER_TOKEN}&lang=zh`
      );
      
      if (!weatherResponse.ok) {
        throw new Error(`天气查询失败: ${weatherResponse.status}`);
      }
      
      const weatherData = await weatherResponse.json();
      console.log('天气查询结果:', weatherData);
      
      if (weatherData.code !== '200') {
        return {
          success: false,
          error: `天气查询失败: ${weatherData.code}`,
          location
        };
      }
      
      const weather = weatherData.now;
      return {
        success: true,
        location: `${cityInfo.name}, ${cityInfo.adm1}`,
        data: {
          temperature: weather.temp,
          condition: weather.text,
          humidity: weather.humidity,
          windDirection: weather.windDir,
          windSpeed: weather.windSpeed,
          pressure: weather.pressure,
          visibility: weather.vis,
          updateTime: weather.obsTime
        }
      };
      
    } catch (apiError) {
      console.error('天气API调用错误:', apiError);
      return {
        success: false,
        error: '天气服务暂时不可用',
        location
      };
    }

  } catch (error) {
    console.error('天气工具执行错误:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '参数解析失败',
      location: 'unknown'
    };
  }
}

async function executeWebSearchTool(argumentsStr: string) {
  try {
    console.log('搜索工具参数:', argumentsStr);
    
    let args;
    if (!argumentsStr || argumentsStr.trim() === '') {
      return {
        success: false,
        error: '缺少搜索关键词，请提供要搜索的内容',
        query: 'unknown'
      };
    }
    
    if (typeof argumentsStr === 'string') {
      try {
        args = JSON.parse(argumentsStr);
      } catch (parseError) {
        console.error('搜索参数解析失败:', parseError);
        return {
          success: false,
          error: `参数格式错误: ${argumentsStr}`,
          query: 'unknown'
        };
      }
    } else {
      args = argumentsStr;
    }
    
    const { query } = args;
    
    if (!query || typeof query !== 'string') {
      return {
        success: false,
        error: '搜索关键词无效，请提供有效的搜索内容',
        query: query || 'unknown'
      };
    }
    console.log('执行搜索:', query);
    
    // 调用现有的搜索API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool_calls: [{
          id: `search_${Date.now()}`,
          type: 'function',
          function: {
            name: 'web_search',
            arguments: JSON.stringify({ query })
          }
        }]
      })
    });
    
    if (!response.ok) {
      throw new Error(`搜索API调用失败: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !data.results || data.results.length === 0) {
      return {
        success: false,
        error: '搜索失败或无结果',
        query
      };
    }
    
    // 提取搜索结果
    const toolResult = data.results[0];
    if (toolResult.role === 'tool') {
      const resultData = JSON.parse(toolResult.content);
      return {
        success: true,
        query,
        results: resultData.results || [],
        totalResults: resultData.totalResults || 0
      };
    }
    
    return {
      success: false,
      error: '搜索结果格式错误',
      query
    };
    
  } catch (error) {
    console.error('搜索工具执行错误:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '搜索失败',
      query: 'unknown'
    };
  }
}

async function executeOpenManusTools(toolCall: any) {
  try {
    console.log('执行OpenManus工具:', toolCall);
    
    // 调用现有的OpenManus API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool_calls: [toolCall]
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenManus API调用失败: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      return {
        success: false,
        error: data.error || 'OpenManus执行失败',
        tool: toolCall.function.name
      };
    }
    
    return {
      success: true,
      tool: toolCall.function.name,
      result: data.results
    };
    
  } catch (error) {
    console.error('OpenManus工具执行错误:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'OpenManus执行失败',
      tool: toolCall.function.name
    };
  }
}

export async function GET() {
  return new Response(JSON.stringify({ 
    message: '聊天API运行正常',
    timestamp: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}