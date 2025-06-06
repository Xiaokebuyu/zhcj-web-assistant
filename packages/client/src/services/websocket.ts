import { io, Socket } from 'socket.io-client'

export class WebSocketService {
  private socket: Socket | null = null
  private maxReconnectAttempts = 5
  private eventHandlers: Map<string, Function[]> = new Map()

  constructor(
    private serverUrl: string,
    private apiKey: string
  ) {}

  // 连接到服务器
  connect() {
    if (this.socket?.connected) {
      console.log('已经连接到服务器')
      return
    }

    console.log(`🔄 正在连接到 ${this.serverUrl}`)

    this.socket = io(this.serverUrl, {
      auth: { 
        apiKey: this.apiKey,
        clientInfo: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        }
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 10000
    })

    this.setupEventHandlers()
  }

  // 设置事件监听
  private setupEventHandlers() {
    if (!this.socket) return

    // 连接成功
    this.socket.on('connect', () => {
      console.log('✅ 已连接到智能助手服务器')
      this.emit('status', { connected: true })
    })

    // 连接断开
    this.socket.on('disconnect', (reason) => {
      console.log('❌ 连接断开:', reason)
      this.emit('status', { connected: false, reason })
    })

    // 重连尝试
    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 重连尝试 ${attempt}/${this.maxReconnectAttempts}`)
      this.emit('reconnecting', { attempt, maxAttempts: this.maxReconnectAttempts })
    })

    // 重连成功
    this.socket.on('reconnect', (attempt) => {
      console.log(`✅ 重连成功，尝试了 ${attempt} 次`)
      this.emit('reconnected', { attempt })
    })

    // 重连失败
    this.socket.on('reconnect_failed', () => {
      console.error('❌ 重连失败，请检查网络连接')
      this.emit('reconnect_failed', {})
    })

    // 连接错误
    this.socket.on('connect_error', (error) => {
      console.error('❌ 连接错误:', error.message)
      this.emit('connect_error', { error: error.message })
    })

    // 接收服务器响应
    this.socket.on('response', (data) => {
      console.log('📥 收到服务器响应:', data)
      this.emit('response', data)
    })

    // 接收服务器错误
    this.socket.on('error', (error) => {
      console.error('❌ 服务器错误:', error)
      this.emit('error', error)
    })
  }

  // 发送消息到服务器
  sendMessage(content: string, context?: any) {
    if (!this.socket?.connected) {
      console.error('❌ 未连接到服务器，无法发送消息')
      this.emit('error', { message: '未连接到服务器' })
      return
    }

    const message = {
      id: this.generateMessageId(),
      content: content.trim(),
      context: {
        pageUrl: window.location.href,
        pageTitle: document.title,
        timestamp: new Date().toISOString(),
        ...context
      }
    }

    console.log('📤 发送消息:', message)
    this.socket.emit('message', message)
  }

  // 订阅事件
  on(event: string, handler: Function) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)!.push(handler)
  }

  // 取消订阅事件
  off(event: string, handler?: Function) {
    if (!this.eventHandlers.has(event)) return

    if (handler) {
      const handlers = this.eventHandlers.get(event)!
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    } else {
      this.eventHandlers.delete(event)
    }
  }

  // 触发事件
  private emit(event: string, data: any) {
    const handlers = this.eventHandlers.get(event) || []
    handlers.forEach(handler => {
      try {
        handler(data)
      } catch (error) {
        console.error(`事件处理器错误 [${event}]:`, error)
      }
    })
  }

  // 断开连接
  disconnect() {
    if (this.socket) {
      console.log('🔌 主动断开连接')
      this.socket.disconnect()
      this.socket = null
    }
  }

  // 获取连接状态
  get isConnected(): boolean {
    return this.socket?.connected || false
  }

  // 生成消息ID
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}