(function(window, document) {
  'use strict';

  // 防止重复加载
  if (window.AIAssistant) {
    console.warn('AI Assistant 已经被加载过了');
    return;
  }

  // 默认配置
  const DEFAULT_CONFIG = {
    baseUrl: 'http://localhost:3000',
    position: 'bottom-right',
    theme: 'light',
    enableVoice: true,
    maxMessages: 50,
    // 新增：页面感知配置
    enablePageContext: true,
    contextDepth: 'medium', // 'light', 'medium', 'full'
    autoUpdateContext: true, // 页面变化时自动更新上下文
    contextUpdateInterval: 5000 // 5秒检查一次页面变化
  };

  // 页面内容提取器
  class PageContextExtractor {
    constructor(config = {}) {
      this.config = config;
      this.lastHash = '';
      this.lastTitle = '';
      this.observer = null;
    }

    // 提取页面基本信息
    extractBasicInfo() {
      return {
        url: window.location.href,
        title: document.title,
        domain: window.location.hostname,
        pathname: window.location.pathname,
        timestamp: new Date().toISOString()
      };
    }

    // 提取页面主要内容
    extractPageContent(depth = 'medium') {
      const content = {
        basic: this.extractBasicInfo(),
        meta: this.extractMetaData(),
        headings: this.extractHeadings(),
        mainContent: this.extractMainContent(depth),
        navigation: this.extractNavigation(),
        pageType: this.detectPageType()
      };

      return content;
    }

    // 提取meta信息
    extractMetaData() {
      const metaData = {};
      
      // 基本meta标签
      const metaTags = document.querySelectorAll('meta[name], meta[property]');
      metaTags.forEach(tag => {
        const name = tag.getAttribute('name') || tag.getAttribute('property');
        const content = tag.getAttribute('content');
        if (name && content) {
          metaData[name] = content;
        }
      });

      return metaData;
    }

    // 提取标题结构
    extractHeadings() {
      const headings = [];
      const headingTags = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      headingTags.forEach(heading => {
        headings.push({
          level: parseInt(heading.tagName.substring(1)),
          text: heading.textContent.trim(),
          id: heading.id || null
        });
      });

      return headings;
    }

    // 提取主要内容
    extractMainContent(depth) {
      let content = {
        summary: '',
        sections: [],
        keyElements: []
      };

      try {
        // 尝试找到主要内容区域
        const mainSelectors = [
          'main',
          '[role="main"]',
          '.main-content',
          '.content',
          'article',
          '.post-content',
          '.page-content'
        ];

        let mainElement = null;
        for (const selector of mainSelectors) {
          mainElement = document.querySelector(selector);
          if (mainElement) break;
        }

        // 如果没找到main区域，则使用body但排除常见的非内容元素
        if (!mainElement) {
          mainElement = document.body;
        }

        if (depth === 'light') {
          // 轻量模式：只提取标题和简短描述
          content.summary = this.extractTextSummary(mainElement, 200);
        } else if (depth === 'medium') {
          // 中等模式：提取主要段落和重要元素
          content.summary = this.extractTextSummary(mainElement, 500);
          content.sections = this.extractSections(mainElement);
          content.keyElements = this.extractKeyElements(mainElement);
        } else if (depth === 'full') {
          // 完整模式：详细提取内容
          content.summary = this.extractTextSummary(mainElement, 1000);
          content.sections = this.extractSections(mainElement);
          content.keyElements = this.extractKeyElements(mainElement);
          content.fullText = this.extractCleanText(mainElement, 2000);
        }
      } catch (error) {
        console.warn('内容提取失败:', error);
        content.summary = document.title || '无法提取页面内容';
      }

      return content;
    }

    // 提取文本摘要
    extractTextSummary(element, maxLength = 500) {
      // 排除不需要的元素
      const excludeSelectors = [
        'script', 'style', 'nav', 'header', 'footer', 
        '.advertisement', '.ads', '.sidebar', '.menu',
        '.comments', '.comment', '.social-share'
      ];

      let text = '';
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            // 检查父元素是否应该被排除
            for (const selector of excludeSelectors) {
              if (node.parentElement?.closest(selector)) {
                return NodeFilter.FILTER_REJECT;
              }
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      while (walker.nextNode()) {
        const nodeText = walker.currentNode.textContent?.trim();
        if (nodeText && nodeText.length > 10) {
          text += nodeText + ' ';
          if (text.length > maxLength) break;
        }
      }

      return text.slice(0, maxLength).trim();
    }

    // 提取段落和章节
    extractSections(element) {
      const sections = [];
      const sectionElements = element.querySelectorAll('section, article, .section, p');

      sectionElements.forEach((el, index) => {
        const text = el.textContent?.trim();
        if (text && text.length > 50 && sections.length < 10) {
          sections.push({
            index,
            tag: el.tagName.toLowerCase(),
            text: text.slice(0, 300),
            className: el.className || null
          });
        }
      });

      return sections;
    }

    // 提取关键元素
    extractKeyElements(element) {
      const keyElements = [];

      // 提取链接
      const links = element.querySelectorAll('a[href]');
      const importantLinks = Array.from(links)
        .filter(link => link.textContent?.trim().length > 5)
        .slice(0, 10)
        .map(link => ({
          type: 'link',
          text: link.textContent.trim(),
          href: link.href
        }));

      // 提取图片
      const images = element.querySelectorAll('img[alt], img[title]');
      const importantImages = Array.from(images)
        .slice(0, 5)
        .map(img => ({
          type: 'image',
          alt: img.alt || img.title || '图片',
          src: img.src
        }));

      // 提取列表
      const lists = element.querySelectorAll('ul, ol');
      const importantLists = Array.from(lists)
        .slice(0, 3)
        .map(list => ({
          type: 'list',
          items: Array.from(list.querySelectorAll('li'))
            .slice(0, 5)
            .map(li => li.textContent?.trim())
            .filter(text => text && text.length > 5)
        }));

      return [...importantLinks, ...importantImages, ...importantLists];
    }

    // 提取导航信息
    extractNavigation() {
      const nav = {};
      
      // 面包屑导航
      const breadcrumbs = document.querySelectorAll('.breadcrumb a, .breadcrumbs a, nav[aria-label*="breadcrumb"] a');
      if (breadcrumbs.length > 0) {
        nav.breadcrumbs = Array.from(breadcrumbs).map(link => ({
          text: link.textContent?.trim(),
          href: link.href
        }));
      }

      // 主导航
      const mainNav = document.querySelector('nav, .navigation, .main-nav, .primary-nav');
      if (mainNav) {
        const navLinks = mainNav.querySelectorAll('a');
        nav.mainNavigation = Array.from(navLinks)
          .slice(0, 10)
          .map(link => ({
            text: link.textContent?.trim(),
            href: link.href,
            active: link.classList.contains('active') || link.classList.contains('current')
          }));
      }

      return nav;
    }

    // 检测页面类型
    detectPageType() {
      const url = window.location.pathname.toLowerCase();
      const title = document.title.toLowerCase();
      const bodyClass = document.body.className.toLowerCase();

      // 根据URL、标题、body class等判断页面类型
      if (url.includes('/blog/') || url.includes('/post/') || bodyClass.includes('post')) {
        return 'blog_post';
      } else if (url.includes('/product/') || bodyClass.includes('product')) {
        return 'product';
      } else if (url.includes('/about') || title.includes('about')) {
        return 'about';
      } else if (url.includes('/contact') || title.includes('contact')) {
        return 'contact';
      } else if (url === '/' || url === '/index' || url === '/home') {
        return 'homepage';
      } else if (url.includes('/portfolio') || url.includes('/work') || bodyClass.includes('portfolio')) {
        return 'portfolio';
      } else {
        return 'general';
      }
    }

    // 提取干净的文本内容
    extractCleanText(element, maxLength = 2000) {
      // 创建一个副本以避免修改原DOM
      const clone = element.cloneNode(true);
      
      // 移除不需要的元素
      const unwantedSelectors = [
        'script', 'style', 'nav', 'header', 'footer',
        '.advertisement', '.ads', '.sidebar', '.menu',
        '.comments', '.social-share', 'button'
      ];
      
      unwantedSelectors.forEach(selector => {
        const elements = clone.querySelectorAll(selector);
        elements.forEach(el => el.remove());
      });

      const text = clone.textContent || '';
      return text.replace(/\s+/g, ' ').trim().slice(0, maxLength);
    }

    // 监听页面变化
    startObserver(callback) {
      if (this.observer) {
        this.observer.disconnect();
      }

      // 监听DOM变化
      this.observer = new MutationObserver((mutations) => {
        let hasSignificantChange = false;
        
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // 检查是否有重要内容添加
            for (const node of mutation.addedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName?.toLowerCase();
                if (['main', 'article', 'section', 'div'].includes(tagName)) {
                  hasSignificantChange = true;
                  break;
                }
              }
            }
          }
        });

        if (hasSignificantChange) {
          callback();
        }
      });

      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false
      });

      // 监听URL变化（SPA应用）
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;

      history.pushState = function(...args) {
        originalPushState.apply(history, args);
        setTimeout(callback, 100); // 延迟一下确保DOM更新完成
      };

      history.replaceState = function(...args) {
        originalReplaceState.apply(history, args);
        setTimeout(callback, 100);
      };

      window.addEventListener('popstate', callback);
    }

    // 停止监听
    stopObserver() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    }
  }

  // 增强的AI助手类
  class AIAssistant {
    constructor(options = {}) {
      this.config = { ...DEFAULT_CONFIG, ...options.config };
      this.containerId = options.containerId || null;
      this.onReady = options.onReady || null;
      this.onError = options.onError || null;
      this.isLoaded = false;
      this.iframe = null;
      
      // 页面上下文相关
      this.pageExtractor = null;
      this.currentContext = null;
      this.contextUpdateTimer = null;

      if (this.config.enablePageContext) {
        this.initPageContext();
      }
    }

    // 初始化页面上下文功能
    initPageContext() {
      this.pageExtractor = new PageContextExtractor(this.config);
      this.updatePageContext();

      if (this.config.autoUpdateContext) {
        this.startContextMonitoring();
      }
    }

    // 更新页面上下文
    updatePageContext() {
      if (!this.pageExtractor) return;

      try {
        console.log('开始提取页面上下文...');
        this.currentContext = this.pageExtractor.extractPageContent(this.config.contextDepth);
        console.log('页面上下文提取完成:', this.currentContext);
        
        // 如果助手已加载，发送更新的上下文
        if (this.isLoaded && this.iframe) {
          console.log('发送上下文到iframe...');
          this.postMessage('updateContext', { context: this.currentContext });
        } else {
          console.log('iframe未准备好，上下文将在初始化时发送');
        }
      } catch (error) {
        console.warn('页面上下文更新失败:', error);
      }
    }

    // 开始监控页面变化
    startContextMonitoring() {
      if (!this.pageExtractor) return;

      // 设置定时器检查页面变化
      this.contextUpdateTimer = setInterval(() => {
        const currentUrl = window.location.href;
        const currentTitle = document.title;
        
        if (this.lastUrl !== currentUrl || this.lastTitle !== currentTitle) {
          this.updatePageContext();
          this.lastUrl = currentUrl;
          this.lastTitle = currentTitle;
        }
      }, this.config.contextUpdateInterval);

      // 设置页面变化观察器
      this.pageExtractor.startObserver(() => {
        setTimeout(() => this.updatePageContext(), 1000); // 延迟1秒确保内容加载完成
      });
    }

    // 停止监控页面变化
    stopContextMonitoring() {
      if (this.contextUpdateTimer) {
        clearInterval(this.contextUpdateTimer);
        this.contextUpdateTimer = null;
      }

      if (this.pageExtractor) {
        this.pageExtractor.stopObserver();
      }
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

    // 加载样式
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

      const params = new URLSearchParams({
        config: JSON.stringify(this.config),
        embedded: 'true'
      });
      
      this.iframe.src = `${this.config.baseUrl}/embed?${params.toString()}`;

      this.iframe.onload = () => {
        this.isLoaded = true;
        if (this.onReady) {
          this.onReady();
        }
        this.setupMessageHandling();
        
        // 发送初始页面上下文
        if (this.currentContext) {
          this.postMessage('updateContext', { context: this.currentContext });
        }
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
        if (event.origin !== new URL(this.config.baseUrl).origin) {
          return;
        }

        const { type, data } = event.data;
        console.log('父页面收到消息:', type, data); // 添加调试日志

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

          case 'ai-assistant-requestPageContext':
            // 助手请求页面上下文
            console.log('收到上下文请求，开始更新页面上下文...');
            this.updatePageContext();
            break;
          
          default:
            break;
        }
      });

      this.postMessage('init', { 
        config: this.config,
        context: this.currentContext 
      });
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
        // 可根据需要调整iframe大小
      }
    }

    // 公共API方法
    show() {
      this.postMessage('show');
    }

    hide() {
      this.postMessage('hide');
    }

    // 手动更新页面上下文
    refreshContext() {
      this.updatePageContext();
    }

    // 获取当前页面上下文（用于调试）
    getPageContext() {
      return this.currentContext;
    }

    // 销毁助手
    destroy() {
      this.stopContextMonitoring();
      
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

  // 自动初始化
  document.addEventListener('DOMContentLoaded', function() {
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