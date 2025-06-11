// src/app/api/chat/route.ts
// 集成了OpenManus AI代理功能的聊天API
import { NextRequest, NextResponse } from 'next/server';
import { PageContext } from '../../../types';

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

// 扩展的聊天请求接口
interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  tools?: ToolDefinition[];
  // 页面上下文
  pageContext?: PageContext;
}

// 页面上下文处理器
class PageContextProcessor {
  // 生成页面上下文的系统消息
  static generateContextSystemMessage(pageContext: ChatRequest['pageContext']): string {
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
  static enhanceUserMessage(userMessage: string, pageContext: ChatRequest['pageContext']): string {
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
      max_tokens = 1000,
      tools,
      pageContext
    }: ChatRequest = await request.json();

    console.log('API收到的请求数据:');
    console.log('- messages长度:', messages?.length);
    console.log('- 是否有pageContext:', !!pageContext);
    if (pageContext) {
      console.log('- 页面标题:', pageContext.basic?.title);
      console.log('- 页面URL:', pageContext.basic?.url);
      console.log('- 页面类型:', pageContext.basic?.type);
    }

    // 验证请求数据
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: '无效的消息格式' },
        { status: 400 }
      );
    }

    // 检查 API 密钥
    if (!process.env.DEEPSEEK_API_KEY) {
      console.error('DeepSeek API 密钥未配置');
      return NextResponse.json({
        message: '抱歉，AI 服务配置有误。我们正在为您生成一个模拟回复。',
        messageId: Date.now().toString(),
        error: 'API密钥未配置',
        isSimulated: true
      });
    }

    // 获取用户最后一条消息
    const lastUserMessage = messages[messages.length - 1];
    const userContent = lastUserMessage?.content || '';

    // 处理消息数组
    const processedMessages = [...messages];
    
    // 如果有页面上下文，处理最后一条用户消息
    if (pageContext && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        // 增强用户消息
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
    let systemContent = `你是一个有用的AI助手。请用简洁、友好的方式回答用户的问题。

当用户询问天气相关信息时，你可以使用 get_weather 工具来获取准确的天气数据。

如果用户询问天气，请调用相应的工具获取最新信息，然后用自然语言为用户总结和解释结果。
当用户询问最新信息、新闻、实时数据、当前事件、股价、汇率等需要最新数据的问题时，请使用 web_search 工具获取准确的实时信息。

对于复杂任务，你还可以使用OpenManus工具：
- 网页自动化和数据抓取：使用 openmanus_web_automation
- Python代码执行和数据分析：使用 openmanus_code_execution  
- 文件操作和处理：使用 openmanus_file_operations
- 复杂的多步骤任务：使用 openmanus_general_task

使用OpenManus工具的典型场景：
- 抓取网页数据或内容
- 自动化网页操作
- 执行复杂的数据分析
- 文件格式转换和处理
- 需要多个步骤的综合任务
- 编程和算法实现

使用搜索的典型场景：
- 最新新闻和时事
- 股价、汇率、加密货币价格
- 最新的产品发布信息
- 实时统计数据
- 你不确定或需要验证的信息

请根据任务的复杂度和类型选择合适的工具，并根据结果为用户提供准确、及时的信息。`;

    // 如果有页面上下文且用户询问页面相关问题，添加上下文信息
    if (pageContext) {
      const lastProcessedMessage = processedMessages[processedMessages.length - 1];
      if (lastProcessedMessage?.role === 'user' && 
          PageContextProcessor.isPageRelatedQuestion(lastProcessedMessage.content)) {
        
        systemContent += '\n\n' + PageContextProcessor.generateContextSystemMessage(pageContext);
      }
    }

    const systemMessage: ChatMessage = {
      role: 'system',
      content: systemContent
    };

    // 构建请求体
    const requestBody: {
      model: string;
      messages: ChatMessage[];
      temperature: number;
      max_tokens: number;
      stream: boolean;
      tools?: ToolDefinition[];
    } = {
      model,
      messages: [systemMessage, ...processedMessages],
      temperature,
      max_tokens,
      stream: false
    };

    // 如果提供了工具定义，添加到请求中
    if (tools && tools.length > 0) {
      requestBody.tools = tools;
    }

    try {
      // 调用DeepSeek API（带超时控制）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '无法获取错误信息');
        console.error('DeepSeek API 错误:', response.status, response.statusText, errorText);
        
        // 返回智能模拟回复
        return generateFallbackResponse(userContent);
      }

      const data = await response.json();
      
      // 检查API响应格式
      if (!data.choices || data.choices.length === 0) {
        console.error('AI服务返回了无效的响应格式:', data);
        return generateFallbackResponse(userContent);
      }

      const choice = data.choices[0];
      const message = choice.message;

      // 检查是否需要调用工具
      if (message.tool_calls && message.tool_calls.length > 0) {
        // 即使需要工具调用，也检查是否已有搜索结果
        let searchSources: SearchResult[] = [];
        if (ToolResultProcessor.containsToolResults(processedMessages)) {
          searchSources = ToolResultProcessor.extractSearchSources(processedMessages);
        }

        // 检查是否包含OpenManus工具调用
        const hasOpenManusTools = message.tool_calls.some((toolCall: { function: { name: string } }) => 
          toolCall.function.name.startsWith('openmanus_')
        );

        return NextResponse.json({
          message: message.content || '',
          messageId: data.id || Date.now().toString(),
          tool_calls: message.tool_calls,
          usage: data.usage,
          requiresToolCalls: true,
          hasOpenManusTools, // 标记是否包含OpenManus工具
          searchSources: searchSources.length > 0 ? searchSources : undefined,
          // 添加上下文使用标记
          contextUsed: pageContext ? PageContextProcessor.isPageRelatedQuestion(
            processedMessages[processedMessages.length - 1]?.content || ''
          ) : false,
          pageInfo: pageContext ? {
            title: pageContext.basic.title,
            url: pageContext.basic.url,
            type: pageContext.basic.type
          } : null
        });
      }

      // 正常回复
      const aiMessage = message.content || '抱歉，我无法生成回复。';

      // 检查是否有工具调用结果，并提取搜索来源
      let searchSources: SearchResult[] = [];
      if (ToolResultProcessor.containsToolResults(processedMessages)) {
        searchSources = ToolResultProcessor.extractSearchSources(processedMessages);
        console.log('提取到搜索来源:', searchSources.length, '个');
      }

      return NextResponse.json({
        message: aiMessage,
        messageId: data.id || Date.now().toString(),
        usage: data.usage,
        requiresToolCalls: false,
        searchSources: searchSources.length > 0 ? searchSources : undefined,
        // 添加上下文使用标记
        contextUsed: pageContext ? PageContextProcessor.isPageRelatedQuestion(
          processedMessages[processedMessages.length - 1]?.content || ''
        ) : false,
        pageInfo: pageContext ? {
          title: pageContext.basic.title,
          url: pageContext.basic.url,
          type: pageContext.basic.type
        } : null
      });

    } catch (networkError) {
      console.error('网络连接错误:', networkError);
      
      // 网络连接失败时返回智能模拟回复
      return generateFallbackResponse(userContent);
    }

  } catch (error) {
    console.error('聊天API错误:', error);
    
    return NextResponse.json({
      message: '抱歉，我现在遇到了一些技术问题。请稍后再试，或者重新发送您的消息。',
      messageId: Date.now().toString(),
      error: error instanceof Error ? error.message : '未知错误',
      isSimulated: true
    });
  }
}

