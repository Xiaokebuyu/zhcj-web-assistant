
import { useState, useRef, useEffect } from 'preact/hooks'

interface Message {
  id: number
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatDialogProps {
  messages: Message[]
  isConnected: boolean
  onSendMessage: (content: string) => void
  onClear: () => void
  onClose: () => void
}

export function ChatDialog({ 
  messages, 
  isConnected, 
  onSendMessage, 
  onClear, 
  onClose 
}: ChatDialogProps) {
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 对话框打开时聚焦输入框
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // 处理发送消息
  const handleSend = () => {
    const content = inputValue.trim()
    if (!content || !isConnected) return

    onSendMessage(content)
    setInputValue('')
    setIsLoading(true)

    // 模拟加载状态（实际项目中应该监听服务器响应）
    setTimeout(() => setIsLoading(false), 1000)
  }

  // 处理回车发送
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="chat-dialog">
      {/* 头部 */}
      <div className="chat-header">
        <div className="chat-title">
          <h3>智能助手</h3>
          <div className={`status-indicator ${isConnected ? 'online' : 'offline'}`}>
            {isConnected ? '已连接' : '未连接'}
          </div>
        </div>
        
        <div className="chat-actions">
          <button 
            className="clear-btn" 
            onClick={onClear}
            title="清空聊天记录"
          >
            🗑️
          </button>
          <button 
            className="close-btn" 
            onClick={onClose}
            title="关闭对话框"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p>你好！我是你的智能网页助手</p>
            <p>有什么可以帮你的吗？</p>
          </div>
        ) : (
          messages.map(message => (
            <div 
              key={message.id} 
              className={`message ${message.type}`}
            >
              <div className="message-content">
                {message.content}
              </div>
              <div className="message-time">
                {formatTime(message.timestamp)}
              </div>
            </div>
          ))
        )}
        
        {/* 加载指示器 */}
        {isLoading && (
          <div className="message assistant loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="chat-input">
        <div className="input-group">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue((e.target as HTMLInputElement).value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "输入消息..." : "未连接到服务器"}
            disabled={!isConnected}
            className="message-input"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || !isConnected}
            className="send-btn"
            title="发送消息"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path 
                d="M2 21l21-9L2 3v7l15 2-15 2v7z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        
        {!isConnected && (
          <div className="connection-warning">
            ⚠️ 连接已断开，正在尝试重连...
          </div>
        )}
      </div>
    </div>
  )
}