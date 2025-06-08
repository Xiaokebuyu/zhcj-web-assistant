'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MessageCircle, X, Minus, Send, Mic, Volume2, VolumeX, Settings, Square } from 'lucide-react';
import { ChatMessage, AssistantConfig, VoiceState, VoiceSettings, STTConfig, StreamingSTTEvent } from '@/types';
import { StreamingSpeechRecognition } from '@/utils/streamingSpeechRecognition';

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // 语音识别实例
  const sttInstance = useRef<StreamingSpeechRecognition | null>(null);
  const transcriptTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    position = 'bottom-right',
    enableVoice = true
  } = config;

  // STT配置
  const sttConfig: STTConfig = useMemo(() => ({
    language: 'zh-CN',
    continuous: true,
    interimResults: true,
    maxAlternatives: 1
  }), []);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  // 发送消息
  const sendMessage = useCallback(async (content: string, isVoice = false) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) throw new Error('网络请求失败');

      const data = await response.json();
      
      // 生成语音（如果启用）
      let audioUrl: string | undefined = undefined;
      if (enableVoice && voiceSettings.autoPlay) {
        const generatedUrl = await generateSpeech(data.message);
        audioUrl = generatedUrl || undefined;
      }

      const assistantMessage: ChatMessage = {
        id: data.messageId,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        audioUrl
      };

      setMessages(prev => [...prev, assistantMessage]);

      // 自动播放语音
      if (audioUrl && voiceSettings.autoPlay) {
        setTimeout(() => playAudio(audioUrl), 500);
      }

    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMessage: ChatMessage = {
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
    }
  }, [isLoading, messages, enableVoice, voiceSettings, generateSpeech, playAudio, onError]);

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
      if (sttInstance.current) {
        sttInstance.current.stop();
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
              <MessageCircle size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">AI 助手</h3>
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

        {/* Anthropic 风格对话区域 */}
        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-4 h-80 space-y-4 bg-gradient-to-b from-white to-gray-50/50">
              {/* 实时转录显示区域 */}
              {renderTranscriptDisplay()}
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageCircle size={24} className="text-orange-500" strokeWidth={2} />
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    你好！我是你的 AI 助手<br />
                    有什么可以帮助你的吗？
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* 头像 */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                          : 'bg-gradient-to-r from-orange-500 to-orange-600'
                      }`}>
                        {message.role === 'user' ? (
                          <span className="text-white text-sm font-medium">你</span>
                        ) : (
                          <MessageCircle size={14} className="text-white" strokeWidth={2.5} />
                        )}
                      </div>
                      
                      {/* 消息气泡 */}
                      <div
                        className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-md'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        {message.isVoice && (
                          <span className="ml-2 inline-flex items-center">
                            <Mic size={12} className="opacity-75" />
                          </span>
                        )}
                        
                        {/* 语音播放按钮（仅助手消息） */}
                        {message.role === 'assistant' && enableVoice && (
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
                ))
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
                    placeholder="输入消息..."
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
      </div>
    </div>
    </>
  );
} 