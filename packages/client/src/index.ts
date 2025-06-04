import { render, h } from 'preact'
import { App } from './components/App'
import { WebSocketService } from './services/websocket'
import './styles/main.css'

// 这就是别人网站调用我们的接口
export interface AssistantConfig {
  apiKey: string
  serverUrl?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  theme?: 'light' | 'dark' | 'auto'
}

export class WebAssistant {
  private static instance: WebAssistant | null = null
  private wsService: WebSocketService
  private container: HTMLElement | null = null

  constructor(private config: AssistantConfig) {
    // 默认配置
    this.config = {
      serverUrl: 'http://localhost:3001',
      position: 'bottom-right',
      theme: 'auto',
      ...config
    }

    // 创建WebSocket连接服务
    this.wsService = new WebSocketService(
      this.config.serverUrl!,
      this.config.apiKey
    )
  }

  // 单例模式 - 确保整个页面只有一个助手
  static init(config: AssistantConfig): WebAssistant {
    if (WebAssistant.instance) {
      console.warn('WebAssistant 已经初始化过了')
      return WebAssistant.instance
    }

    WebAssistant.instance = new WebAssistant(config)
    WebAssistant.instance.mount()
    return WebAssistant.instance
  }

  // 把悬浮组件挂载到页面上
  private mount() {
    // 创建容器div
    this.container = document.createElement('div')
    this.container.id = 'web-assistant-root'
    this.container.style.cssText = `
      position: fixed;
      z-index: 999999;
      pointer-events: none;
    `
    
    // 根据位置设置样式
    this.setPosition()
    
    // 添加到页面
    document.body.appendChild(this.container)

    // 渲染React组件
    render(
      h(App, { 
        config: this.config, 
        wsService: this.wsService 
      }), 
      this.container
    )

    console.log('✅ WebAssistant 已启动')
  }

  // 设置悬浮球位置
  private setPosition() {
    if (!this.container) return

    const positions = {
      'bottom-right': { bottom: '20px', right: '20px' },
      'bottom-left': { bottom: '20px', left: '20px' },
      'top-right': { top: '20px', right: '20px' },
      'top-left': { top: '20px', left: '20px' }
    }

    const pos = positions[this.config.position!]
    Object.assign(this.container.style, pos)
  }

  // 销毁实例
  static destroy() {
    if (WebAssistant.instance?.container) {
      WebAssistant.instance.container.remove()
      WebAssistant.instance = null
    }
  }
}

// 如果是直接在浏览器中使用，挂载到window对象
if (typeof window !== 'undefined') {
  (window as any).WebAssistant = WebAssistant
}