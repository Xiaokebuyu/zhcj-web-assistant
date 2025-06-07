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
    const { messages, model = 'deepseek-r1', temperature = 0.7, max_tokens = 1000 }: ChatRequest = await request.json();

    // 验证请求数据
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: '无效的消息格式' },
        { status: 400 }
      );
    }

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

    // 调用DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error('DeepSeek API 错误:', response.status, response.statusText);
      
      // 如果API调用失败，返回备用响应
      return NextResponse.json({
        message: '抱歉，我现在无法处理你的请求。请稍后再试。',
        messageId: Date.now().toString(),
        error: 'API调用失败'
      }, { status: 500 });
    }

    const data = await response.json();
    
    // 检查API响应格式
    if (!data.choices || data.choices.length === 0) {
      throw new Error('AI服务返回了无效的响应格式');
    }

    const aiMessage = data.choices[0].message?.content || '抱歉，我无法生成回复。';

    return NextResponse.json({
      message: aiMessage,
      messageId: data.id || Date.now().toString(),
      usage: data.usage // 可选：返回使用统计
    });

  } catch (error) {
    console.error('聊天API错误:', error);
    
    return NextResponse.json({
      message: '服务暂时不可用，请稍后再试。',
      messageId: Date.now().toString(),
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

// 可选：支持GET请求用于健康检查
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    service: 'AI Chat API',
    timestamp: new Date().toISOString() 
  });
} 