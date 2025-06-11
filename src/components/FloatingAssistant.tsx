'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MessageCircle, X, Minus, Send, Mic, Volume2, VolumeX, Settings, Square, FileText, RefreshCw, Search, Phone } from 'lucide-react';
import { ChatMessage, AssistantConfig, VoiceState, VoiceSettings, STTConfig, StreamingSTTEvent, ToolCall, ToolProgress, PageContext, ContextStatus, ChatRequest, AssistantMode, VoiceCallState, DoubaoVoiceConfig } from '@/types';

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

// 扩展 ChatMessage 接口
interface ExtendedChatMessage extends ChatMessage {
  searchSources?: SearchResult[];
}
import { StreamingSpeechRecognition } from '@/utils/streamingSpeechRecognition';
import { toolDefinitions } from '@/utils/toolManager';
import { VoiceCallMode } from './VoiceCall/VoiceCallMode';
import { VoiceCallManager } from '@/utils/voiceCallManager';

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
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
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
    silenceTimer: 0,
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
  
  // 豆包语音配置
  const doubaoVoiceConfig: DoubaoVoiceConfig = useMemo(() => ({
    apiAppId: '2139817228', // 使用固定的豆包API配置
    apiAccessKey: 'LMxFTYn2mmWwQwmLfT3ZbwS4yj0JPiMt',
    apiResourceId: 'volc.speech.dialog',
    baseUrl: '', // 这里将被动态设置
    callTimeout: 8000, // 8秒超时
    silenceDetection: true,
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
          audioQuality: voiceCallState.audioQuality,
          silenceDetection: true
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
    if (voiceCallManager.current) {
      await voiceCallManager.current.endCall('user_hangup');
      voiceCallManager.current = null;
    }
    
    // 切换回文字模式
    setAssistantMode('text');
    
    // 重置语音通话状态
    setVoiceCallState({
      mode: 'text',
      isCallActive: false,
      connectionStatus: 'idle',
      callDuration: 0,
      silenceTimer: 0,
      realtimeTranscript: '',
      audioQuality: 'medium',
      lastActivity: Date.now()
    });
  }, []);

  // 切换静音
  const toggleVoiceCallMute = useCallback(() => {
    if (voiceCallManager.current) {
      voiceCallManager.current.toggleMute();
    }
  }, []);

  // 切换暂停
  const toggleVoiceCallPause = useCallback(() => {
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

  // 处理直接回复的函数
  const handleDirectResponse = useCallback(async (data: { 
    message: string; 
    messageId: string;
    contextUsed?: boolean;
    pageInfo?: { title: string; url: string; type: string; };
    searchSources?: SearchResult[];
  }) => {
    // 生成语音（如果启用）
    let audioUrl: string | undefined = undefined;
    if (enableVoice && voiceSettings.autoPlay) {
      const generatedUrl = await generateSpeech(data.message);
      audioUrl = generatedUrl || undefined;
    }

    const assistantMessage: ExtendedChatMessage = {
      id: data.messageId,
      role: 'assistant',
      content: data.message,
      timestamp: new Date(),
      audioUrl,
      contextUsed: data.contextUsed,
      pageInfo: data.pageInfo,
      searchSources: data.searchSources
    };

    setMessages(prev => [...prev, assistantMessage]);

    // 自动播放语音
    if (audioUrl && voiceSettings.autoPlay) {
      setTimeout(() => playAudio(audioUrl), 500);
    }
  }, [enableVoice, voiceSettings.autoPlay, generateSpeech, playAudio]);

  // 处理工具调用的函数
  const handleToolCalls = useCallback(async (toolCalls: ToolCall[], conversationHistory: ExtendedChatMessage[], hasOpenManusTools = false) => {
    // 检查是否包含OpenManus工具
    const openManusTools = toolCalls.filter(tool => 
      tool.function.name.startsWith('openmanus_')
    );
    const regularTools = toolCalls.filter(tool => 
      !tool.function.name.startsWith('openmanus_')
    );

    // 显示"正在处理..."消息
    const thinkingMessage: ExtendedChatMessage = {
      id: `thinking-${Date.now()}`,
      role: 'assistant',
      content: hasOpenManusTools ? 
        '正在启动OpenManus智能代理为您处理复杂任务...' : 
        '正在为您查询相关信息...',
      timestamp: new Date(),
      isThinking: true
    };
    setMessages(prev => [...prev, thinkingMessage]);

    // 设置工具调用进度
    const totalSteps = hasOpenManusTools ? 5 : 3; // OpenManus需要更多步骤
    setToolProgress({
      isToolCalling: true,
      currentTool: getToolDisplayName(toolCalls[0].function.name),
      progress: hasOpenManusTools ? 
        '正在初始化OpenManus代理...' : 
        '正在查询...',
      step: 1,
      totalSteps
    });

    try {
      const allResults: Array<{
        tool_call_id: string;
        role: string;
        content: string;
      }> = [];

      // 如果有OpenManus工具，单独处理
      if (openManusTools.length > 0) {
        setToolProgress(prev => ({
          ...prev,
          progress: '正在执行OpenManus任务...',
          step: 2
        }));

        for (const openManusTool of openManusTools) {
          const openManusResponse = await fetch('/api/tools', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tool_calls: [openManusTool]
            })
          });

          if (!openManusResponse.ok) {
            throw new Error('OpenManus工具调用失败');
          }

          const openManusData = await openManusResponse.json();
          if (openManusData.success && openManusData.results) {
            allResults.push(...openManusData.results);
          }
        }

        setToolProgress(prev => ({
          ...prev,
          progress: '正在处理OpenManus结果...',
          step: 3
        }));
      }

      // 处理常规工具
      if (regularTools.length > 0) {
        setToolProgress(prev => ({
          ...prev,
          progress: '正在执行常规工具...',
          step: hasOpenManusTools ? 4 : 2
        }));

        const toolResponse = await fetch('/api/tools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tool_calls: regularTools
          })
        });

        if (!toolResponse.ok) {
          throw new Error('工具调用失败');
        }

        const toolData = await toolResponse.json();
        
        if (!toolData.success) {
          throw new Error('工具执行失败');
        }

        if (toolData.results) {
          allResults.push(...toolData.results);
        }
      }

      // 更新进度
      setToolProgress(prev => ({
        ...prev,
        progress: '正在分析结果...',
        step: hasOpenManusTools ? 5 : 3
      }));

      // 第二步：将工具结果发送给AI进行整合
      const finalResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...conversationHistory.map(m => ({
              role: m.role,
              content: m.content
            })),
            {
              role: 'assistant',
              content: '',
              tool_calls: toolCalls
            },
            ...allResults.map(result => ({
              role: result.role,
              content: result.content,
              tool_call_id: result.tool_call_id
            }))
          ]
        })
      });

      if (!finalResponse.ok) {
        throw new Error('最终回复生成失败');
      }

      const finalData = await finalResponse.json();

      // 更新进度
      setToolProgress(prev => ({
        ...prev,
        progress: '正在生成回复...',
        step: 3
      }));

      // 生成语音（如果启用）
      let audioUrl: string | undefined = undefined;
      if (enableVoice && voiceSettings.autoPlay) {
        const generatedUrl = await generateSpeech(finalData.message);
        audioUrl = generatedUrl || undefined;
      }

      // 移除"正在处理..."消息，添加最终回复
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isThinking);
        return [...filtered, {
          id: finalData.messageId,
          role: 'assistant',
          content: finalData.message,
          timestamp: new Date(),
          audioUrl,
          toolCalls,
          searchSources: finalData.searchSources // 添加搜索来源
        }];
      });

      // 自动播放语音
      if (audioUrl && voiceSettings.autoPlay) {
        setTimeout(() => playAudio(audioUrl), 500);
      }

    } catch (error) {
      console.error('工具调用失败:', error);
      
      // 移除"正在处理..."消息，显示错误信息
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isThinking);
        return [...filtered, {
          id: Date.now().toString(),
          role: 'assistant',
          content: '抱歉，我在获取信息时遇到了问题。请稍后再试或换个方式提问。',
          timestamp: new Date()
        }];
      });
    }
  }, [enableVoice, voiceSettings.autoPlay, generateSpeech, playAudio, getToolDisplayName]);

  // 发送消息
  const sendMessage = useCallback(async (content: string, isVoice = false) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ExtendedChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      isVoice
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 如果是页面相关问题但没有上下文，尝试获取
      const isPageQuestion = isPageRelatedQuestion(content);
      console.log('是否为页面相关问题:', isPageQuestion);
      console.log('当前页面上下文:', pageContext);
      
      if (isPageQuestion && !pageContext && enablePageContext) {
        console.log('页面相关问题但无上下文，请求更新...');
        requestContextUpdate();
        // 等待一下看是否能获取到上下文
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // 构建请求
      const requestBody: ChatRequest = {
        messages: [...messages, userMessage].map(m => ({
          role: m.role,
          content: m.content
        })),
        tools: toolDefinitions, // 包含工具定义
        temperature: 0.7,
        max_tokens: 2048,
      };

      // 如果有页面上下文，添加到请求中
      if (pageContext && enablePageContext) {
        console.log('添加页面上下文到请求:', pageContext.basic?.title);
        requestBody.pageContext = pageContext;
      } else {
        console.log('无页面上下文或未启用页面上下文功能');
      }

      console.log('发送聊天请求:', requestBody);

      // 第一步：发送用户消息，检查是否需要工具调用
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error('网络请求失败');

      const data = await response.json();
      
      // 检查是否需要调用工具
      if (data.requiresToolCalls && data.tool_calls && data.tool_calls.length > 0) {
        // 显示工具调用进度
        await handleToolCalls(data.tool_calls, [...messages, userMessage], data.hasOpenManusTools);
      } else {
        // 直接回复，无需工具
        await handleDirectResponse(data);
      }

    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMessage: ExtendedChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '抱歉，我现在无法回应。请稍后再试。',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      if (onError) {
        onError(error instanceof Error ? error : new Error('发送消息失败'));
      }
    } finally {
      setIsLoading(false);
      setToolProgress({
        isToolCalling: false,
        progress: '',
        step: 0,
        totalSteps: 0
      });
    }
  }, [isLoading, messages, onError, handleToolCalls, handleDirectResponse, isPageRelatedQuestion, pageContext, enablePageContext, requestContextUpdate]);

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

  // 渲染消息组件
  const renderMessage = (message: ExtendedChatMessage) => {
    return (
      <div
        key={message.id}
        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
      >
        <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* 头像 */}
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
            message.role === 'user' 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
              : message.isThinking
              ? 'bg-gradient-to-r from-blue-500 to-blue-600'
              : 'bg-gradient-to-r from-orange-500 to-orange-600'
          }`}>
            {message.role === 'user' ? (
              <span className="text-white text-sm font-medium">你</span>
            ) : message.isThinking ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <MessageCircle size={14} className="text-white" strokeWidth={2.5} />
            )}
          </div>
          
          {/* 消息气泡 */}
          <div
            className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
              message.role === 'user'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                : message.isThinking
                ? 'bg-blue-50 border border-blue-200 text-blue-800 rounded-bl-md'
                : 'bg-white border border-gray-100 text-gray-800 rounded-bl-md'
            }`}
          >
            <div className="whitespace-pre-wrap">{message.content}</div>
            {message.isVoice && (
              <span className="ml-2 inline-flex items-center">
                <Mic size={12} className="opacity-75" />
              </span>
            )}
            {message.toolCalls && (
              <span className="ml-2 inline-flex items-center text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                使用了工具
              </span>
            )}
            {message.searchSources && message.searchSources.length > 0 && (
              <span className="ml-2 inline-flex items-center text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                <Search size={10} className="mr-1" />
                网络搜索
              </span>
            )}
            {message.contextUsed && message.pageInfo && (
              <span className="ml-2 inline-flex items-center text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                <FileText size={10} className="mr-1" />
                页面内容
              </span>
            )}

            {/* 工具调用进度显示 */}
            {message.isThinking && toolProgress.isToolCalling && (
              <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-700 mb-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent"></div>
                  <span>{toolProgress.currentTool}</span>
                </div>
                <div className="text-xs text-blue-600 mb-2">{toolProgress.progress}</div>
                <div className="w-full bg-blue-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${(toolProgress.step / toolProgress.totalSteps) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {/* 显示页面上下文使用状态 */}
            {message.contextUsed && message.pageInfo && (
              <div className="mt-3 pt-2 border-t border-green-200">
                <div className="text-xs text-green-700 flex items-center gap-1">
                  <FileText size={12} />
                  <span>基于页面&ldquo;{message.pageInfo.title}&rdquo;的内容回答</span>
                </div>
              </div>
            )}

            {/* 显示搜索来源 */}
            {message.searchSources && message.searchSources.length > 0 && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Search size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">信息来源</span>
                </div>
                <div className="space-y-2">
                  {message.searchSources.slice(0, 3).map((source, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-4 h-4 mt-0.5 flex-shrink-0">
                        {source.siteIcon ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={source.siteIcon} alt="" className="w-4 h-4 rounded" />
                          </>
                        ) : (
                          <div className="w-4 h-4 bg-gray-300 rounded"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 line-clamp-1 block"
                        >
                          {source.name}
                        </a>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {source.snippet}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">{source.siteName}</span>
                          {source.datePublished && (
                            <span className="text-xs text-gray-400">
                              {new Date(source.datePublished).toLocaleDateString('zh-CN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {message.searchSources.length > 3 && (
                    <div className="text-xs text-gray-500 text-center pt-2">
                      还有 {message.searchSources.length - 3} 个来源...
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* 语音播放按钮（仅助手消息） */}
            {message.role === 'assistant' && !message.isThinking && enableVoice && (
              <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-gray-200">
                {message.audioUrl ? (
                  <button
                    onClick={() => playAudio(message.audioUrl!)}
                    className="flex items-center space-x-1 text-xs text-gray-600 hover:text-orange-500 transition-colors"
                  >
                    <Volume2 size={12} />
                    <span>播放</span>
                  </button>
                ) : (
                  <button
                    onClick={() => regenerateSpeech(message.id, message.content)}
                    className="flex items-center space-x-1 text-xs text-gray-600 hover:text-orange-500 transition-colors"
                  >
                    <VolumeX size={12} />
                    <span>生成语音</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
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

  // 位置样式
  const getPositionStyles = () => {
    const base = 'fixed z-50';
    switch (position) {
      case 'bottom-left': return `${base} bottom-4 left-4`;
      case 'top-right': return `${base} top-4 right-4`;
      case 'top-left': return `${base} top-4 left-4`;
      default: return `${base} bottom-4 right-4`;
    }
  };

  if (!isOpen) {
    // Anthropic 风格悬浮按钮
    return (
      <div className={getPositionStyles()}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl p-4 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-orange-200/50 border border-orange-400/20 backdrop-blur-sm"
          aria-label="打开AI助手"
        >
          <MessageCircle size={24} strokeWidth={2} />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* 隐藏的音频元素 */}
      <audio ref={audioRef} />

      <div className={getPositionStyles()}>
        <div className={`bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-2xl transition-all duration-300 ${
        isMinimized ? 'w-80 h-14' : 'w-96 h-[500px]'
      } overflow-hidden`}>
        {/* Anthropic 风格头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              {assistantMode === 'voice-call' ? (
                <Phone size={16} className="text-white" strokeWidth={2.5} />
              ) : (
                <MessageCircle size={16} className="text-white" strokeWidth={2.5} />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">AI 助手</h3>
              {assistantMode === 'voice-call' && (
                <div className="text-xs text-gray-600">豆包语音通话</div>
              )}
            </div>
          </div>
          
          {/* 模式切换器 */}
          <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => switchMode('text')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                assistantMode === 'text'
                  ? 'bg-orange-100 text-orange-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              💬 文字
            </button>
            <button
              onClick={() => switchMode('voice-call')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                assistantMode === 'voice-call'
                  ? 'bg-orange-100 text-orange-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📞 通话
            </button>
          </div>
          <div className="flex gap-1">
            {enableVoice && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="hover:bg-orange-100 p-2 rounded-xl transition-colors duration-200 text-gray-600 hover:text-orange-600"
                aria-label="语音设置"
              >
                <Settings size={18} strokeWidth={2} />
              </button>
            )}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-orange-100 p-2 rounded-xl transition-colors duration-200 text-gray-600 hover:text-orange-600"
              aria-label={isMinimized ? "展开" : "最小化"}
            >
              <Minus size={18} strokeWidth={2} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-red-100 p-2 rounded-xl transition-colors duration-200 text-gray-600 hover:text-red-600"
              aria-label="关闭"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* 语音设置面板 */}
        {!isMinimized && showSettings && (
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
        {!isMinimized && (
          <>
            {assistantMode === 'voice-call' ? (
              /* 语音通话模式 */
              <VoiceCallMode
                voiceCallState={voiceCallState}
                onStartCall={startVoiceCall}
                onEndCall={endVoiceCall}
                onToggleMute={toggleVoiceCallMute}
                onTogglePause={toggleVoiceCallPause}
                className="flex-1"
              />
            ) : (
              /* 文字对话模式 */
              <>
                <div className="flex-1 overflow-y-auto p-4 h-80 space-y-4 bg-gradient-to-b from-white to-gray-50/50">
                  {/* 页面上下文状态 */}
                  {renderContextStatus()}
                  
                  {/* 实时转录显示区域 */}
                  {renderTranscriptDisplay()}
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
                messages.map(renderMessage)
              )}
              {isLoading && (
                <div className="flex justify-start animate-in fade-in duration-300">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <MessageCircle size={14} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-md text-sm text-gray-600 shadow-sm">
                      <div className="flex items-center gap-1">
                        正在思考
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                          <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                          <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Anthropic 风格输入区域 */}
                <div className="border-t border-gray-100 p-4 bg-white">
                  <form onSubmit={handleSubmit} className="flex gap-3">
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={pageContext ? "问我关于这个页面的任何问题..." : "输入消息..."}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                        disabled={isLoading || voiceState.isListening}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      {enableVoice && (
                        <button
                          type="button"
                          onClick={voiceState.isListening ? stopListening : startListening}
                          disabled={isLoading && !voiceState.isListening}
                          className={`p-3 rounded-2xl transition-all duration-200 ${
                            voiceState.isListening
                              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          } ${
                            (isLoading && !voiceState.isListening) ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          aria-label="语音输入"
                        >
                          {voiceState.isListening ? (
                            <Square size={18} strokeWidth={2} />
                          ) : (
                            <Mic size={18} strokeWidth={2} />
                          )}
                        </button>
                      )}
                      
                      <button
                        type="submit"
                        disabled={!inputValue.trim() || isLoading || voiceState.isListening}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 text-white p-3 rounded-2xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg shadow-orange-200/50 hover:shadow-orange-300/50"
                        aria-label="发送消息"
                      >
                        <Send size={18} strokeWidth={2} />
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
    </>
  );
} 