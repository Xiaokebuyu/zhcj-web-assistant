import { AudioVisualizationData } from '@/types';

/**
 * 音频处理器类
 * 负责音频捕获、格式转换、静音检测和可视化数据生成
 */
export class AudioProcessor {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private scriptProcessorNode: ScriptProcessorNode | null = null;
  private isRecording: boolean = false;
  private silenceThreshold: number = 0.01; // 静音阈值
  private silenceStartTime: number = 0;
  private onAudioData: ((audioData: ArrayBuffer) => void) | null = null;
  private onSilenceDetected: ((duration: number) => void) | null = null;
  private onVisualizationData: ((data: AudioVisualizationData) => void) | null = null;

  // 音频配置
  private readonly sampleRate = 16000; // 豆包要求的采样率
  private readonly channels = 1; // 单声道
  private readonly bufferSize = 3200; // 与豆包示例一致

  constructor() {
    this.initializeAudioContext();
  }

  /**
   * 初始化音频上下文
   */
  private async initializeAudioContext(): Promise<void> {
    try {
      // 创建AudioContext，指定采样率
      const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('浏览器不支持AudioContext');
      }
      this.audioContext = new AudioContextClass({
        sampleRate: this.sampleRate
      });

      // 创建分析器节点用于可视化和静音检测
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 2048;
      this.analyserNode.smoothingTimeConstant = 0.8;

    } catch (error) {
      console.error('初始化音频上下文失败:', error);
      throw new Error('不支持Web Audio API');
    }
  }

  /**
   * 开始音频捕获
   */
  async startCapture(
    onAudioData: (audioData: ArrayBuffer) => void,
    onSilenceDetected?: (duration: number) => void,
    onVisualizationData?: (data: AudioVisualizationData) => void
  ): Promise<void> {
    if (this.isRecording) {
      throw new Error('音频捕获已在进行中');
    }

    this.onAudioData = onAudioData;
    this.onSilenceDetected = onSilenceDetected || null;
    this.onVisualizationData = onVisualizationData || null;

    try {
      // 检查浏览器支持
      const support = AudioProcessor.checkSupport();
      if (!support.mediaDevices) {
        throw new Error('浏览器不支持MediaDevices API，无法访问麦克风');
      }
      if (!support.audioContext) {
        throw new Error('浏览器不支持Web Audio API');
      }

      console.log('正在请求麦克风权限...');
      
      // 请求麦克风权限
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.sampleRate,
          channelCount: this.channels,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      console.log('麦克风权限获取成功');

      if (!this.audioContext || !this.analyserNode) {
        await this.initializeAudioContext();
      }

      // 恢复音频上下文（某些浏览器需要用户交互后才能启动）
      if (this.audioContext!.state === 'suspended') {
        console.log('正在恢复音频上下文...');
        await this.audioContext!.resume();
      }

      // 创建源节点
      this.sourceNode = this.audioContext!.createMediaStreamSource(this.mediaStream);
      
      // 创建脚本处理器节点
      this.scriptProcessorNode = this.audioContext!.createScriptProcessor(
        this.bufferSize, 
        this.channels, 
        this.channels
      );

      // 连接音频节点
      this.sourceNode.connect(this.analyserNode!);
      this.analyserNode!.connect(this.scriptProcessorNode);
      this.scriptProcessorNode.connect(this.audioContext!.destination);

      // 设置音频处理回调
      this.scriptProcessorNode.onaudioprocess = (event) => {
        try {
          this.processAudioData(event);
        } catch (error) {
          console.error('音频数据处理失败:', error);
        }
      };

      this.isRecording = true;
      this.silenceStartTime = Date.now();
      
      console.log('音频捕获已开始');

    } catch (error) {
      console.error('开始音频捕获失败:', error);
      this.cleanup();
      
      // 提供更具体的错误信息
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw new Error('麦克风权限被拒绝，请在浏览器设置中允许访问麦克风');
        } else if (error.name === 'NotFoundError') {
          throw new Error('未找到可用的麦克风设备');
        } else if (error.name === 'NotSupportedError') {
          throw new Error('当前浏览器不支持音频捕获');
        } else if (error.name === 'NotReadableError') {
          throw new Error('麦克风设备被其他应用占用');
        } else {
          throw new Error(`音频捕获失败: ${error.message}`);
        }
      } else {
        throw new Error('音频捕获失败: 未知错误');
      }
    }
  }

  /**
   * 处理音频数据
   */
  private processAudioData(event: AudioProcessingEvent): void {
    if (!this.isRecording || !this.onAudioData) return;

    const inputBuffer = event.inputBuffer;
    const channelData = inputBuffer.getChannelData(0); // 获取第一个声道

    // 计算音量用于静音检测
    const volume = this.calculateVolume(channelData);

    // 静音检测
    if (volume < this.silenceThreshold) {
      if (this.silenceStartTime === 0) {
        this.silenceStartTime = Date.now();
      } else {
        const silenceDuration = Date.now() - this.silenceStartTime;
        if (this.onSilenceDetected && silenceDuration > 1000) { // 1秒以上静音才报告
          this.onSilenceDetected(silenceDuration);
        }
      }
    } else {
      this.silenceStartTime = 0; // 重置静音计时
    }

    // 生成可视化数据
    if (this.onVisualizationData && this.analyserNode) {
      const visualizationData = this.generateVisualizationData(volume);
      this.onVisualizationData(visualizationData);
    }

    // 转换为PCM格式并发送
    const pcmData = this.convertToPCM(channelData);
    this.onAudioData(pcmData.buffer as ArrayBuffer);
  }

  /**
   * 计算音频音量
   */
  private calculateVolume(channelData: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < channelData.length; i++) {
      sum += channelData[i] * channelData[i];
    }
    return Math.sqrt(sum / channelData.length);
  }

  /**
   * 转换为PCM格式（16位整数）
   */
  private convertToPCM(float32Array: Float32Array): Int16Array {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      // 将-1到1的浮点数转换为-32768到32767的整数
      const sample = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }
    return int16Array;
  }

  /**
   * 生成音频可视化数据
   */
  private generateVisualizationData(volume: number): AudioVisualizationData {
    if (!this.analyserNode) {
      return {
        waveform: [],
        volume: 0,
        frequency: []
      };
    }

    // 获取频域数据
    const frequencyData = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(frequencyData);

    // 获取时域数据（波形）
    const waveformData = new Uint8Array(this.analyserNode.fftSize);
    this.analyserNode.getByteTimeDomainData(waveformData);

    // 简化波形数据（取样）
    const waveformSamples = 32; // 32个采样点用于显示
    const waveform: number[] = [];
    const step = Math.floor(waveformData.length / waveformSamples);
    
    for (let i = 0; i < waveformSamples; i++) {
      const index = i * step;
      // 将0-255的值转换为-1到1的范围
      waveform.push((waveformData[index] - 128) / 128);
    }

    // 简化频率数据
    const frequencySamples = 16; // 16个频段
    const frequency: number[] = [];
    const freqStep = Math.floor(frequencyData.length / frequencySamples);
    
    for (let i = 0; i < frequencySamples; i++) {
      const index = i * freqStep;
      // 归一化到0-1范围
      frequency.push(frequencyData[index] / 255);
    }

    return {
      waveform,
      volume,
      frequency
    };
  }

  /**
   * 停止音频捕获
   */
  stopCapture(): void {
    if (!this.isRecording) return;

    this.isRecording = false;
    this.cleanup();
    
    console.log('音频捕获已停止');
  }

  /**
   * 清理资源
   */
  private cleanup(): void {
    try {
      // 断开音频节点连接
      if (this.scriptProcessorNode) {
        this.scriptProcessorNode.disconnect();
        this.scriptProcessorNode = null;
      }

      if (this.sourceNode) {
        this.sourceNode.disconnect();
        this.sourceNode = null;
      }

      if (this.analyserNode) {
        this.analyserNode.disconnect();
      }

      // 停止媒体流
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => {
          track.stop();
        });
        this.mediaStream = null;
      }

      // 重置回调
      this.onAudioData = null;
      this.onSilenceDetected = null;
      this.onVisualizationData = null;
      
      this.silenceStartTime = 0;

    } catch (error) {
      console.error('清理音频资源失败:', error);
    }
  }

  /**
   * 检查是否正在录音
   */
  isCapturing(): boolean {
    return this.isRecording;
  }

  /**
   * 设置静音检测阈值
   */
  setSilenceThreshold(threshold: number): void {
    this.silenceThreshold = Math.max(0, Math.min(1, threshold));
  }

  /**
   * 获取当前音频上下文状态
   */
  getAudioContextState(): string {
    return this.audioContext?.state || 'not-initialized';
  }

  /**
   * 检查浏览器支持情况
   */
  static checkSupport(): { 
    mediaDevices: boolean; 
    audioContext: boolean; 
    scriptProcessor: boolean;
  } {
    const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    return {
      mediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      audioContext: !!AudioContextClass,
      scriptProcessor: !!AudioContextClass
    };
  }

  /**
   * 释放所有资源
   */
  dispose(): void {
    this.stopCapture();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}