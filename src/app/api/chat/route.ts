import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, model = 'deepseek-reasoner', temperature = 0.7, max_tokens = 1000 }: ChatRequest = await request.json();

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

    // 添加系统提示
    const systemMessage: ChatMessage = {
      role: 'system',
      content: '你是一个有用的AI助手。请用简洁、友好的方式回答用户的问题。'
    };

    const requestBody = {
      model,
      messages: [systemMessage, ...messages],
      temperature,
      max_tokens,
      stream: false
    };

    try {
      // 调用DeepSeek API（带超时控制）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

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

      const aiMessage = data.choices[0].message?.content || '抱歉，我无法生成回复。';

      return NextResponse.json({
        message: aiMessage,
        messageId: data.id || Date.now().toString(),
        usage: data.usage // 可选：返回使用统计
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
  if (lowerContent.includes('你好') || lowerContent.includes('hello') || lowerContent.includes('hi')) {
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

// 可选：支持GET请求用于健康检查
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    service: 'AI Chat API',
    timestamp: new Date().toISOString() 
  });
} 