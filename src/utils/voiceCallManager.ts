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
  private callStartTime: number = 0;
  private onStateChange: (state: VoiceCallState) => void;
  private onTranscriptUpdate: (transcript: string) => void;
  private onVisualizationData: (data: AudioVisualizationData) => void;
  
  // 音频播放队列管理
  private audioQueue: ArrayBuffer[] = [];
  private isPlaying: boolean = false;
  private currentAudioSource: AudioBufferSourceNode | null = null;
  private audioContext: AudioContext | null = null;

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
      realtimeTranscript: '',
      audioQuality: 'medium',
      sessionId,
      lastActivity: Date.now()
    };

    this.audioProcessor = new AudioProcessor();
  }

  /**
   * 修复：使用代理服务器的连接方式
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

      // 修复：使用WebSocket代理URL而不是直接连接豆包
      // 从API获取的WebSocket URL应该是代理服务器地址
      if (!this.config.baseUrl.includes('/api/voice/realtime')) {
        throw new Error('WebSocket URL配置错误，应该指向代理服务器');
      }

      console.log('使用WebSocket代理URL:', this.config.baseUrl);

      // 初始化豆包语音客户端
      console.log('正在初始化豆包语音客户端...');
      this.doubaoClient = new DoubaoVoiceClient(
        this.config,
        this.sessionId,
        this.handleDoubaoEvent.bind(this)
      );

      // 连接代理服务
      console.log('正在连接代理服务...');
      await this.doubaoClient.connect();
      console.log('代理服务连接成功');

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

      this.startCallTimer();
      
      console.log('语音通话已开始');

    } catch (error) {
      console.error('开始语音通话失败:', error);
      
      // 清理资源
      await this.cleanup();
      
      this.updateCallState({
        connectionStatus: 'error',
        isCallActive: false
      });
      
      throw error;
    }
  }

  /**
   * 修复：改进的事件处理 - 移除超时机制
   */
  private handleDoubaoEvent(event: RealtimeTranscriptEvent): void {
    console.log('收到豆包事件:', event.type);
    
    switch (event.type) {
      case 'transcript':
        if (event.text) {
          console.log('收到AI转录文本:', event.text);
          this.updateCallState({
            realtimeTranscript: event.text,
            lastActivity: Date.now()
          });
          this.onTranscriptUpdate(event.text);
        }
        break;

      case 'audio':
        if (event.audio) {
          console.log('收到AI音频数据:', event.audio.byteLength, '字节');
          this.playAudioData(event.audio);
          this.updateCallState({ lastActivity: Date.now() });
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
   * 修复：改进的音频数据处理 - 不重置AI响应超时
   */
  private handleAudioData(audioData: ArrayBuffer): void {
    if (!this.doubaoClient || !this.doubaoClient.isConnectionActive()) {
      console.warn('豆包客户端未连接，跳过音频数据发送');
      return;
    }

    try {
      console.log('发送音频数据到豆包，大小:', audioData.byteLength);
      this.doubaoClient.sendAudio(audioData);
      this.updateCallState({ lastActivity: Date.now() });
      
      // 移除重置逻辑：用户发送音频（可能是噪音）不应该重置AI响应超时
      // 只有收到AI的实际响应时才重置超时定时器
      // this.resetSilenceTimer();
    } catch (error) {
      console.error('处理音频数据失败:', error);
      // 不要因为单次音频数据发送失败就结束通话
    }
  }

  private handleSilenceDetected(duration: number): void {
    // 移除超时机制后，这个方法只用于日志记录
    if (duration > 0) {
      console.log('检测到静音:', duration, 'ms');
    }
  }

  /**
   * 修复：改进的音频播放 - 使用队列避免重叠
   */
  private async playAudioData(audioData: ArrayBuffer): Promise<void> {
    try {
      console.log('接收到音频数据，大小:', audioData.byteLength, '队列长度:', this.audioQueue.length);
      
      // 检查数据是否为有效的音频格式
      if (audioData.byteLength === 0) {
        console.warn('音频数据为空，跳过播放');
        return;
      }

      // 初始化音频上下文
      if (!this.audioContext) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
          throw new Error('浏览器不支持AudioContext');
        }
        this.audioContext = new AudioContextClass();
      }
      
      // 确保音频上下文处于运行状态
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // 添加到队列
      this.audioQueue.push(audioData);
      
      // 如果当前没有播放，开始播放队列
      if (!this.isPlaying) {
        this.processAudioQueue();
      }
      
    } catch (error) {
      console.error('播放音频失败:', error);
    }
  }

  /**
   * 新增：处理音频播放队列
   */
  private async processAudioQueue(): Promise<void> {
    if (this.isPlaying || this.audioQueue.length === 0 || !this.audioContext) {
      return;
    }

    this.isPlaying = true;
    console.log('开始处理音频队列，剩余:', this.audioQueue.length);

    try {
      while (this.audioQueue.length > 0) {
        const audioData = this.audioQueue.shift()!;
        await this.playRawPCMData(audioData);
      }
    } catch (error) {
      console.error('处理音频队列失败:', error);
    } finally {
      this.isPlaying = false;
      console.log('音频队列处理完成');
    }
  }

  /**
   * 新增：播放原始PCM数据 - 根据豆包demo调整，支持队列播放
   */
  private async playRawPCMData(audioData: ArrayBuffer): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('播放音频片段, 数据长度:', audioData.byteLength);
        
        if (!this.audioContext) {
          reject(new Error('AudioContext未初始化'));
          return;
        }
        
        // 根据豆包demo配置：24000Hz, 单声道, 可能是Float32格式
        const sampleRate = 24000;
        const channels = 1;
        
        // 首先尝试检测数据格式
        let audioBuffer: AudioBuffer;
        
        // 尝试1: 假设是Float32格式（与demo的paFloat32一致）
        try {
          const float32Array = new Float32Array(audioData);
          
          // 检查数据范围是否合理（Float32应该在-1到1之间）
          let minVal = float32Array[0] || 0;
          let maxVal = float32Array[0] || 0;
          for (let i = 1; i < Math.min(100, float32Array.length); i++) {
            minVal = Math.min(minVal, float32Array[i]);
            maxVal = Math.max(maxVal, float32Array[i]);
          }
          
          if (Math.abs(minVal) <= 1.2 && Math.abs(maxVal) <= 1.2) {
            // 看起来像Float32数据
            audioBuffer = this.audioContext.createBuffer(channels, float32Array.length, sampleRate);
            audioBuffer.copyToChannel(float32Array, 0);
            console.log('使用Float32格式播放, 样本数:', float32Array.length);
          } else {
            throw new Error('不是Float32格式');
          }
        } catch (e) {
          // 尝试2: 假设是16位PCM格式
          console.log('Float32失败，尝试16位PCM格式');
          const int16Array = new Int16Array(audioData);
          const float32Array = new Float32Array(int16Array.length);
          
          // 转换为Float32格式
          for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768.0; // 归一化到-1到1
          }
          
          audioBuffer = this.audioContext.createBuffer(channels, float32Array.length, sampleRate);
          audioBuffer.copyToChannel(float32Array, 0);
          console.log('使用16位PCM格式播放, 样本数:', float32Array.length);
        }
        
        // 停止之前的播放
        if (this.currentAudioSource) {
          try {
            this.currentAudioSource.stop();
          } catch (e) {
            // 忽略停止错误
          }
        }
        
        // 创建音频源并播放
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioContext.destination);
        
        this.currentAudioSource = source;
        
        // 监听播放结束
        source.onended = () => {
          console.log('音频片段播放完成，时长:', audioBuffer.duration, '秒');
          this.currentAudioSource = null;
          resolve();
        };
        
        source.start();
        
      } catch (error) {
        console.error('PCM音频播放失败:', error);
        reject(error);
      }
    });
  }

  async endCall(reason: 'user_hangup' | 'timeout' | 'error' = 'user_hangup'): Promise<void> {
    try {
      console.log('结束语音通话，原因:', reason);
      
      await this.cleanup();
      
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

      console.log('语音通话已结束');

    } catch (error) {
      console.error('结束语音通话失败:', error);
    }
  }

  /**
   * 新增：资源清理方法
   */
  private async cleanup(): Promise<void> {
    try {
      // 停止音频播放
      if (this.currentAudioSource) {
        try {
          this.currentAudioSource.stop();
        } catch (e) {
          // 忽略停止错误
        }
        this.currentAudioSource = null;
      }
      
      // 清空音频队列
      this.audioQueue = [];
      this.isPlaying = false;
      
      // 关闭音频上下文
      if (this.audioContext && this.audioContext.state !== 'closed') {
        try {
          await this.audioContext.close();
        } catch (e) {
          // 忽略关闭错误
        }
        this.audioContext = null;
      }

      // 停止音频捕获
      if (this.audioProcessor) {
        this.audioProcessor.stopCapture();
      }

      // 关闭豆包连接
      if (this.doubaoClient) {
        await this.doubaoClient.close();
        this.doubaoClient = null;
      }
    } catch (error) {
      console.error('清理资源失败:', error);
    }
  }

  private startCallTimer(): void {
    const updateDuration = () => {
      if (this.callState.isCallActive) {
        const duration = Date.now() - this.callStartTime;
        this.updateCallState({ callDuration: duration });
        setTimeout(updateDuration, 1000);
      }
    };
    updateDuration();
  }

  private updateCallState(updates: Partial<VoiceCallState>): void {
    this.callState = { ...this.callState, ...updates };
    this.onStateChange(this.callState);
  }

  toggleMute(): void {
    console.log('切换静音状态');
    // TODO: 实现静音功能
  }

  togglePause(): void {
    console.log('切换暂停状态');
    // TODO: 实现暂停功能
  }

  getCallState(): VoiceCallState {
    return { ...this.callState };
  }

  isCallActive(): boolean {
    return this.callState.isCallActive && this.callState.connectionStatus === 'connected';
  }

  dispose(): void {
    this.endCall('user_hangup');
    
    if (this.audioProcessor) {
      this.audioProcessor.dispose();
      this.audioProcessor = null;
    }
  }
}