'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Minus, Send, Mic, MicOff, Volume2, VolumeX, Settings } from 'lucide-react';
import { ChatMessage, AssistantConfig, VoiceState, VoiceSettings } from '@/types';

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
    isLoading: false
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

  const {
    position = 'bottom-right',
    theme = 'light',
    enableVoice = true,
    maxMessages = 5
  } = config;

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
  const sendMessage = async (content: string, isVoice = false) => {
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
  };

  // 语音转文本
  const startListening = async () => {
    if (!enableVoice) return;
    
    setVoiceState(prev => ({ ...prev, isListening: true, isLoading: true }));
    
    try {
      // 这里后续集成STT API
      // 暂时模拟语音输入
      setTimeout(() => {
        setVoiceState(prev => ({ ...prev, isListening: false, isLoading: false }));
        sendMessage("这是语音输入的模拟文本", true);
      }, 2000);
    } catch (error) {
      console.error('语音识别失败:', error);
      setVoiceState(prev => ({ ...prev, isListening: false, isLoading: false }));
      
      if (onError) {
        onError(error instanceof Error ? error : new Error('语音识别失败'));
      }
    }
  };

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
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex gap-2">
                  {enableVoice && (
                    <button
                      type="button"
                      onClick={startListening}
                      disabled={voiceState.isListening || voiceState.isLoading}
                      className={`p-3 rounded-2xl transition-all duration-200 ${
                        voiceState.isListening 
                          ? 'bg-red-500 text-white shadow-lg shadow-red-200' 
                          : 'bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-600'
                      }`}
                      aria-label="语音输入"
                    >
                      {voiceState.isListening ? <MicOff size={18} strokeWidth={2} /> : <Mic size={18} strokeWidth={2} />}
                    </button>
                  )}
                  
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
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