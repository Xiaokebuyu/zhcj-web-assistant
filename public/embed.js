(function(window, document) {
  'use strict';

  // 防止重复加载
  if (window.AIAssistant) {
    console.warn('AI Assistant 已经被加载过了');
    return;
  }

  // 默认配置
  const DEFAULT_CONFIG = {
    baseUrl: 'http://localhost:3000', // 生产环境需要改为实际域名
    position: 'bottom-right',
    theme: 'light',
    enableVoice: true,
    maxMessages: 50
  };

  // 主要的AI助手类
  class AIAssistant {
    constructor(options = {}) {
      this.config = { ...DEFAULT_CONFIG, ...options.config };
      this.containerId = options.containerId || null;
      this.onReady = options.onReady || null;
      this.onError = options.onError || null;
      this.isLoaded = false;
      this.iframe = null;
    }

    // 初始化助手
    init() {
      try {
        this.createContainer();
        this.loadStyles();
        this.loadAssistant();
      } catch (error) {
        console.error('AI Assistant 初始化失败:', error);
        if (this.onError) {
          this.onError(error);
        }
      }
    }

    // 创建容器
    createContainer() {
      if (this.containerId) {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
          throw new Error(`找不到容器元素: ${this.containerId}`);
        }
      } else {
        // 创建默认容器
        this.container = document.createElement('div');
        this.container.id = 'ai-assistant-container';
        this.container.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 2147483647;
        `;
        document.body.appendChild(this.container);
      }
    }

    // 加载样式（确保样式隔离）
    loadStyles() {
      const styleId = 'ai-assistant-styles';
      if (document.getElementById(styleId)) return;

      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        #ai-assistant-container * {
          box-sizing: border-box;
        }
        
        .ai-assistant-iframe {
          border: none;
          background: transparent;
          pointer-events: auto;
        }
      `;
      document.head.appendChild(style);
    }

    // 加载助手界面
    loadAssistant() {
      // 创建iframe来隔离样式和脚本
      this.iframe = document.createElement('iframe');
      this.iframe.className = 'ai-assistant-iframe';
      this.iframe.style.cssText = `
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: 2147483647;
        pointer-events: none;
        background: transparent;
      `;

      // 构建iframe源URL
      const params = new URLSearchParams({
        config: JSON.stringify(this.config),
        embedded: 'true'
      });
      
      this.iframe.src = `${this.config.baseUrl}/embed?${params.toString()}`;

      // 监听iframe加载
      this.iframe.onload = () => {
        this.isLoaded = true;
        if (this.onReady) {
          this.onReady();
        }
        this.setupMessageHandling();
      };

      this.iframe.onerror = (error) => {
        console.error('AI Assistant iframe 加载失败:', error);
        if (this.onError) {
          this.onError(new Error('助手加载失败'));
        }
      };

      this.container.appendChild(this.iframe);
    }

    // 设置消息通信
    setupMessageHandling() {
      window.addEventListener('message', (event) => {
        // 验证消息来源
        if (event.origin !== new URL(this.config.baseUrl).origin) {
          return;
        }

        const { type, data } = event.data;

        switch (type) {
          case 'ai-assistant-ready':
            console.log('AI Assistant 准备就绪');
            break;
          
          case 'ai-assistant-resize':
            this.handleResize(data);
            break;
          
          case 'ai-assistant-error':
            console.error('AI Assistant 错误:', data);
            if (this.onError) {
              this.onError(new Error(data.message));
            }
            break;
          
          default:
            // 忽略未知消息类型
            break;
        }
      });

      // 发送初始化消息给iframe
      this.postMessage('init', { config: this.config });
    }

    // 发送消息给iframe
    postMessage(type, data = {}) {
      if (this.iframe && this.iframe.contentWindow) {
        this.iframe.contentWindow.postMessage(
          { type: `ai-assistant-${type}`, data },
          this.config.baseUrl
        );
      }
    }

    // 处理大小调整
    handleResize(data) {
      if (this.iframe) {
        // 这里可以根据需要调整iframe大小
        // 目前保持全屏
      }
    }

    // 显示助手
    show() {
      this.postMessage('show');
    }

    // 隐藏助手
    hide() {
      this.postMessage('hide');
    }

    // 销毁助手
    destroy() {
      if (this.iframe) {
        this.iframe.remove();
        this.iframe = null;
      }
      
      if (this.container && this.container.id === 'ai-assistant-container') {
        this.container.remove();
      }
      
      this.isLoaded = false;
    }

    // 更新配置
    updateConfig(newConfig) {
      this.config = { ...this.config, ...newConfig };
      this.postMessage('updateConfig', { config: this.config });
    }
  }

  // 创建全局构造函数
  window.AIAssistant = AIAssistant;

  // 提供便捷的初始化方法
  window.initAIAssistant = function(options = {}) {
    const assistant = new AIAssistant(options);
    assistant.init();
    return assistant;
  };

  // 自动初始化（如果页面上有配置）
  document.addEventListener('DOMContentLoaded', function() {
    // 检查是否有自动初始化配置
    const autoInitScript = document.querySelector('script[data-ai-assistant-auto]');
    if (autoInitScript) {
      try {
        const config = JSON.parse(autoInitScript.getAttribute('data-config') || '{}');
        window.initAIAssistant({ config });
      } catch (error) {
        console.error('AI Assistant 自动初始化失败:', error);
      }
    }
  });

})(window, document); 