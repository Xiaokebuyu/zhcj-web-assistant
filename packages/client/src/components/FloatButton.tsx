

interface FloatButtonProps {
  isConnected: boolean
  isOpen: boolean
  onClick: () => void
  unreadCount?: number
}

export function FloatButton({ isConnected, isOpen, onClick, unreadCount = 0 }: FloatButtonProps) {
  return (
    <button
      className={`float-button ${isOpen ? 'open' : ''} ${isConnected ? 'connected' : 'disconnected'}`}
      onClick={onClick}
      title={isConnected ? '智能助手已连接' : '智能助手未连接'}
    >
      {/* 图标 */}
      <div className="float-button-icon">
        {isOpen ? (
          // 关闭图标
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path 
              d="M18 6L6 18M6 6l12 12" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          // 聊天图标
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path 
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* 连接状态指示器 */}
      <div className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`} />

      {/* 未读消息数量 */}
      {unreadCount > 0 && (
        <div className="unread-badge">
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}

      {/* 波纹效果 */}
      <div className="ripple-effect" />
    </button>
  )
}