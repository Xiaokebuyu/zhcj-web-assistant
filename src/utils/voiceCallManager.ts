import { DoubaoVoiceClient } from './doubaoVoiceClient';
import { AudioProcessor } from './audioProcessor';
import { 
  DoubaoVoiceConfig, 
  VoiceCallState, 
  RealtimeTranscriptEvent,
  AudioVisualizationData 
} from '@/types';

/**
 * 语音通话管理器
 * 协调DoubaoVoiceClient和AudioProcessor，管理整个语音通话流程
 */
export class VoiceCallManager {
  private doubaoClient: DoubaoVoiceClient | null = null;
  private audioProcessor: AudioProcessor | null = null;
  private config: DoubaoVoiceConfig;
  private sessionId: string;
  private callState: VoiceCallState;
  private silenceTimer: NodeJS.Timeout | null = null;
  private callStartTime: number = 0;
  private onStateChange: (state: VoiceCallState) => void;
  private onTranscriptUpdate: (transcript: string) => void;
  private onVisualizationData: (data: AudioVisualizationData) => void;

  constructor(
    config: DoubaoVoiceConfig,
    sessionId: string,
    onStateChange: (state: VoiceCallState) => void,
    onTranscriptUpdate: (transcript: string) => void,
    onVisualizationData: (data: AudioVisualizationData) => void
  ) {
    this.config = config;
    this.sessionId = sessionId;
    this.onStateChange = onStateChange;
    this.onTranscriptUpdate = onTranscriptUpdate;
    this.onVisualizationData = onVisualizationData;

    // 初始化通话状态
    this.callState = {
      mode: 'voice-call',
      isCallActive: false,
      connectionStatus: 'idle',
      callDuration: 0,
      silenceTimer: 0,
      realtimeTranscript: '',
      audioQuality: 'medium',
      sessionId,
      lastActivity: Date.now()
    };

    this.audioProcessor = new AudioProcessor();
  }

