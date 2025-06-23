'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MessageCircle, X, Search, Send, Mic, Copy, ThumbsUp, ThumbsDown, ChevronRight, FileText, Volume2, VolumeX, Settings, Square, RefreshCw, Phone, Sparkles, Minus } from 'lucide-react';
import { ReasoningChatMessage, AssistantConfig, VoiceState, VoiceSettings, STTConfig, StreamingSTTEvent, ToolCall, ToolProgress, PageContext, ContextStatus, ChatRequest, AssistantMode, VoiceCallState, DoubaoVoiceConfig, UnifiedChatResponse } from '@/types';

// 本地类型定义
interface SearchResult {
  name: string;
  url: string;
  snippet: string;
  summary?: string;
  siteName: string;
  datePublished?: string;
  siteIcon?: string;
}

// 已移动到统一类型定义中
import { StreamingSpeechRecognition } from '@/utils/streamingSpeechRecognition';
import { toolDefinitions } from '@/utils/toolManager';
import { VoiceCallMode } from './VoiceCall/VoiceCallMode';
import { VoiceCallManager } from '@/utils/voiceCallManager';
import { UnifiedMessage } from './UnifiedMessage';

interface FloatingAssistantProps {
  config?: AssistantConfig;
  onError?: (error: Error) => void;
}

const VOICE_OPTIONS = [
  { id: 'xiaoxiao', name: '晓晓（温柔女声）' },
  { id: 'xiaoyi', name: '晓伊（活泼女声）' },
  { id: 'yunjian', name: '云健（成熟男声）' },
  { id: 'yunxi', name: '云希（年轻男声）' },
  { id: 'xiaomo', name: '晓墨（甜美女声）' },
  { id: 'xiaoxuan', name: '晓萱（知性女声）' },
];

