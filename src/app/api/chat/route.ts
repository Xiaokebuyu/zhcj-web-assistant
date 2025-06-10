// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

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
  // 新增：页面上下文
  pageContext?: {
    basic: {
      url: string;
      title: string;
      domain: string;
      pathname: string;
      timestamp: string;
    };
    meta: Record<string, string>;
    headings: Array<{
      level: number;
      text: string;
      id?: string;
    }>;
    mainContent: {
      summary: string;
      sections?: Array<{
        index: number;
        tag: string;
        text: string;
        className?: string;
      }>;
      keyElements?: Array<{
        type: string;
        text?: string;
        href?: string;
        alt?: string;
        src?: string;
        items?: string[];
      }>;
      fullText?: string;
    };
    navigation: {
      breadcrumbs?: Array<{
        text: string;
        href: string;
      }>;
      mainNavigation?: Array<{
        text: string;
        href: string;
        active: boolean;
      }>;
    };
    pageType: string;
  };
}

// 页面上下文处理器
class PageContextProcessor {
  // 生成页面上下文的系统消息
  static generateContextSystemMessage(pageContext: ChatRequest['pageContext']): string {
    if (!pageContext) return '';

    const { basic, headings, mainContent, pageType, navigation } = pageContext;
    
    let contextMessage = `[页面上下文信息]\n`;
    
    // 基本信息
    contextMessage += `当前页面：${basic.title}\n`;
    contextMessage += `页面URL：${basic.url}\n`;
    contextMessage += `页面类型：${this.getPageTypeDescription(pageType)}\n`;
    
    // 导航信息
    if (navigation.breadcrumbs && navigation.breadcrumbs.length > 0) {
      contextMessage += `导航路径：${navigation.breadcrumbs.map(b => b.text).join(' > ')}\n`;
    }
    
    // 页面结构
    if (headings && headings.length > 0) {
      contextMessage += `\n页面结构：\n`;
      headings.slice(0, 8).forEach(heading => {
        const indent = '  '.repeat(heading.level - 1);
        contextMessage += `${indent}${heading.text}\n`;
      });
    }
    
    // 主要内容
    if (mainContent.summary) {
      contextMessage += `\n页面主要内容：\n${mainContent.summary}\n`;
    }
    
    // 关键元素
    if (mainContent.keyElements && mainContent.keyElements.length > 0) {
      contextMessage += `\n页面关键元素：\n`;
      mainContent.keyElements.slice(0, 10).forEach(element => {
        if (element.type === 'link') {
          contextMessage += `- 链接：${element.text}\n`;
        } else if (element.type === 'image') {
          contextMessage += `- 图片：${element.alt}\n`;
        } else if (element.type === 'list' && element.items) {
          contextMessage += `- 列表：${element.items.slice(0, 3).join(', ')}\n`;
        }
      });
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

如果用户询问天气，请调用相应的工具获取最新信息，然后用自然语言为用户总结和解释结果。`;

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
        return NextResponse.json({
          message: message.content || '',
          messageId: data.id || Date.now().toString(),
          tool_calls: message.tool_calls,
          usage: data.usage,
          requiresToolCalls: true,
          // 添加上下文使用标记
          contextUsed: pageContext ? PageContextProcessor.isPageRelatedQuestion(
            processedMessages[processedMessages.length - 1]?.content || ''
          ) : false,
          pageInfo: pageContext ? {
            title: pageContext.basic.title,
            url: pageContext.basic.url,
            type: pageContext.pageType
          } : null
        });
      }

      // 正常回复
      const aiMessage = message.content || '抱歉，我无法生成回复。';

      return NextResponse.json({
        message: aiMessage,
        messageId: data.id || Date.now().toString(),
        usage: data.usage,
        requiresToolCalls: false,
        // 添加上下文使用标记
        contextUsed: pageContext ? PageContextProcessor.isPageRelatedQuestion(
          processedMessages[processedMessages.length - 1]?.content || ''
        ) : false,
        pageInfo: pageContext ? {
          title: pageContext.basic.title,
          url: pageContext.basic.url,
          type: pageContext.pageType
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
      pageContext: true,
      enhancedProcessing: true
    }
  });
}