import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { FloatButton } from './FloatButton'
import { ChatDialog } from './ChatDialog'
import { WebSocketService } from '../services/websocket'
import { AssistantConfig } from '../index'

interface AppProps {
  config: AssistantConfig
  wsService: WebSocketService
}

export function App({ config, wsService }: AppProps) {
  // 状态管理
  const [isOpen, setIsOpen] = useState(false) // 对话框是否打开
  const [isConnected, setIsConnected] = useState(false) // 是否连接到服务器
  const [messages, setMessages] = useState<any[]>([]) // 聊天消息列表

  // 组件挂载时连接WebSocket
  useEffect(() => {
    wsService.connect()

    // 监听连接状态
    wsService.on('status', (data: { connected: boolean }) => {
      setIsConnected(data.connected)
      if (data.connected) {
        console.log('🟢 已连接到智能助手服务器')
      } else {
        console.log('🔴 与服务器断开连接')
      }
    })

    // 监听服务器消息
    wsService.on('response', (data: any) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'assistant',
        content: data.content,
        timestamp: new Date()
      }])
    })

    // 清理函数
    return () => {
      wsService.disconnect()
    }
  }, [])

  // 发送消息
  const handleSendMessage = (content: string) => {
    // 添加用户消息到界面
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    // 发送到服务器
    wsService.sendMessage(content, {
      pageUrl: window.location.href,
      pageTitle: document.title,
      userAgent: navigator.userAgent
    })
  }

  // 清空聊天记录
  const handleClearMessages = () => {
    setMessages([])
  }

  return (
    <div className="web-assistant">
      {/* 悬浮按钮 */}
      <FloatButton 
        isConnected={isConnected}
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        unreadCount={0} // 后续可以加入未读消息数量
      />
      
      {/* 对话框 */}
      {isOpen && (
        <ChatDialog
          messages={messages}
          isConnected={isConnected}
          onSendMessage={handleSendMessage}
          onClear={handleClearMessages}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}