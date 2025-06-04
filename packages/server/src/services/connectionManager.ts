interface ConnectionInfo {
    apiKey: string
    clientInfo?: {
      userAgent?: string
      url?: string
      timestamp?: string
    }
    connectedAt: Date
    lastActivity?: Date
    messageCount?: number
  }
  
  export class ConnectionManager {
    private static connections: Map<string, ConnectionInfo> = new Map()
  
    /**
     * 添加新连接
     */
    static addConnection(socketId: string, info: ConnectionInfo): void {
      this.connections.set(socketId, {
        ...info,
        lastActivity: new Date(),
        messageCount: 0
      })
  
      console.log(`📊 当前连接数: ${this.connections.size}`)
      this.logConnectionInfo(socketId, info)
    }
  
    /**
     * 移除连接
     */
    static removeConnection(socketId: string): void {
      const connection = this.connections.get(socketId)
      if (connection) {
        const duration = Date.now() - connection.connectedAt.getTime()
        console.log(`📊 连接 ${socketId} 持续时间: ${Math.round(duration / 1000)}秒`)
        console.log(`📊 消息数量: ${connection.messageCount || 0}`)
      }
  
      this.connections.delete(socketId)
      console.log(`📊 当前连接数: ${this.connections.size}`)
    }
  
    /**
     * 更新连接活动时间
     */
    static updateActivity(socketId: string): void {
      const connection = this.connections.get(socketId)
      if (connection) {
        connection.lastActivity = new Date()
        connection.messageCount = (connection.messageCount || 0) + 1
      }
    }
  
    /**
     * 获取连接信息
     */
    static getConnection(socketId: string): ConnectionInfo | undefined {
      return this.connections.get(socketId)
    }
  
    /**
     * 获取所有连接
     */
    static getAllConnections(): Map<string, ConnectionInfo> {
      return new Map(this.connections)
    }
  
    /**
     * 获取连接数量
     */
    static getConnectionCount(): number {
      return this.connections.size
    }
  
    /**
     * 获取连接统计信息
     */
    static getStats(): {
      totalConnections: number
      activeConnections: number
      totalMessages: number
      averageSessionDuration: number
    } {
      const now = Date.now()
      let totalMessages = 0
      let totalDuration = 0
      let activeConnections = 0
  
      for (const [socketId, connection] of this.connections) {
        totalMessages += connection.messageCount || 0
        totalDuration += now - connection.connectedAt.getTime()
        
        // 5分钟内有活动算作活跃连接
        if (connection.lastActivity && (now - connection.lastActivity.getTime()) < 5 * 60 * 1000) {
          activeConnections++
        }
      }
  
      return {
        totalConnections: this.connections.size,
        activeConnections,
        totalMessages,
        averageSessionDuration: this.connections.size > 0 ? totalDuration / this.connections.size : 0
      }
    }
  
    /**
     * 清理不活跃的连接
     */
    static cleanupInactiveConnections(maxInactiveTime: number = 30 * 60 * 1000): number {
      const now = Date.now()
      let removedCount = 0
  
      for (const [socketId, connection] of this.connections) {
        const lastActivity = connection.lastActivity || connection.connectedAt
        if (now - lastActivity.getTime() > maxInactiveTime) {
          console.log(`🧹 清理不活跃连接: ${socketId}`)
          this.connections.delete(socketId)
          removedCount++
        }
      }
  
      return removedCount
    }
  
    /**
     * 按 API Key 统计连接
     */
    static getConnectionsByApiKey(): Map<string, number> {
      const apiKeyStats = new Map<string, number>()
  
      for (const connection of this.connections.values()) {
        const count = apiKeyStats.get(connection.apiKey) || 0
        apiKeyStats.set(connection.apiKey, count + 1)
      }
  
      return apiKeyStats
    }
  
    /**
     * 记录连接信息
     */
    private static logConnectionInfo(socketId: string, info: ConnectionInfo): void {
      console.log(`👤 新用户连接详情:`)
      console.log(`   Socket ID: ${socketId}`)
      console.log(`   API Key: ${info.apiKey.substring(0, 8)}...`)
      
      if (info.clientInfo) {
        console.log(`   页面: ${info.clientInfo.url || '未知'}`)
        console.log(`   浏览器: ${this.parseUserAgent(info.clientInfo.userAgent)}`)
      }
      
      console.log(`   时间: ${info.connectedAt.toLocaleString('zh-CN')}`)
    }
  
    /**
     * 解析用户代理字符串
     */
    private static parseUserAgent(userAgent?: string): string {
      if (!userAgent) return '未知浏览器'
  
      if (userAgent.includes('Chrome')) return 'Chrome'
      if (userAgent.includes('Firefox')) return 'Firefox'
      if (userAgent.includes('Safari')) return 'Safari'
      if (userAgent.includes('Edge')) return 'Edge'
      
      return '其他浏览器'
    }
  
    /**
     * 定期打印统计信息
     */
    static startStatsLogging(intervalMinutes: number = 10): void {
      setInterval(() => {
        const stats = this.getStats()
        
        if (stats.totalConnections > 0) {
          console.log(`\n📊 ===== 连接统计 =====`)
          console.log(`   总连接数: ${stats.totalConnections}`)
          console.log(`   活跃连接: ${stats.activeConnections}`)
          console.log(`   总消息数: ${stats.totalMessages}`)
          console.log(`   平均会话时长: ${Math.round(stats.averageSessionDuration / 1000)}秒`)
          console.log(`========================\n`)
        }
      }, intervalMinutes * 60 * 1000)
    }
  }