import { DoubaoVoiceConfig, RealtimeTranscriptEvent } from '@/types';

// 豆包协议常量
const PROTOCOL_VERSION = 0b0001;

// Message Type
const CLIENT_FULL_REQUEST = 0b0001;
const CLIENT_AUDIO_ONLY_REQUEST = 0b0010;
const SERVER_FULL_RESPONSE = 0b1001;
const SERVER_ACK = 0b1011;
const SERVER_ERROR_RESPONSE = 0b1111;

// Message Type Specific Flags
const NEG_SEQUENCE = 0b0010;
const MSG_WITH_EVENT = 0b0100;

// Message Serialization
const NO_SERIALIZATION = 0b0000;
const JSON_SERIALIZATION = 0b0001;

// Message Compression
const GZIP = 0b0001;

/**
 * 豆包实时语音客户端
 * 实现WebSocket协议与豆包语音服务的通信
 */
export class DoubaoVoiceClient {
  private ws: WebSocket | null = null;
  private config: DoubaoVoiceConfig;
  private sessionId: string;
  private logId: string = '';
  private isConnected: boolean = false;
  private onEvent: (event: RealtimeTranscriptEvent) => void;

  constructor(config: DoubaoVoiceConfig, sessionId: string, onEvent: (event: RealtimeTranscriptEvent) => void) {
    this.config = config;
    this.sessionId = sessionId;
    this.onEvent = onEvent;
  }

  /**
   * 生成协议头部
   */
  private generateHeader(
    version = PROTOCOL_VERSION,
    messageType = CLIENT_FULL_REQUEST,
    messageTypeSpecificFlags = MSG_WITH_EVENT,
    serialMethod = JSON_SERIALIZATION,
    compressionType = GZIP,
    reservedData = 0x00,
    extensionHeader = new Uint8Array()
  ): Uint8Array {
    const header = new Uint8Array(4 + extensionHeader.length);
    const headerSize = Math.floor(extensionHeader.length / 4) + 1;
    
    header[0] = (version << 4) | headerSize;
    header[1] = (messageType << 4) | messageTypeSpecificFlags;
    header[2] = (serialMethod << 4) | compressionType;
    header[3] = reservedData;
    
    if (extensionHeader.length > 0) {
      header.set(extensionHeader, 4);
    }
    
    return header;
  }

