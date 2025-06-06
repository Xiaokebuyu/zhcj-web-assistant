"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("@fastify/cors"));
const messageHandler_1 = require("./services/messageHandler");
const connectionManager_1 = require("./services/connectionManager");
// 创建 Fastify 实例
const fastify = (0, fastify_1.default)({
    logger: {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true
            }
        }
    }
});
// 注册 CORS 插件
fastify.register(cors_1.default, {
    origin: true, // 允许所有来源（生产环境应该限制）
    methods: ['GET', 'POST'],
    credentials: true
});
// 基本健康检查接口
fastify.get('/health', async (request, reply) => {
    return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'web-assistant-api'
    };
});
// API 路由
fastify.get('/api/status', async (request, reply) => {
    return {
        service: '智能网页助手',
        version: '1.0.0',
        connections: connectionManager_1.ConnectionManager.getConnectionCount(),
        uptime: process.uptime()
    };
});
// 启动服务器
const start = async () => {
    try {
        // 启动 HTTP 服务器，指定端口范围自动寻找可用端口
        let port = 3001;
        let server;
        // 尝试从 3001 开始寻找可用端口
        while (port < 3010) {
            try {
                server = await fastify.listen({
                    port: port,
                    host: '0.0.0.0'
                });
                break;
            }
            catch (err) {
                if (err.code === 'EADDRINUSE') {
                    console.log(`端口 ${port} 被占用，尝试下一个端口...`);
                    port++;
                }
                else {
                    throw err;
                }
            }
        }
        if (!server) {
            throw new Error('无法找到可用端口 (3001-3009)');
        }
        console.log('🚀 服务器启动成功!');
        console.log(`📡 HTTP 服务: http://localhost:${port}`);
        console.log(`🔌 WebSocket 服务: ws://localhost:${port}`);
        // 创建 Socket.IO 服务器
        const io = new socket_io_1.Server(fastify.server, {
            cors: {
                origin: "*", // 生产环境应该限制来源
                methods: ["GET", "POST"]
            },
            transports: ['websocket', 'polling']
        });
        // 初始化服务
        const messageHandler = new messageHandler_1.MessageHandler();
        // Socket.IO 连接处理
        io.on('connection', (socket) => {
            console.log(`✅ 新客户端连接: ${socket.id}`);
            // 验证 API Key（简单示例）
            const { apiKey, clientInfo } = socket.handshake.auth;
            if (!apiKey) {
                console.log(`❌ 客户端 ${socket.id} 缺少 API Key`);
                socket.emit('error', { message: '缺少 API Key' });
                socket.disconnect();
                return;
            }
            // 注册连接
            connectionManager_1.ConnectionManager.addConnection(socket.id, {
                apiKey,
                clientInfo,
                connectedAt: new Date()
            });
            // 发送欢迎消息
            socket.emit('response', {
                type: 'welcome',
                content: '🎉 连接成功！我是你的智能网页助手，有什么可以帮你的吗？',
                timestamp: new Date().toISOString()
            });
            // 处理消息
            socket.on('message', async (data) => {
                try {
                    console.log(`📥 收到消息 [${socket.id}]:`, data);
                    // 处理消息并获取响应
                    const response = await messageHandler.handleMessage(data, {
                        socketId: socket.id,
                        apiKey,
                        clientInfo
                    });
                    // 发送响应
                    socket.emit('response', {
                        type: 'message',
                        content: response,
                        messageId: data.id,
                        timestamp: new Date().toISOString()
                    });
                    console.log(`📤 发送响应 [${socket.id}]:`, response);
                }
                catch (error) {
                    console.error(`❌ 处理消息错误 [${socket.id}]:`, error);
                    socket.emit('error', {
                        message: '处理消息时发生错误',
                        messageId: data.id,
                        timestamp: new Date().toISOString()
                    });
                }
            });
            // 处理断开连接
            socket.on('disconnect', (reason) => {
                console.log(`🔌 客户端断开连接: ${socket.id}, 原因: ${reason}`);
                connectionManager_1.ConnectionManager.removeConnection(socket.id);
            });
            // 处理错误
            socket.on('error', (error) => {
                console.error(`❌ Socket 错误 [${socket.id}]:`, error);
            });
        });
        // 优雅关闭
        const gracefulShutdown = () => {
            console.log('\n🛑 正在关闭服务器...');
            // 关闭所有 Socket 连接
            io.close(() => {
                console.log('🔌 Socket.IO 服务已关闭');
            });
            // 关闭 HTTP 服务器
            fastify.close(() => {
                console.log('🚀 HTTP 服务已关闭');
                process.exit(0);
            });
        };
        // 监听关闭信号
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
    }
    catch (err) {
        console.error('❌ 服务器启动失败:', err);
        process.exit(1);
    }
};
// 启动应用
start();
