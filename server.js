const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebSocket = require('ws');
const gzip = require('zlib');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// 创建Next.js应用
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// 豆包协议常量
const PROTOCOL_VERSION = 0b0001;
const CLIENT_FULL_REQUEST = 0b0001;
const CLIENT_AUDIO_ONLY_REQUEST = 0b0010;
const SERVER_FULL_RESPONSE = 0b1001;
const SERVER_ACK = 0b1011;
const SERVER_ERROR_RESPONSE = 0b1111;
const NEG_SEQUENCE = 0b0010;
const MSG_WITH_EVENT = 0b0100;
const NO_SERIALIZATION = 0b0000;
const JSON_SERIALIZATION = 0b0001;
const GZIP = 0b0001;

// 生成协议头
function generateHeader(
  version = PROTOCOL_VERSION,
  messageType = CLIENT_FULL_REQUEST,
  messageTypeSpecificFlags = MSG_WITH_EVENT,
  serialMethod = JSON_SERIALIZATION,
  compressionType = GZIP,
  reservedData = 0x00,
  extensionHeader = Buffer.alloc(0)
) {
  const headerSize = 4 + extensionHeader.length;
  const header = Buffer.alloc(headerSize);
  
  header[0] = (headerSize >> 2) | (version << 4);
  header[1] = (messageType << 4) | messageTypeSpecificFlags;
  header[2] = (serialMethod << 4) | compressionType;
  header[3] = reservedData;
  
  if (extensionHeader.length > 0) {
    extensionHeader.copy(header, 4);
  }
  
  return header;
}

// 数字转换为4字节大端序
function numberToBytes(num) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(num, 0);
  return buffer;
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // 创建WebSocket服务器
  const wss = new WebSocket.Server({ 
    server,
    path: '/api/voice/realtime'
  });

  wss.on('connection', (ws, req) => {
    console.log('新的WebSocket连接');
    
    const url = parse(req.url, true);
    const sessionId = url.query.sessionId;
    
    if (!sessionId) {
      ws.close(1008, '缺少会话ID');
      return;
    }

    let doubaoWs = null;
    let isConnected = false;

    // 连接到豆包服务
    const connectToDoubao = async () => {
      try {
        console.log('正在连接到豆包服务...');
        
        // 使用ws库连接豆包，支持自定义headers
        doubaoWs = new WebSocket('wss://openspeech.bytedance.com/api/v3/realtime/dialogue', {
          headers: {
            'X-Api-App-ID': '2139817228',
            'X-Api-Access-Key': 'LMxFTYn2mmWwQwmLfT3ZbwS4yj0JPiMt',
            'X-Api-Resource-Id': 'volc.speech.dialog',
            'X-Api-Connect-Id': Date.now().toString() + Math.random().toString(36).substr(2, 9)
          }
        });

        doubaoWs.on('open', async () => {
          console.log('豆包WebSocket连接已建立');
          
          try {
            // 发送开始连接请求
            const header = generateHeader();
            const payload = Buffer.from('{}');
            const compressedPayload = gzip.gzipSync(payload);
            
            const message = Buffer.concat([
              header,
              numberToBytes(1),
              numberToBytes(compressedPayload.length),
              compressedPayload
            ]);
            
            doubaoWs.send(message);
            
            // 等待响应后发送开始会话请求
            setTimeout(async () => {
              const startSessionReq = {
                tts: {
                  audio_config: {
                    channel: 1,
                    format: 'pcm',
                    sample_rate: 24000
                  }
                },
                dialog: {
                  bot_name: '豆包'
                }
              };

              const sessionHeader = generateHeader();
              const sessionIdBytes = Buffer.from(sessionId);
              const sessionPayload = Buffer.from(JSON.stringify(startSessionReq));
              const compressedSessionPayload = gzip.gzipSync(sessionPayload);
              
              const sessionMessage = Buffer.concat([
                sessionHeader,
                numberToBytes(100),
                numberToBytes(sessionIdBytes.length),
                sessionIdBytes,
                numberToBytes(compressedSessionPayload.length),
                compressedSessionPayload
              ]);
              
              doubaoWs.send(sessionMessage);
              isConnected = true;
              
              // 通知客户端连接成功
              ws.send(JSON.stringify({
                type: 'connected',
                sessionId: sessionId
              }));
              
            }, 100);
            
          } catch (error) {
            console.error('豆包初始化失败:', error);
            ws.send(JSON.stringify({
              type: 'error',
              error: '豆包服务初始化失败'
            }));
          }
        });

        doubaoWs.on('message', (data) => {
          // 转发豆包的消息到客户端
          try {
            ws.send(data);
          } catch (error) {
            console.error('转发消息失败:', error);
          }
        });

        doubaoWs.on('error', (error) => {
          console.error('豆包WebSocket错误:', error);
          ws.send(JSON.stringify({
            type: 'error',
            error: '豆包服务连接错误'
          }));
        });

        doubaoWs.on('close', () => {
          console.log('豆包WebSocket连接已关闭');
          isConnected = false;
          ws.send(JSON.stringify({
            type: 'end'
          }));
        });

      } catch (error) {
        console.error('连接豆包服务失败:', error);
        ws.send(JSON.stringify({
          type: 'error',
          error: '无法连接到豆包服务'
        }));
      }
    };

    // 处理客户端消息
    ws.on('message', (message) => {
      try {
        if (doubaoWs && isConnected && doubaoWs.readyState === WebSocket.OPEN) {
          // 转发客户端消息到豆包
          doubaoWs.send(message);
        }
      } catch (error) {
        console.error('转发客户端消息失败:', error);
      }
    });

    ws.on('close', () => {
      console.log('客户端WebSocket连接已关闭');
      if (doubaoWs && doubaoWs.readyState === WebSocket.OPEN) {
        doubaoWs.close();
      }
    });

    ws.on('error', (error) => {
      console.error('客户端WebSocket错误:', error);
    });

    // 开始连接到豆包
    connectToDoubao();
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log('> WebSocket代理服务器已启动在 /api/voice/realtime');
  });
}); 