  /**
   * 开始语音通话
   */
  async startCall(): Promise<void> {
    try {
      console.log('开始语音通话流程...');
      
      this.updateCallState({
        connectionStatus: 'connecting',
        isCallActive: false
      });

      // 检查浏览器支持
      const support = AudioProcessor.checkSupport();
      if (!support.mediaDevices || !support.audioContext) {
        throw new Error('浏览器不支持语音通话功能，请使用Chrome、Firefox或Edge浏览器');
      }

      console.log('浏览器支持检查通过');

      // 验证配置
      if (!this.config.baseUrl) {
        throw new Error('语音服务配置无效：缺少WebSocket URL');
      }

      // 初始化豆包语音客户端
      console.log('正在初始化豆包语音客户端...');
      this.doubaoClient = new DoubaoVoiceClient(
        this.config,
        this.sessionId,
        this.handleDoubaoEvent.bind(this)
      );

      // 连接豆包服务
      console.log('正在连接豆包服务...');
      await this.doubaoClient.connect();
      console.log('豆包服务连接成功');

      // 开始音频捕获
      console.log('正在启动音频捕获...');
      await this.audioProcessor!.startCapture(
        this.handleAudioData.bind(this),
        this.handleSilenceDetected.bind(this),
        this.onVisualizationData
      );
      console.log('音频捕获启动成功');

      this.callStartTime = Date.now();
      this.updateCallState({
        connectionStatus: 'connected',
        isCallActive: true,
        lastActivity: Date.now()
      });

      // 开始通话时长计时
      this.startCallTimer();
      
      console.log('语音通话已开始');

    } catch (error) {
      console.error('开始语音通话失败:', error);
      
      // 清理已创建的资源
      if (this.doubaoClient) {
        try {
          await this.doubaoClient.close();
        } catch (e) {
          console.warn('关闭豆包客户端失败:', e);
        }
        this.doubaoClient = null;
      }
      
      if (this.audioProcessor) {
        try {
          this.audioProcessor.stopCapture();
        } catch (e) {
          console.warn('停止音频捕获失败:', e);
        }
      }
      
      this.updateCallState({
        connectionStatus: 'error',
        isCallActive: false
      });
      
      // 重新抛出具体的错误信息
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('语音通话启动失败: 未知错误');
      }
    }
  }

  /**
   * 结束语音通话
   */
  async endCall(reason: 'user_hangup' | 'timeout' | 'error' | 'silence_timeout' = 'user_hangup'): Promise<void> {
    try {
      // 停止静音检测定时器
      this.stopSilenceTimer();

      // 停止音频捕获
      if (this.audioProcessor) {
        this.audioProcessor.stopCapture();
      }

      // 关闭豆包连接
      if (this.doubaoClient) {
        await this.doubaoClient.close();
        this.doubaoClient = null;
      }

      this.updateCallState({
        connectionStatus: 'disconnected',
        isCallActive: false
      });

      // 调用结束通话API
      try {
        const response = await fetch('/api/voice/end', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: this.sessionId,
            reason,
            duration: Date.now() - this.callStartTime
          }),
        });

        if (!response.ok) {
          console.warn('结束通话API调用失败');
        }
      } catch (error) {
        console.warn('结束通话API调用错误:', error);
      }

      console.log(`语音通话已结束，原因: ${reason}`);

    } catch (error) {
      console.error('结束语音通话失败:', error);
    }
  }

  /**
   * 处理豆包事件
   */
  private handleDoubaoEvent(event: RealtimeTranscriptEvent): void {
    switch (event.type) {
      case 'transcript':
        if (event.text) {
          this.updateCallState({
            realtimeTranscript: event.text,
            lastActivity: Date.now()
          });
          this.onTranscriptUpdate(event.text);
          this.resetSilenceTimer();
        }
        break;

      case 'audio':
        if (event.audio) {
          this.playAudioData(event.audio);
          this.updateCallState({ lastActivity: Date.now() });
          this.resetSilenceTimer();
        }
        break;

      case 'error':
        console.error('豆包语音错误:', event.error);
        this.endCall('error');
        break;

      case 'end':
        console.log('豆包会话结束');
        this.endCall('timeout');
        break;
    }
  }

  /**
   * 处理音频数据
   */
  private handleAudioData(audioData: ArrayBuffer): void {
    if (this.doubaoClient && this.doubaoClient.isConnectionActive()) {
      this.doubaoClient.sendAudio(audioData);
      this.updateCallState({ lastActivity: Date.now() });
      this.resetSilenceTimer();
    }
  }

  /**
   * 处理静音检测
   */
  private handleSilenceDetected(duration: number): void {
    if (this.config.silenceDetection && duration >= this.config.callTimeout) {
      console.log(`检测到${duration}ms静音，准备结束通话`);
      this.endCall('silence_timeout');
    }
  }

  /**
   * 播放音频数据
   */
  private async playAudioData(audioData: ArrayBuffer): Promise<void> {
    try {
      // 创建音频上下文
      const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('浏览器不支持AudioContext');
      }
      const audioContext = new AudioContextClass();
      
      // 解码音频数据
      const audioBuffer = await audioContext.decodeAudioData(audioData.slice(0));
      
      // 创建音频源
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      // 播放音频
      source.start();
      
    } catch (error) {
      console.error('播放音频失败:', error);
    }
  }

  /**
   * 重置静音定时器
   */
  private resetSilenceTimer(): void {
    this.stopSilenceTimer();
    
    if (this.config.silenceDetection && this.callState.isCallActive) {
      this.silenceTimer = setTimeout(() => {
        console.log('静音超时，结束通话');
        this.endCall('silence_timeout');
      }, this.config.callTimeout);
    }
  }

  /**
   * 停止静音定时器
   */
  private stopSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  /**
   * 开始通话时长计时
   */
  private startCallTimer(): void {
    const updateDuration = () => {
      if (this.callState.isCallActive) {
        const duration = Date.now() - this.callStartTime;
        this.updateCallState({ callDuration: duration });
        setTimeout(updateDuration, 1000); // 每秒更新一次
      }
    };
    updateDuration();
  }

  /**
   * 更新通话状态
   */
  private updateCallState(updates: Partial<VoiceCallState>): void {
    this.callState = { ...this.callState, ...updates };
    this.onStateChange(this.callState);
  }

  /**
   * 切换静音状态
   */
  toggleMute(): void {
    if (this.audioProcessor) {
      // AudioProcessor暂时不支持静音切换，这里可以扩展
      console.log('切换静音状态');
    }
  }

  /**
   * 暂停/恢复通话
   */
  togglePause(): void {
    if (this.callState.isCallActive) {
      // 实现暂停逻辑
      console.log('切换暂停状态');
    }
  }

  /**
   * 获取当前通话状态
   */
  getCallState(): VoiceCallState {
    return { ...this.callState };
  }

  /**
   * 检查通话是否活跃
   */
  isCallActive(): boolean {
    return this.callState.isCallActive && this.callState.connectionStatus === 'connected';
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.endCall('user_hangup');
    
    if (this.audioProcessor) {
      this.audioProcessor.dispose();
      this.audioProcessor = null;
    }

    this.stopSilenceTimer();
  }
}