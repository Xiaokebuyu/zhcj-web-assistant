interface MessageData {
    id: string
    content: string
    context?: {
      pageUrl?: string
      pageTitle?: string
      timestamp?: string
      [key: string]: any
    }
  }
  
  interface ClientContext {
    socketId: string
    apiKey: string
    clientInfo?: any
  }
  
  export class MessageHandler {
    
    /**
     * 处理用户消息并返回智能响应
     */
    async handleMessage(messageData: MessageData, clientContext: ClientContext): Promise<string> {
      const { content, context } = messageData
      const { pageUrl, pageTitle } = context || {}
  
      console.log(`🧠 处理消息: "${content}"`)
      console.log(`📄 页面信息: ${pageTitle} (${pageUrl})`)
  
      // 简单的意图识别
      const intent = this.identifyIntent(content)
      console.log(`🎯 识别意图: ${intent.type}`)
  
      // 根据意图生成响应
      let response: string
  
      switch (intent.type) {
        case 'greeting':
          response = this.handleGreeting(content)
          break
        
        case 'help':
          response = this.handleHelp(pageUrl)
          break
        
        case 'page_question':
          response = this.handlePageQuestion(content, pageTitle, pageUrl)
          break
        
        case 'general_question':
          response = this.handleGeneralQuestion(content)
          break
        
        default:
          response = this.handleDefault(content)
      }
  
      // 模拟处理延迟（真实项目中会调用 LLM API）
      await this.simulateProcessingDelay()
  
      return response
    }
  
    /**
     * 简单的意图识别
     */
    private identifyIntent(content: string): { type: string; confidence: number } {
      const text = content.toLowerCase()
  
      // 问候识别
      if (this.matchKeywords(text, ['你好', 'hi', 'hello', '嗨', '早上好', '下午好'])) {
        return { type: 'greeting', confidence: 0.9 }
      }
  
      // 帮助请求
      if (this.matchKeywords(text, ['帮助', 'help', '怎么用', '功能', '能做什么'])) {
        return { type: 'help', confidence: 0.8 }
      }
  
      // 页面相关问题
      if (this.matchKeywords(text, ['这个页面', '当前页面', '这里', '网站', '页面上'])) {
        return { type: 'page_question', confidence: 0.7 }
      }
  
      // 默认为一般问题
      return { type: 'general_question', confidence: 0.5 }
    }
  
    /**
     * 关键词匹配
     */
    private matchKeywords(text: string, keywords: string[]): boolean {
      return keywords.some(keyword => text.includes(keyword))
    }
  
    /**
     * 处理问候
     */
    private handleGreeting(content: string): string {
      const greetings = [
        '你好！我是你的智能网页助手 😊',
        '嗨！很高兴为你服务！有什么可以帮你的吗？',
        '你好！我可以帮你浏览网页、回答问题，试试问我一些关于当前页面的问题吧！',
        '欢迎使用智能助手！我能帮你分析网页内容、回答问题，有什么需要吗？'
      ]
      
      return greetings[Math.floor(Math.random() * greetings.length)]
    }
  
    /**
     * 处理帮助请求
     */
    private handleHelp(pageUrl?: string): string {
      return `🚀 我是你的智能网页助手，我可以：
  
  📖 **分析网页内容** - 帮你理解当前页面的主要信息
  ❓ **回答问题** - 回答关于网页的任何问题  
  🔍 **查找信息** - 帮你在页面中找到特定内容
  💡 **给出建议** - 根据页面内容提供相关建议
  
  ${pageUrl ? `\n当前页面：${pageUrl}` : ''}
  
  试试问我："这个页面主要讲什么？" 或者 "帮我找一下联系方式"`
    }
  
    /**
     * 处理页面相关问题
     */
    private handlePageQuestion(content: string, pageTitle?: string, pageUrl?: string): string {
      // 这里应该调用页面分析 API，目前先返回模拟响应
      const responses = [
        `根据页面标题"${pageTitle || '当前页面'}"，这看起来是一个${this.guessPageType(pageUrl)}。我正在分析页面内容...`,
        
        `让我帮你分析一下当前页面。从URL ${pageUrl || '当前地址'} 来看，这个页面可能包含${this.guessPageContent(pageUrl)}相关的信息。`,
        
        `我注意到你在浏览 ${pageTitle || '这个页面'}。这个页面${this.generatePageInsight(pageUrl)}。有什么具体想了解的吗？`
      ]
  
      return responses[Math.floor(Math.random() * responses.length)]
    }
  
    /**
     * 处理一般问题
     */
    private handleGeneralQuestion(content: string): string {
      // 这里应该调用 LLM API，目前返回模拟响应
      const responses = [
        `关于"${content}"，这是一个很好的问题。让我为你分析一下...`,
        
        `我理解你想了解关于"${content}"的信息。根据我的知识，我可以告诉你...`,
        
        `对于"${content}"这个问题，我建议你可以从以下几个方面来看：\n1. 首先考虑...\n2. 其次注意...\n3. 最后建议...`,
        
        `这是个有趣的问题！关于"${content}"，目前的情况是... 你想了解更具体的哪个方面呢？`
      ]
  
      return responses[Math.floor(Math.random() * responses.length)]
    }
  
    /**
     * 默认响应
     */
    private handleDefault(content: string): string {
      return `我收到了你的消息："${content}"。虽然我还在学习如何更好地理解，但我会尽力帮助你。能不能再详细一点告诉我你需要什么帮助？`
    }
  
    /**
     * 猜测页面类型
     */
    private guessPageType(url?: string): string {
      if (!url) return '信息页面'
      
      if (url.includes('github')) return 'GitHub项目页面'
      if (url.includes('stackoverflow')) return '技术问答页面'
      if (url.includes('news') || url.includes('新闻')) return '新闻网站'
      if (url.includes('shopping') || url.includes('buy')) return '购物网站'
      if (url.includes('docs') || url.includes('document')) return '文档页面'
      
      return '信息网站'
    }
  
    /**
     * 猜测页面内容
     */
    private guessPageContent(url?: string): string {
      if (!url) return '通用'
      
      if (url.includes('tech') || url.includes('dev')) return '技术开发'
      if (url.includes('business')) return '商业'
      if (url.includes('education')) return '教育'
      if (url.includes('health')) return '健康'
      
      return '信息'
    }
  
    /**
     * 生成页面洞察
     */
    private generatePageInsight(url?: string): string {
      const insights = [
        '看起来内容很丰富',
        '应该包含了有用的信息',
        '是一个很有价值的资源',
        '值得仔细阅读'
      ]
      
      return insights[Math.floor(Math.random() * insights.length)]
    }
  
    /**
     * 模拟处理延迟
     */
    private async simulateProcessingDelay(): Promise<void> {
      const delay = Math.random() * 1000 + 500 // 500-1500ms 随机延迟
      return new Promise(resolve => setTimeout(resolve, delay))
    }
  }