// 生成智能备用回复的函数
function generateFallbackResponse(userContent: string): NextResponse {
  const lowerContent = userContent.toLowerCase();
  let message = '';

  // 根据用户输入生成相应的模拟回复
  if (lowerContent.includes('天气') || lowerContent.includes('weather')) {
    message = '抱歉，我现在无法获取实时天气信息。您可以尝试重新提问，或者稍后再试。建议您查看本地天气应用或网站获取准确的天气信息。';
  } else if (lowerContent.includes('你好') || lowerContent.includes('hello') || lowerContent.includes('hi')) {
    message = '你好！我是你的 AI 助手。虽然现在网络连接有些问题，但我还是很高兴为你服务！有什么可以帮助你的吗？';
  } else if (lowerContent.includes('什么') || lowerContent.includes('怎么') || lowerContent.includes('如何')) {
    message = '这是一个很好的问题！虽然我现在无法访问在线服务，但我建议你可以：\n\n1. 尝试重新发送消息\n2. 检查网络连接\n3. 稍后再试\n\n有什么其他我可以帮助的吗？';
  } else if (lowerContent.includes('帮助') || lowerContent.includes('help')) {
    message = '当然愿意帮助你！虽然现在我的在线功能暂时不可用，但你可以：\n\n• 重新尝试发送消息\n• 检查一下网络连接\n• 过几分钟再试试\n\n我会尽力为你提供帮助的！';
  } else if (lowerContent.includes('谢谢') || lowerContent.includes('thank')) {
    message = '不客气！虽然现在遇到了一些技术问题，但很高兴能帮到你。如果还有其他问题，随时告诉我！';
  } else if (lowerContent.includes('测试') || lowerContent.includes('test')) {
    message = '测试成功！虽然我现在是在离线模式下运行，但基本功能正常。一旦网络连接恢复，我就能提供更完整的服务了。';
  } else {
    message = `我收到了你的消息："${userContent}"。虽然现在我无法连接到在线 AI 服务，但我想说这看起来很有趣！一旦网络连接恢复，我就能给你一个更详细的回复了。\n\n现在你可以尝试重新发送消息，或者稍后再试。`;
  }

  return NextResponse.json({
    message,
    messageId: Date.now().toString(),
    error: '网络连接问题，使用模拟回复',
    isSimulated: true
  });
}

// 健康检查端点
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    service: 'AI Chat API',
    timestamp: new Date().toISOString(),
    features: {
      chat: true,
      tools: true,
      weather: true,
      webSearch: true,
      pageContext: true,
      enhancedProcessing: true,
      openManusIntegration: true
    }
  });
}