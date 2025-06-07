// 基础聊天消息类型
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  audioUrl?: string; // 语音消息的音频URL
  isVoice?: boolean; // 是否为语音输入的消息
}

// 助手配置类型
export interface AssistantConfig {
  baseUrl?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark' | 'auto';
  enableVoice?: boolean;
  maxMessages?: number;
}

// 语音设置类型
export interface VoiceSettings {
  voice: string;
  rate: string;
  pitch: string;
  volume: string;
  autoPlay: boolean;
}

// 语音选项类型
export interface VoiceOption {
  id: string;
  name: string;
  displayName?: string;
}

// TTS请求类型
export interface TTSRequest {
  text: string;
  voice?: string;
  rate?: string;
  pitch?: string;
  volume?: string;
}

// TTS响应类型
export interface TTSResponse {
  audioUrl?: string;
  error?: string;
}

// 聊天API请求类型
export interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

// 聊天API响应类型
export interface ChatResponse {
  message: string;
  messageId: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: string;
  isSimulated?: boolean;
}

// 错误类型
export interface APIError {
  error: string;
  code?: number;
  details?: string;
}

// 嵌入式助手选项
export interface EmbedOptions {
  config?: AssistantConfig;
  containerId?: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

// 消息事件类型
export interface MessageEvent {
  type: string;
  data: any;
  origin?: string;
}

// 音频播放状态
export interface AudioState {
  isPlaying: boolean;
  currentMessageId?: string;
  duration?: number;
  currentTime?: number;
}

// 语音识别状态（为未来功能预留）
export interface SpeechRecognitionState {
  isListening: boolean;
  transcript: string;
  confidence: number;
  error?: string;
}

// 助手状态
export interface AssistantState {
  isOpen: boolean;
  isLoading: boolean;
  showSettings: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  lastError?: Error;
}

// 全局窗口扩展（用于嵌入式SDK）
declare global {
  interface Window {
    AIAssistant?: any;
    initAIAssistant?: (options: EmbedOptions) => any;
  }
}

// 向后兼容的类型别名
export type Message = ChatMessage;

export interface VoiceState {
  isListening: boolean;
  isPlaying: boolean;
  isLoading: boolean;
} 