export default function FloatingAssistant({ config = {}, onError }: FloatingAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ReasoningChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // 助手模式状态
  const [assistantMode, setAssistantMode] = useState<AssistantMode>('text');
  
  // 语音通话状态
  const [voiceCallState, setVoiceCallState] = useState<VoiceCallState>({
    mode: 'text',
    isCallActive: false,
    connectionStatus: 'idle',
    callDuration: 0,
    realtimeTranscript: '',
    audioQuality: 'medium',
    lastActivity: Date.now()
  });
  
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isPlaying: false,
    isLoading: false,
    currentTranscript: '',
    finalTranscript: '',
    isStreamingActive: false,
    confidence: 0
  });
  
  // 语音设置
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voice: 'xiaoxiao',
    rate: '0%',
    pitch: '0%',
    volume: '0%',
    autoPlay: true,
  });

  // 工具调用状态
  const [toolProgress, setToolProgress] = useState<ToolProgress>({
    isToolCalling: false,
    progress: '',
    step: 0,
    totalSteps: 0
  });

  // 页面上下文相关状态
  const [pageContext, setPageContext] = useState<PageContext | null>(null);
  const [contextStatus, setContextStatus] = useState<ContextStatus>('disabled');
  const [lastContextUpdate, setLastContextUpdate] = useState<Date | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // 语音识别实例
  const sttInstance = useRef<StreamingSpeechRecognition | null>(null);
  const transcriptTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 语音通话管理器
  const voiceCallManager = useRef<VoiceCallManager | null>(null);

  const {
    position = 'bottom-right',
    enableVoice = true,
    enablePageContext = true
  } = config;
  
  // 获取位置样式的函数
  const getPositionStyles = useCallback(() => {
    return 'fixed bottom-6 right-6';
  }, []);
  
  // 豆包语音配置
  const doubaoVoiceConfig: DoubaoVoiceConfig = useMemo(() => ({
    apiAppId: '2139817228', // 使用固定的豆包API配置
    apiAccessKey: 'LMxFTYn2mmWwQwmLfT3ZbwS4yj0JPiMt',
    apiResourceId: 'volc.speech.dialog',
    baseUrl: '', // 这里将被动态设置
    audioConfig: {
      inputSampleRate: 16000,
      outputSampleRate: 24000,
      channels: 1,
      format: 'pcm',
      chunk: 3200
    }
  }), []);

  // STT配置
  const sttConfig: STTConfig = useMemo(() => ({
    language: 'zh-CN',
    continuous: true,
    interimResults: true,
    maxAlternatives: 1
  }), []);

  // 语音通话状态更新回调
  const handleVoiceCallStateChange = useCallback((newState: VoiceCallState) => {
    setVoiceCallState(newState);
  }, []);

  // 实时转录更新回调
  const handleTranscriptUpdate = useCallback((transcript: string) => {
    // 更新实时转录状态
    setVoiceCallState(prev => ({
      ...prev,
      realtimeTranscript: transcript
    }));
  }, []);

  // 音频可视化数据回调
  const handleVisualizationData = useCallback(() => {
    // 可以在这里处理音频可视化数据
    // 暂时不需要特殊处理
  }, []);

  // 开始语音通话
  const startVoiceCall = useCallback(async () => {
    if (voiceCallManager.current) {
      console.warn('语音通话已在进行中');
      return;
    }

    try {
      console.log('正在启动语音通话...');
      
      // 先调用API开始会话
      const response = await fetch('/api/voice/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioQuality: voiceCallState.audioQuality
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`启动语音通话失败: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('语音通话API响应:', data);
      
      if (!data.success || !data.sessionId || !data.wsUrl) {
        throw new Error(data.error || '获取会话信息失败');
      }

      // 更新配置中的WebSocket URL
      const updatedConfig: DoubaoVoiceConfig = {
        ...doubaoVoiceConfig,
        baseUrl: data.wsUrl
      };

      console.log('创建语音通话管理器，WebSocket URL:', data.wsUrl);

      // 创建语音通话管理器
      voiceCallManager.current = new VoiceCallManager(
        updatedConfig,
        data.sessionId,
        handleVoiceCallStateChange,
        handleTranscriptUpdate,
        handleVisualizationData
      );

      // 开始通话
      await voiceCallManager.current.startCall();
      
      // 切换到语音通话模式
      setAssistantMode('voice-call');

    } catch (error) {
      console.error('开始语音通话失败:', error);
      
      let errorMessage = '语音通话启动失败';
      if (error instanceof Error) {
        if (error.message.includes('WebSocket')) {
          errorMessage = '语音服务连接失败。由于浏览器安全限制，直接连接到豆包服务存在技术限制。建议：\n1. 检查网络连接\n2. 使用HTTPS访问\n3. 或联系开发者配置代理服务器';
        } else if (error.message.includes('麦克风')) {
          errorMessage = '麦克风访问失败。请检查浏览器权限设置，确保允许访问麦克风。';
        } else {
          errorMessage = error.message;
        }
      }
      
      if (onError) {
        onError(new Error(errorMessage));
      }
      
      // 重置状态
      setVoiceCallState(prev => ({
        ...prev,
        connectionStatus: 'error',
        isCallActive: false
      }));
      
      // 清理管理器
      if (voiceCallManager.current) {
        voiceCallManager.current.dispose();
        voiceCallManager.current = null;
      }
    }
  }, [voiceCallState.audioQuality, doubaoVoiceConfig, handleVoiceCallStateChange, handleTranscriptUpdate, handleVisualizationData, onError]);

  // 结束语音通话
  const endVoiceCall = useCallback(async () => {
    console.log('正在结束语音通话...');
    
    try {
      if (voiceCallManager.current) {
        console.log('调用VoiceCallManager.endCall');
        await voiceCallManager.current.endCall('user_hangup');
        voiceCallManager.current = null;
        console.log('VoiceCallManager已清理');
      }
      
      // 切换回文字模式
      console.log('切换回文字模式');
      setAssistantMode('text');
      
      // 重置语音通话状态
      setVoiceCallState({
        mode: 'text',
        isCallActive: false,
        connectionStatus: 'idle',
        callDuration: 0,
        realtimeTranscript: '',
        audioQuality: 'medium',
        lastActivity: Date.now()
      });
      
      console.log('语音通话已成功结束');
    } catch (error) {
      console.error('结束语音通话时出错:', error);
      // 即使出错也要确保状态重置
      setAssistantMode('text');
      setVoiceCallState(prev => ({
        ...prev,
        mode: 'text',
        isCallActive: false,
        connectionStatus: 'idle'
      }));
    }
  }, []);

  // 切换静音
  const toggleVoiceCallMute = useCallback(() => {
    console.log('切换静音状态');
    if (voiceCallManager.current) {
      voiceCallManager.current.toggleMute();
    }
  }, []);

  // 切换暂停
  const toggleVoiceCallPause = useCallback(() => {
    console.log('切换暂停状态');
    if (voiceCallManager.current) {
      voiceCallManager.current.togglePause();
    }
  }, []);

  // 模式切换
  const switchMode = useCallback((mode: AssistantMode) => {
    if (mode === assistantMode) return;

    if (mode === 'voice-call') {
      startVoiceCall();
    } else {
      // 切换到文字模式
      if (voiceCallManager.current) {
        endVoiceCall();
      }
      setAssistantMode('text');
    }
  }, [assistantMode, startVoiceCall, endVoiceCall]);

  // 直接提取当前页面上下文的函数
  const extractCurrentPageContext = useCallback(() => {
    try {
      console.log('开始提取当前页面上下文...');

      // 提取meta信息
      const metaData: Record<string, string> = {};
      const metaTags = document.querySelectorAll('meta[name], meta[property]');
      metaTags.forEach(tag => {
        const name = tag.getAttribute('name') || tag.getAttribute('property');
        const content = tag.getAttribute('content');
        if (name && content) {
          metaData[name] = content;
        }
      });

      // 提取标题结构
      const headings: Array<{level: number, text: string, id?: string}> = [];
      const headingTags = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headingTags.forEach(heading => {
        headings.push({
          level: parseInt(heading.tagName.substring(1)),
          text: heading.textContent?.trim() || '',
          id: heading.id || undefined
        });
      });

      // 提取主要内容
      const extractTextSummary = (maxLength = 500) => {
        const excludeSelectors = [
          'script', 'style', 'nav', 'header', 'footer',
          '.debug-panel', '.btn', '.status'
        ];

        let text = '';
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: function(node) {
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
      };

      // 检测页面类型
      const detectPageType = () => {
        const title = document.title.toLowerCase();
        const url = window.location.pathname.toLowerCase();
        
        if (url.includes('about') || title.includes('about')) return 'about';
        if (url.includes('contact') || title.includes('contact')) return 'contact';
        if (url.includes('blog') || title.includes('blog')) return 'blog_post';
        if (url.includes('product') || title.includes('product')) return 'product';
        if (url.includes('portfolio') || title.includes('portfolio')) return 'portfolio';
        if (url === '/' || url === '/index.html') return 'homepage';
        
        return 'general';
      };

      const context: PageContext = {
        basic: {
          title: document.title,
          url: window.location.href,
          description: metaData.description || metaData['og:description'] || '',
          type: detectPageType()
        },
        content: {
          text: extractTextSummary(500),
          headings: headings.map(h => h.text),
          links: [],
          images: []
        },
        metadata: {
          author: metaData.author || metaData['article:author'] || undefined,
          publishDate: metaData['article:published_time'] || undefined,
          keywords: metaData.keywords ? metaData.keywords.split(',').map(k => k.trim()) : undefined,
          language: metaData.language || document.documentElement.lang || 'zh-CN'
        },
        structure: {
          wordCount: extractTextSummary(5000).split(/\s+/).length,
          readingTime: Math.ceil(extractTextSummary(5000).split(/\s+/).length / 200), // 假设每分钟200字
          sections: headings.map(h => h.text)
        },
        extracted: {
          summary: extractTextSummary(300),
          keyPoints: headings.slice(0, 5).map(h => h.text),
          categories: []
        }
      };

      console.log('页面上下文提取完成:', context);
      setPageContext(context);
      setContextStatus('ready');
      setLastContextUpdate(new Date());
      
    } catch (error) {
      console.error('页面上下文提取失败:', error);
      setContextStatus('error');
    }
  }, []);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 监听来自父页面的消息（页面上下文）
  useEffect(() => {
    if (!enablePageContext) return;

    const isInIframe = window.parent && window.parent !== window;
    
    if (!isInIframe) {
      // 不在iframe环境中，直接提取当前页面上下文
      console.log('初始化时直接提取页面上下文');
      extractCurrentPageContext();
    }

    const handleMessage = (event: MessageEvent) => {
      const { type, data } = event.data;
      console.log('FloatingAssistant 收到消息:', type, data); // 添加调试日志
      
      switch (type) {
        case 'ai-assistant-updateContext':
          console.log('收到上下文更新消息');
          if (data.context) {
            setPageContext(data.context);
            setContextStatus('ready');
            setLastContextUpdate(new Date());
            console.log('页面上下文已更新:', data.context.basic?.title);
          }
          break;
          
        case 'ai-assistant-init':
          console.log('收到初始化消息');
          if (data.context) {
            setPageContext(data.context);
            setContextStatus('ready');
            setLastContextUpdate(new Date());
            console.log('初始页面上下文已设置:', data.context.basic?.title);
          }
          break;
      }
    };

    console.log('设置消息监听器...');
    window.addEventListener('message', handleMessage);
    return () => {
      console.log('移除消息监听器...');
      window.removeEventListener('message', handleMessage);
    };
  }, [enablePageContext, extractCurrentPageContext]);

  // 停止语音识别 - 会发送当前文本
  const stopListening = useCallback(() => {
    // 清除超时
    if (transcriptTimeoutRef.current) {
      clearTimeout(transcriptTimeoutRef.current);
      transcriptTimeoutRef.current = null;
    }
    
    if (sttInstance.current) {
      sttInstance.current.stop();
    }
  }, []);

  // 强制停止语音识别 - 不发送文本，直接取消
  const abortListening = useCallback(() => {
    // 清除超时
    if (transcriptTimeoutRef.current) {
      clearTimeout(transcriptTimeoutRef.current);
      transcriptTimeoutRef.current = null;
    }
    
    if (sttInstance.current) {
      sttInstance.current.abort();
    }
    
    setVoiceState(prev => ({
      ...prev,
      isListening: false,
      isStreamingActive: false,
      isLoading: false,
      currentTranscript: '',
      finalTranscript: ''
    }));
  }, []);

  // 生成语音
  const generateSpeech = useCallback(async (text: string): Promise<string | null> => {
    if (!enableVoice || !text.trim()) return null;

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: voiceSettings.voice,
          rate: voiceSettings.rate,
          pitch: voiceSettings.pitch,
          volume: voiceSettings.volume,
        }),
      });

      if (!response.ok) {
        throw new Error('语音生成失败');
      }

      // 创建音频URL
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      return audioUrl;
    } catch (error) {
      console.error('语音生成错误:', error);
      return null;
    }
  }, [enableVoice, voiceSettings]);

  // 播放语音
  const playAudio = useCallback((audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(error => {
        console.error('音频播放失败:', error);
      });
    }
  }, []);

  // 获取工具显示名称
  const getToolDisplayName = useCallback((toolName: string): string => {
    const toolNames: Record<string, string> = {
      'get_weather': '天气查询',
      'web_search': '网络搜索',
      // OpenManus工具
      'openmanus_web_automation': '网页自动化',
      'openmanus_code_execution': '代码执行',
      'openmanus_file_operations': '文件操作',
      'openmanus_general_task': 'AI智能代理'
    };
    return toolNames[toolName] || toolName;
  }, []);

  // 请求页面上下文更新
  const requestContextUpdate = useCallback(() => {
    if (!enablePageContext) return;
    
    console.log('请求页面上下文更新...');
    setContextStatus('loading');
    
    // 检查是否在iframe环境中
    const isInIframe = window.parent && window.parent !== window;
    
    if (isInIframe) {
      // 在iframe中，向父页面请求上下文
      console.log('发送requestPageContext消息到父页面');
      window.parent.postMessage(
        { type: 'ai-assistant-requestPageContext' },
        '*'
      );
    } else {
      // 不在iframe中，直接提取当前页面上下文
      console.log('不在iframe环境中，直接提取当前页面上下文');
      extractCurrentPageContext();
    }
    
    // 如果3秒后还没收到回复，标记为错误
    setTimeout(() => {
      if (contextStatus === 'loading') {
        console.log('3秒超时，标记上下文获取失败');
        setContextStatus('error');
      }
    }, 3000);
  }, [enablePageContext, contextStatus, extractCurrentPageContext]);

  // 检测是否为页面相关问题
  const isPageRelatedQuestion = useCallback((message: string): boolean => {
  // 转换为小写以进行不区分大小写的匹配
  const lowerMessage = message.toLowerCase();
  
  // 页面直接引用关键词（精简版，减少误触发）
  const pageDirectKeywords = [
    // 中文 - 明确的页面指代
    '这个页面', '当前页面', '这个网页', '当前网页',
    
    // 英文 - 明确的页面指代
    'this page', 'current page', 'this webpage', 'current webpage'
  ];

  // 页面内容相关关键词（精简版，降低误触发）
  const pageContentKeywords = [
    // 中文 - 明确指向页面内容的词汇
    '页面内容', '页面信息', '网页内容', 
    '页面说什么', '页面讲什么', '这里写的什么',
    '页面主要内容', '网页主要内容',
    
    // 英文 - 明确指向页面内容的词汇
    'page content', 'webpage content', 'page information',
    'what does this page say', 'what is this page about', 'page summary'
  ];

  // 页面分析相关关键词（精简版）
  const pageAnalysisKeywords = [
    // 中文 - 明确的页面分析请求
    '总结页面', '分析页面', '介绍页面',
    '页面概述', '网站概述',
    
    // 英文 - 明确的页面分析请求
    'summarize this page', 'analyze this page', 'explain this page',
    'page overview', 'what is this page'
  ];

  // 项目相关关键词（精简版）
  const projectKeywords = [
    // 中文 - 明确指向当前项目
    '这个项目', '这个作品', '这个应用',
    
    // 英文 - 明确指向当前项目
    'this project', 'this application', 'this app'
  ];

  // 合并所有关键词数组
  const allKeywords = [
    ...pageDirectKeywords,
    ...pageContentKeywords,
    ...pageAnalysisKeywords,
    ...projectKeywords
  ];

  // 检查是否包含任何关键词
  return allKeywords.some(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  );
}, []);

  // 思维链展开/收缩控制
  const toggleReasoning = useCallback((messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId && (msg.messageType === 'reasoning' || msg.messageType === 'tool_execution')
        ? { ...msg, isCollapsed: !msg.isCollapsed }
        : msg
    ));
  }, []);

  // 完全重写的发送消息函数
  const sendMessage = useCallback(async (content: string, isVoice = false) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ReasoningChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      messageType: 'user',
      isVoice
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          pageContext
        })
      });

      if (!response.ok) {
        throw new Error('网络请求失败');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应');
      }

      let currentReasoningMessage: ReasoningChatMessage | null = null;
              let currentToolMessage: ReasoningChatMessage | null = null;
        let reasoningStartTime = Date.now();
        let currentPostToolReasoningMessage: ReasoningChatMessage | null = null;
        let postToolReasoningStartTime = Date.now();
        let currentFinalMessage: ReasoningChatMessage | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed: UnifiedChatResponse = JSON.parse(data);

              if (parsed.type === 'reasoning') {
                // 思维链处理 - 区分阶段
                if (parsed.phase === 'post_tool') {
                  // 工具执行后的思维链 - 创建新的思维链消息
                  if (!currentPostToolReasoningMessage) {
                    currentPostToolReasoningMessage = {
                      id: `post-reasoning-${parsed.messageId}`,
                      role: 'assistant',
                      content: '',
                      timestamp: new Date(),
                      messageType: 'reasoning',
                      reasoningContent: parsed.content || '',
                      isReasoningComplete: false
                    };
                    setMessages(prev => [...prev, currentPostToolReasoningMessage!]);
                    postToolReasoningStartTime = Date.now();
                  } else {
                    // 更新现有的工具执行后思维链消息
                    setMessages(prev => prev.map(msg => 
                      msg.id === currentPostToolReasoningMessage!.id 
                        ? { 
                            ...msg, 
                            reasoningContent: parsed.full_reasoning || (msg.reasoningContent + (parsed.content || ''))
                          }
                        : msg
                    ));
                  }
                } else {
                  // 第一阶段思维链处理（保持不变）
                  if (!currentReasoningMessage) {
                    currentReasoningMessage = {
                      id: `reasoning-${parsed.messageId}`,
                      role: 'assistant',
                      content: '',
                      timestamp: new Date(),
                      messageType: 'reasoning',
                      reasoningContent: parsed.content || '',
                      isReasoningComplete: false
                    };
                    setMessages(prev => [...prev, currentReasoningMessage!]);
                    reasoningStartTime = Date.now();
                  } else {
                    // 更新现有思维链消息
                    setMessages(prev => prev.map(msg => 
                      msg.id === currentReasoningMessage!.id 
                        ? { 
                            ...msg, 
                            reasoningContent: parsed.full_reasoning || (msg.reasoningContent + (parsed.content || ''))
                          }
                        : msg
                    ));
                  }
                }

              } else if (parsed.type === 'tool_decision') {
                // 完成思维链，开始工具执行
                if (currentReasoningMessage) {
                  const duration = Math.round((Date.now() - reasoningStartTime) / 1000);
                  setMessages(prev => prev.map(msg => 
                    msg.id === currentReasoningMessage!.id 
                      ? { 
                          ...msg, 
                          isReasoningComplete: true, 
                          reasoningDuration: duration,
                          isCollapsed: true 
                        }
                      : msg
                  ));
                }

                // 创建工具执行消息
                currentToolMessage = {
                  id: `tool-${parsed.messageId}`,
                  role: 'assistant',
                  content: '',
                  timestamp: new Date(),
                  messageType: 'tool_execution',
                  toolExecution: {
                    id: `exec-${parsed.messageId}`,
                    toolCalls: parsed.tool_calls || [],
                    results: [],
                    status: 'executing',
                    startTime: new Date()
                  }
                };
                setMessages(prev => [...prev, currentToolMessage!]);

              } else if (parsed.type === 'tool_result') {
                // 更新工具执行结果
                if (currentToolMessage) {
                  setMessages(prev => prev.map(msg => 
                    msg.id === currentToolMessage!.id && msg.toolExecution
                      ? { 
                          ...msg, 
                          toolExecution: {
                            ...msg.toolExecution,
                            results: [...msg.toolExecution.results, parsed]
                          }
                        }
                      : msg
                  ));
                }

              } else if (parsed.type === 'final_content') {
                // 处理流式最终回复
                if (!currentFinalMessage) {
                  currentFinalMessage = {
                    id: `final-${parsed.messageId}`,
                    role: 'assistant',
                    content: parsed.content || '',
                    timestamp: new Date(),
                    messageType: 'assistant_final'
                  };
                  setMessages(prev => [...prev, currentFinalMessage!]);
                } else {
                  // 更新流式内容
                  setMessages(prev => prev.map(msg => 
                    msg.id === currentFinalMessage!.id 
                      ? { 
                          ...msg, 
                          content: parsed.full_content || (msg.content + (parsed.content || ''))
                        }
                      : msg
                  ));
                }

              } else if (parsed.type === 'done') {
                // 完成所有处理
                if (currentToolMessage) {
                  setMessages(prev => prev.map(msg => 
                    msg.id === currentToolMessage!.id && msg.toolExecution
                      ? { 
                          ...msg, 
                          toolExecution: {
                            ...msg.toolExecution,
                            status: 'completed',
                            endTime: new Date()
                          }
                        }
                      : msg
                  ));
                }

                // 完成工具执行后思维链
                if (currentPostToolReasoningMessage) {
                  const duration = Math.round((Date.now() - postToolReasoningStartTime) / 1000);
                  setMessages(prev => prev.map(msg => 
                    msg.id === currentPostToolReasoningMessage!.id 
                      ? { 
                          ...msg, 
                          isReasoningComplete: true,
                          reasoningDuration: duration,
                          isCollapsed: true // 自动收起工具执行后思维链
                        }
                      : msg
                  ));
                }

                // 完成最终回复并添加语音
                if (currentFinalMessage && parsed.final_content) {
                  let audioUrl: string | undefined = undefined;
                  if (enableVoice && voiceSettings.autoPlay) {
                    const generatedUrl = await generateSpeech(parsed.final_content);
                    audioUrl = generatedUrl || undefined;
                  }

                  // 更新最终消息添加语音
                  setMessages(prev => prev.map(msg => 
                    msg.id === currentFinalMessage!.id 
                      ? { 
                          ...msg, 
                          audioUrl
                        }
                      : msg
                  ));

                  // 自动播放语音
                  if (audioUrl && voiceSettings.autoPlay) {
                    setTimeout(() => playAudio(audioUrl), 500);
                  }
                }
              }
            } catch (e) {
              console.error('解析响应错误:', e);
            }
          }
        }
      }

    } catch (error) {
      console.error('发送消息失败:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '抱歉，我遇到了一些问题。请稍后再试。',
        timestamp: new Date(),
        messageType: 'assistant_final'
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, pageContext, isLoading, enableVoice, voiceSettings.autoPlay, generateSpeech, playAudio]);

  // 处理STT事件
  const handleSTTEvent = useCallback((event: StreamingSTTEvent) => {
    switch (event.type) {
      case 'start':
        // 清除任何现有的超时
        if (transcriptTimeoutRef.current) {
          clearTimeout(transcriptTimeoutRef.current);
          transcriptTimeoutRef.current = null;
        }
        
        setVoiceState(prev => ({
          ...prev,
          isListening: true,
          isLoading: false,
          isStreamingActive: true,
          currentTranscript: '',
          finalTranscript: ''
        }));
        break;

      case 'result':
        if (event.isFinal && event.transcript) {
          // 最终结果 - 清除超时并发送消息
          if (transcriptTimeoutRef.current) {
            clearTimeout(transcriptTimeoutRef.current);
            transcriptTimeoutRef.current = null;
          }
          
          const finalText = event.transcript.trim();
          if (finalText) {
            sendMessage(finalText, true);
            setVoiceState(prev => ({
              ...prev,
              finalTranscript: finalText,
              currentTranscript: '',
              confidence: event.confidence || 0
            }));
          }
        } else if (event.transcript) {
          // 实时结果 - 更新显示
          setVoiceState(prev => ({
            ...prev,
            currentTranscript: event.transcript || '',
            confidence: event.confidence || 0
          }));

          // 清除之前的超时
          if (transcriptTimeoutRef.current) {
            clearTimeout(transcriptTimeoutRef.current);
          }

          // 设置超时自动发送（防止用户忘记停止） - 延长到8秒
          transcriptTimeoutRef.current = setTimeout(() => {
            const currentText = event.transcript?.trim();
            if (currentText) {
              sendMessage(currentText, true);
              stopListening();
            }
          }, 8000); // 延长到8秒无新输入自动发送
        }
        break;

      case 'end':
        // 清除超时
        if (transcriptTimeoutRef.current) {
          clearTimeout(transcriptTimeoutRef.current);
          transcriptTimeoutRef.current = null;
        }
        
        setVoiceState(prev => {
          // 如果没有final结果且有临时文本，才发送消息（避免重复发送）
          const hasCurrentText = prev.currentTranscript.trim();
          const hasFinalText = prev.finalTranscript.trim();
          
          if (hasCurrentText && !hasFinalText) {
            // 只有在没有final结果但有临时文本的情况下才发送
            sendMessage(prev.currentTranscript.trim(), true);
          }
          
          return {
            ...prev,
            isListening: false,
            isStreamingActive: false,
            isLoading: false,
            currentTranscript: hasCurrentText && !hasFinalText ? '' : prev.currentTranscript
          };
        });
        break;

      case 'error':
        // 清除超时
        if (transcriptTimeoutRef.current) {
          clearTimeout(transcriptTimeoutRef.current);
          transcriptTimeoutRef.current = null;
        }
        
        setVoiceState(prev => ({
          ...prev,
          isListening: false,
          isStreamingActive: false,
          isLoading: false,
          currentTranscript: '',
          finalTranscript: ''
        }));
        
        if (onError) {
          onError(new Error(event.error || '语音识别失败'));
        }
        break;

      case 'no-speech':
        // 未检测到语音，可以选择重新开始或提示用户
        console.log('未检测到语音');
        break;
    }
  }, [sendMessage, onError, stopListening]);

  // 初始化语音识别
  useEffect(() => {
    if (enableVoice && !sttInstance.current) {
      sttInstance.current = new StreamingSpeechRecognition(
        sttConfig,
        handleSTTEvent
      );
    }

    return () => {
      // 清理语音通话资源
      if (voiceCallManager.current) {
        voiceCallManager.current.dispose();
        voiceCallManager.current = null;
      }
      
      // 清理STT资源
      if (sttInstance.current) {
        sttInstance.current.stop();
      }
      
      // 清理转录超时
      if (transcriptTimeoutRef.current) {
        clearTimeout(transcriptTimeoutRef.current);
      }
    };
  }, [enableVoice, handleSTTEvent, sttConfig]);

  // 开始流式语音识别
  const startListening = useCallback(async () => {
    if (!enableVoice || !sttInstance.current) {
      if (onError) {
        onError(new Error('语音功能未启用或不可用'));
      }
      return;
    }

    // 检查麦克风权限
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      if (onError) {
        onError(new Error('无法访问麦克风，请检查权限设置'));
      }
      return;
    }

    setVoiceState(prev => ({ ...prev, isLoading: true }));
    
    const success = sttInstance.current.start();
    if (!success) {
      setVoiceState(prev => ({ ...prev, isLoading: false }));
    }
  }, [enableVoice, onError]);

  // 重新生成语音
  const regenerateSpeech = async (messageId: string, text: string) => {
    const audioUrl = await generateSpeech(text);
    if (audioUrl) {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, audioUrl } : msg
      ));
      playAudio(audioUrl);
    }
  };

  // 处理输入提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  // 渲染页面上下文状态指示器
  const renderContextStatus = () => {
    if (!enablePageContext) return null;

    const getStatusIcon = () => {
      switch (contextStatus) {
        case 'loading':
          return <RefreshCw size={12} className="animate-spin" />;
        case 'ready':
          return <FileText size={12} />;
        case 'error':
          return <X size={12} />;
        case 'disabled':
          return <FileText size={12} className="opacity-50" />;
        default:
          return <FileText size={12} className="opacity-50" />;
      }
    };

    const getStatusText = () => {
      switch (contextStatus) {
        case 'loading':
          return '正在获取页面信息...';
        case 'ready':
          return pageContext?.basic?.title ? `"${pageContext.basic.title}"` : '页面信息就绪';
        case 'error':
          return '无法获取页面信息';
        case 'disabled':
          return '页面感知已禁用';
        default:
          return '状态未知';
      }
    };

    const getStatusColor = () => {
      switch (contextStatus) {
        case 'loading':
          return 'text-blue-600 bg-blue-50 border-blue-200';
        case 'ready':
          return 'text-green-600 bg-green-50 border-green-200';
        case 'error':
          return 'text-red-600 bg-red-50 border-red-200';
        case 'disabled':
          return 'text-gray-500 bg-gray-50 border-gray-200';
        default:
          return 'text-gray-500 bg-gray-50 border-gray-200';
      }
    };

    return (
      <div className={`text-xs ${getStatusColor()} border rounded-lg p-2 mb-3 mx-4`}>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="flex-1">{getStatusText()}</span>
          {lastContextUpdate && contextStatus === 'ready' && (
            <span className="text-gray-400">
              {new Date(lastContextUpdate).toLocaleTimeString()}
            </span>
          )}
          {contextStatus === 'error' && (
            <button
              onClick={requestContextUpdate}
              className="text-blue-600 hover:text-blue-800 underline ml-2"
            >
              重试
            </button>
          )}
        </div>
      </div>
    );
  };

  // 渲染实时转录显示组件
  const renderTranscriptDisplay = () => {
    if (!voiceState.isStreamingActive && !voiceState.currentTranscript) {
      return null;
    }

    return (
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-600 font-medium">正在识别...</span>
          </div>
          {voiceState.confidence > 0 && (
            <div className="text-xs text-gray-500">
              置信度: {Math.round(voiceState.confidence * 100)}%
            </div>
          )}
        </div>
        
        <div className="text-gray-800 min-h-[20px]">
          {voiceState.currentTranscript || (
            <span className="text-gray-400 italic">请开始说话...</span>
          )}
        </div>
        
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => {
              // 手动发送当前文本
              const currentText = voiceState.currentTranscript.trim();
              if (currentText) {
                sendMessage(currentText, true);
              }
              stopListening();
            }}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            完成
          </button>
          <button
            onClick={abortListening}
            className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    );
  };

  // 示例问题
  const exampleQuestions = [
    "这个页面主要讲了什么？",
    "帮我总结一下页面内容",
    "有什么可以帮助我的吗？"
  ];

  // 初始界面组件
  const InitialView = () => (
    <div className="flex-1 p-6">
      <div className="flex gap-4">
        {/* AI 标志 */}
        <div className="w-20 h-20 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-2xl font-bold">AI</span>
        </div>
        
        {/* 介绍文本 */}
        <div className="flex-1">
          <p className="text-gray-900 mb-2">你好！</p>
          <p className="text-gray-700">
            我是基于文档、帮助文章和其他内容训练的AI助手。
          </p>
          <p className="text-gray-700 mt-2">
            有什么关于 <span className="bg-black text-white px-2 py-0.5 rounded">AI助手</span> 的问题都可以问我
          </p>
        </div>
      </div>
      
      {/* 示例问题 */}
      <div className="mt-8">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">示例问题</p>
        <div className="space-y-2">
          {exampleQuestions.map((question, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputValue(question);
                inputRef.current?.focus();
              }}
              className="w-full p-3 text-left text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // 对话视图组件
  const ChatView = () => (
    <div className="flex-1 overflow-y-auto p-6">
      {/* 页面上下文状态 */}
      {renderContextStatus()}
      
      {/* 实时转录显示区域 */}
      {renderTranscriptDisplay()}

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={24} className="text-orange-500" strokeWidth={2} />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              你好！我是你的 AI 助手<br />
              {pageContext ? '我可以帮你分析当前页面内容，或回答其他问题' : '有什么可以帮助你的吗？'}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <UnifiedMessage
              key={message.id}
              message={message}
              onToggleReasoning={() => toggleReasoning(message.id)}
              onPlayAudio={playAudio}
            />
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-md text-sm text-gray-600 shadow-sm">
                <div className="flex items-center gap-1">
                  正在思考
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );

  // 豆包语音界面组件
  const DoubaoVoiceView = () => (
    <div className="flex-1">
      {assistantMode === 'voice-call' ? (
        <VoiceCallMode
          voiceCallState={voiceCallState}
          onStartCall={startVoiceCall}
          onEndCall={endVoiceCall}
          onToggleMute={toggleVoiceCallMute}
          onTogglePause={toggleVoiceCallPause}
          className="flex-1"
        />
      ) : (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">豆包语音助手</h3>
            <p className="text-gray-600 mb-6">点击开始语音对话</p>
            <button 
              onClick={startVoiceCall}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-sm"
            >
              开始通话
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Anthropic 风格悬浮按钮 - 使用内联样式确保显示
  if (!isOpen) {
    return (
      <div className={getPositionStyles()}>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            backgroundColor: '#000000',
            color: '#ffffff',
            padding: '12px 20px',
            border: 'none',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transform: 'scale(1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1f2937';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#000000';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          aria-label="Ask AI"
        >
          <Sparkles 
            size={20} 
            strokeWidth={2} 
            style={{
              animation: 'pulse 2s infinite',
            }}
          />
          <span className="ask-ai-text">
            Ask AI
          </span>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* 隐藏的音频元素 */}
      <audio ref={audioRef} />

      {/* 主窗口 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black/20"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 对话窗口 */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl h-[700px] flex flex-col overflow-hidden">
            {/* 顶部栏 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h1 className="text-lg font-normal text-gray-900">Ask AI</h1>
              
              <div className="flex items-center gap-4">
                {/* 模式切换 Toggle */}
                <div className="relative bg-gray-100 rounded-full p-1 flex items-center min-w-fit">
                  {/* 滑块背景 */}
                  <div 
                    className={`absolute h-10 bg-white rounded-full shadow-md transition-all duration-300 ease-in-out ${
                      assistantMode === 'text' 
                        ? 'w-[140px] translate-x-0' 
                        : 'w-[135px] translate-x-[140px]'
                    }`}
                  />
                  
                  {/* 选项按钮 */}
                  <button
                    onClick={() => switchMode('text')}
                    className={`relative z-10 px-4 py-2 text-sm font-medium rounded-full transition-colors duration-300 flex items-center gap-2 min-w-[140px] justify-center ${
                      assistantMode === 'text' ? 'text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      assistantMode === 'text' ? 'bg-gray-900' : 'bg-gray-400'
                    }`}>
                      <span className="text-[10px] font-bold text-white">AI</span>
                    </span>
                    <span className="text-sm">Ask Deepseek</span>
                  </button>
                  
                  <button
                    onClick={() => switchMode('voice-call')}
                    className={`relative z-10 px-4 py-2 text-sm font-medium rounded-full transition-colors duration-300 flex items-center gap-2 min-w-[135px] justify-center ${
                      assistantMode === 'voice-call' ? 'text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      assistantMode === 'voice-call' ? 'bg-gray-900' : 'bg-gray-400'
                    }`}>
                      <span className="text-[10px] font-bold text-white">豆</span>
                    </span>
                    <span className="text-sm">Call Doubao</span>
                  </button>
                </div>
                
                {/* 设置按钮 */}
                {enableVoice && (
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    title="语音设置"
                  >
                    <Settings size={18} className="text-gray-500" />
                  </button>
                )}
              </div>
            </div>

            {/* 语音设置面板 */}
            {showSettings && (
              <div className="p-4 border-b bg-gray-50 space-y-4">
                <h3 className="font-medium text-gray-900">语音设置</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    语音类型
                  </label>
                  <select
                    value={voiceSettings.voice}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, voice: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    {VOICE_OPTIONS.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    语速: {voiceSettings.rate}
                  </label>
                  <input
                    type="range"
                    min="-50"
                    max="100"
                    value={parseInt(voiceSettings.rate)}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, rate: `${e.target.value}%` }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    音调: {voiceSettings.pitch}
                  </label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={parseInt(voiceSettings.pitch)}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: `${e.target.value}%` }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoPlay"
                    checked={voiceSettings.autoPlay}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, autoPlay: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="autoPlay" className="text-sm text-gray-700">
                    自动播放回复语音
                  </label>
                </div>
              </div>
            )}

            {/* 内容区域 */}
            {assistantMode === 'text' ? (
              messages.length === 0 ? <InitialView /> : <ChatView />
            ) : (
              <DoubaoVoiceView />
            )}

            {/* 底部输入区 */}
            {assistantMode === 'text' && (
              <div className="border-t border-gray-100 p-4">
                {/* 输入框 */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg focus-within:border-orange-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500/20">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(inputValue);
                      }
                    }}
                    placeholder="How do I get started?"
                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:border-none focus:ring-0"
                    disabled={isLoading || voiceState.isListening}
                    style={{
                      border: 'none',
                      outline: 'none',
                      boxShadow: 'none'
                    }}
                  />
                  {enableVoice && (
                    <button 
                      type="button"
                      onClick={voiceState.isListening ? stopListening : startListening}
                      disabled={isLoading && !voiceState.isListening}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <Mic size={18} className="text-gray-500" />
                    </button>
                  )}
                  <button
                    onClick={() => sendMessage(inputValue)}
                    disabled={!inputValue.trim() || isLoading || voiceState.isListening}
                    className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                  >
                    <Send size={18} className="text-gray-500" />
                  </button>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
                
                {/* 底部信息 */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>By</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-gray-300 rounded" />
                      <span>buyu&AI助手</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button className="text-xs text-gray-600 hover:text-gray-800 transition-colors">
                      Get help
                    </button>
                    {messages.length > 0 && (
                      isLoading ? (
                        <button
                          onClick={() => setIsLoading(false)}
                          className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Stop
                        </button>
                      ) : (
                        <button
                          onClick={() => setMessages([])}
                          className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Clear
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};