export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
}

export interface ChatResponse {
  message: string;
  messageId: string;
}

export interface AssistantConfig {
  apiKey?: string;
  baseUrl?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark' | 'auto';
  enableVoice?: boolean;
  maxMessages?: number;
}

export interface VoiceState {
  isListening: boolean;
  isPlaying: boolean;
  isLoading: boolean;
}

export interface EmbedOptions {
  containerId?: string;
  config?: AssistantConfig;
  onReady?: () => void;
  onError?: (error: Error) => void;
} 