  /**
   * 压缩数据（简化版gzip）
   */
  private async compressData(data: Uint8Array): Promise<Uint8Array> {
    try {
      // 在浏览器环境中使用CompressionStream
      if ('CompressionStream' in window) {
        const stream = new CompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();
        
        writer.write(data);
        writer.close();
        
        const chunks: Uint8Array[] = [];
        let done = false;
        
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          if (value) {
            chunks.push(value);
          }
        }
        
        // 合并chunks
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.length;
        }
        
        return result;
      } else {
        // 如果不支持CompressionStream，返回原始数据
        console.warn('CompressionStream not supported, sending uncompressed data');
        return data;
      }
    } catch (error) {
      console.error('Compression failed:', error);
      return data;
    }
  }

  /**
   * 解压数据
   */
  private async decompressData(data: Uint8Array): Promise<Uint8Array> {
    try {
      if ('DecompressionStream' in window) {
        const stream = new DecompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();
        
        writer.write(data);
        writer.close();
        
        const chunks: Uint8Array[] = [];
        let done = false;
        
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          if (value) {
            chunks.push(value);
          }
        }
        
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.length;
        }
        
        return result;
      } else {
        return data;
      }
    } catch (error) {
      console.error('Decompression failed:', error);
      return data;
    }
  }

  /**
   * 将字符串转换为Uint8Array
   */
  private stringToUint8Array(str: string): Uint8Array {
    return new TextEncoder().encode(str);
  }

  /**
   * 将数字转换为4字节大端序数组
   */
  private numberToBytes(num: number): Uint8Array {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint32(0, num, false); // false表示大端序
    return new Uint8Array(buffer);
  }

  /**
   * 建立WebSocket连接
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 检查配置是否完整
        if (!this.config.baseUrl) {
          const error = new Error('WebSocket URL配置缺失');
          console.error('WebSocket连接失败:', error);
          reject(error);
          return;
        }

        console.log('正在连接WebSocket代理服务器:', this.config.baseUrl);
        
        // 连接到本地代理服务器
        this.ws = new WebSocket(this.config.baseUrl);
        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = () => {
          console.log('WebSocket代理连接已建立，等待豆包服务连接...');
        };

        this.ws.onmessage = (event) => {
          try {
            // 检查是否是JSON消息（代理服务器的状态消息）
            if (typeof event.data === 'string') {
              const message = JSON.parse(event.data);
              
              switch (message.type) {
                case 'connected':
                  console.log('豆包服务连接成功');
                  this.isConnected = true;
                  resolve();
                  break;
                  
                case 'error':
                  console.error('代理服务器错误:', message.error);
                  this.onEvent({
                    type: 'error',
                    error: message.error,
                    timestamp: Date.now()
                  });
                  reject(new Error(message.error));
                  break;
                  
                case 'end':
                  console.log('豆包服务连接已结束');
                  this.isConnected = false;
                  this.onEvent({
                    type: 'end',
                    timestamp: Date.now()
                  });
                  break;
              }
            } else {
              // 二进制数据，处理豆包的响应
              this.handleMessage(event.data);
            }
          } catch (error) {
            console.error('处理WebSocket消息失败:', error);
            this.onEvent({
              type: 'error',
              error: error instanceof Error ? error.message : '消息处理失败',
              timestamp: Date.now()
            });
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket代理连接错误:', error);
          const errorMessage = '代理服务器连接失败，请检查服务器是否正常运行';
          this.onEvent({
            type: 'error',
            error: errorMessage,
            timestamp: Date.now()
          });
          reject(new Error(errorMessage));
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket代理连接已关闭');
          console.log('关闭码:', event.code, '原因:', event.reason);
          
          this.isConnected = false;
          this.onEvent({
            type: 'end',
            timestamp: Date.now()
          });
        };

        // 设置连接超时
        setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
            this.ws.close();
            const timeoutError = new Error('WebSocket代理连接超时');
            console.error('WebSocket代理连接超时');
            reject(timeoutError);
          }
        }, 10000); // 10秒超时

      } catch (error) {
        console.error('创建WebSocket连接失败:', error);
        const errorMessage = error instanceof Error ? error.message : '创建WebSocket连接失败';
        reject(new Error(`WebSocket初始化失败: ${errorMessage}`));
      }
    });
  }

  /**
   * 生成连接ID
   */
  private generateConnectId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }



  /**
   * 发送音频数据
   */
  async sendAudio(audioData: ArrayBuffer): Promise<void> {
    if (!this.ws || !this.isConnected) {
      throw new Error('WebSocket未连接');
    }

    const header = this.generateHeader(
      PROTOCOL_VERSION,
      CLIENT_AUDIO_ONLY_REQUEST,
      MSG_WITH_EVENT,
      NO_SERIALIZATION
    );
    
    const sessionIdBytes = this.stringToUint8Array(this.sessionId);
    const audioBytes = new Uint8Array(audioData);
    const compressedAudio = await this.compressData(audioBytes);
    
    const message = new Uint8Array(
      header.length + 4 + 4 + sessionIdBytes.length + 4 + compressedAudio.length
    );
    
    let offset = 0;
    message.set(header, offset);
    offset += header.length;
    
    message.set(this.numberToBytes(200), offset); // task request
    offset += 4;
    
    message.set(this.numberToBytes(sessionIdBytes.length), offset);
    offset += 4;
    
    message.set(sessionIdBytes, offset);
    offset += sessionIdBytes.length;
    
    message.set(this.numberToBytes(compressedAudio.length), offset);
    offset += 4;
    
    message.set(compressedAudio, offset);
    
    this.ws.send(message);
  }

  /**
   * 处理接收到的消息
   */
  private async handleMessage(data: ArrayBuffer): Promise<void> {
    try {
      const response = await this.parseResponse(new Uint8Array(data));
      
      if (response.messageType === 'SERVER_ACK' && response.payloadMsg instanceof Uint8Array) {
        // 音频数据
        this.onEvent({
          type: 'audio',
          audio: response.payloadMsg.buffer as ArrayBuffer,
          timestamp: Date.now()
        });
      } else if (response.messageType === 'SERVER_FULL_RESPONSE') {
        // 文本响应或控制消息
        if (response.event === 450) {
          // 清空缓存音频事件
          console.log('收到清空缓存指令');
        }
        if (typeof response.payloadMsg === 'string') {
          this.onEvent({
            type: 'transcript',
            text: response.payloadMsg,
            isFinal: true,
            timestamp: Date.now()
          });
        }
      } else if (response.messageType === 'SERVER_ERROR') {
        this.onEvent({
          type: 'error',
          error: response.payloadMsg as string,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('处理消息失败:', error);
      this.onEvent({
        type: 'error',
        error: '消息处理失败',
        timestamp: Date.now()
      });
    }
  }

  /**
   * 解析服务器响应
   */
  private async parseResponse(data: Uint8Array): Promise<{
    messageType?: string;
    event?: number;
    payloadMsg?: unknown;
    sessionId?: string;
    code?: number;
  }> {
    if (data.length < 4) {
      throw new Error('数据长度不足');
    }

    const headerSize = data[0] & 0x0f;
    const messageType = data[1] >> 4;
    const messageTypeSpecificFlags = data[1] & 0x0f;
    const serializationMethod = data[2] >> 4;
    const messageCompression = data[2] & 0x0f;
    
    const payload = data.slice(headerSize * 4);
    
    const result: {
      messageType?: string;
      event?: number;
      payloadMsg?: unknown;
      sessionId?: string;
      code?: number;
      seq?: number;
    } = {};
    let payloadMsg: unknown = null;
    let start = 0;
    
    if (messageType === SERVER_FULL_RESPONSE || messageType === SERVER_ACK) {
      result.messageType = messageType === SERVER_ACK ? 'SERVER_ACK' : 'SERVER_FULL_RESPONSE';
      
      if (messageTypeSpecificFlags & NEG_SEQUENCE) {
        const view = new DataView(payload.buffer, payload.byteOffset + start, 4);
        result.seq = view.getUint32(0, false);
        start += 4;
      }
      
      if (messageTypeSpecificFlags & MSG_WITH_EVENT) {
        const view = new DataView(payload.buffer, payload.byteOffset + start, 4);
        result.event = view.getUint32(0, false);
        start += 4;
      }
      
      const remainingPayload = payload.slice(start);
      if (remainingPayload.length >= 4) {
        const view = new DataView(remainingPayload.buffer, remainingPayload.byteOffset, 4);
        const sessionIdSize = view.getInt32(0, false);
        
        if (remainingPayload.length >= 4 + sessionIdSize + 4) {
          const sessionId = remainingPayload.slice(4, 4 + sessionIdSize);
          result.sessionId = new TextDecoder().decode(sessionId);
          
          payloadMsg = remainingPayload.slice(4 + sessionIdSize + 4);
        }
      }
    } else if (messageType === SERVER_ERROR_RESPONSE) {
      const view = new DataView(payload.buffer, payload.byteOffset, 4);
      result.code = view.getUint32(0, false);
      
      payloadMsg = payload.slice(8);
      result.messageType = 'SERVER_ERROR';
    }
    
    if (payloadMsg) {
      if (messageCompression === GZIP && payloadMsg instanceof Uint8Array) {
        payloadMsg = await this.decompressData(payloadMsg);
      }
      
      if (serializationMethod === JSON_SERIALIZATION && payloadMsg instanceof Uint8Array) {
        const text = new TextDecoder().decode(payloadMsg);
        try {
          payloadMsg = JSON.parse(text);
        } catch {
          payloadMsg = text;
        }
      } else if (serializationMethod !== NO_SERIALIZATION && payloadMsg instanceof Uint8Array) {
        payloadMsg = new TextDecoder().decode(payloadMsg);
      }
    }
    
    result.payloadMsg = payloadMsg;
    return result;
  }

  /**
   * 结束会话
   */
  async endSession(): Promise<void> {
    if (!this.ws || !this.isConnected) return;

    try {
      const header = this.generateHeader();
      const sessionIdBytes = this.stringToUint8Array(this.sessionId);
      const payload = this.stringToUint8Array('{}');
      const compressedPayload = await this.compressData(payload);
      
      const message = new Uint8Array(
        header.length + 4 + 4 + sessionIdBytes.length + 4 + compressedPayload.length
      );
      
      let offset = 0;
      message.set(header, offset);
      offset += header.length;
      
      message.set(this.numberToBytes(102), offset); // finish session
      offset += 4;
      
      message.set(this.numberToBytes(sessionIdBytes.length), offset);
      offset += 4;
      
      message.set(sessionIdBytes, offset);
      offset += sessionIdBytes.length;
      
      message.set(this.numberToBytes(compressedPayload.length), offset);
      offset += 4;
      
      message.set(compressedPayload, offset);
      
      this.ws.send(message);
    } catch (error) {
      console.error('结束会话失败:', error);
    }
  }

  /**
   * 关闭连接
   */
  async close(): Promise<void> {
    if (!this.ws) return;

    try {
      await this.endSession();
      
      // 等待一小段时间让结束会话消息发送
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.ws.close();
      this.isConnected = false;
    } catch (error) {
      console.error('关闭连接失败:', error);
      if (this.ws) {
        this.ws.close();
      }
    }
  }

  /**
   * 检查连接状态
   */
  isConnectionActive(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }
}