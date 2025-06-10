# 🤖 AI 悬浮框助手

> 一个现代化的可嵌入式 AI 聊天助手，采用 Anthropic 风格设计，支持完整的语音交互功能

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![DeepSeek](https://img.shields.io/badge/DeepSeek-AI-FF6B6B?style=flat-square)](https://www.deepseek.com/)

## ✨ 功能特性

### 🎯 核心功能
- **🤖 智能对话** - 基于 DeepSeek AI 的强大对话能力，支持深度推理
- **🎙️ 语音交互** - 完整的语音输入识别与语音输出功能
- **🎨 现代化设计** - 采用 Anthropic 风格的简洁美观界面
- **📱 响应式设计** - 完美适配桌面端、平板和移动端设备
- **⚡ 轻松集成** - 一行代码即可集成到任何网站

### 🔧 技术特色
- **🚀 高性能** - 基于 Next.js 15 和 React 19 构建
- **🎯 类型安全** - 完整的 TypeScript 类型定义
- **🔒 安全可靠** - 采用现代安全架构和最佳实践
- **🌐 跨域支持** - 完善的 CORS 配置和 iframe 安全策略
- **📦 轻量级** - 优化的打包体积，快速加载

### 🎤 语音功能详情
- **语音识别 (STT)** - 基于 Web Speech API 的实时语音转文字
- **语音合成 (TTS)** - 基于 Edge-TTS 的高质量中文语音生成
- **多语音选择** - 支持 6 种不同风格的中文语音
- **语音控制** - 支持语音参数调节（语速、音调、音量）
- **实时交互** - 流式语音识别，边说边显示

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0 或 **yarn** >= 1.22.0
- **Python** >= 3.8 (用于语音合成功能)

### 1. 克隆和安装

```bash
npm install

# 安装语音合成依赖
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install edge-tts
```

### 2. 环境配置

创建 `.env.local` 文件：

```env
# 必填：DeepSeek API 密钥
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# 可选：应用基础URL（部署时修改）
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 可选：开发模式配置
NODE_ENV=development
```

### 3. 启动开发服务器

```bash
# 启动开发服务器 (使用 Turbopack 加速)
npm run dev
```

访问 `http://localhost:3000` 查看项目主页。

## 🎯 集成指南

### 方法一：快速集成 (推荐)

在您的网站中添加以下代码：

```html
<!-- 加载 AI 助手 SDK -->
<script src="http://localhost:3000/embed.js"></script>

<!-- 初始化助手 -->
<script>
  window.initAIAssistant({
    config: {
      position: 'bottom-right',
      theme: 'light',
      enableVoice: true
    }
  });
</script>
```

### 方法二：高级集成

```html
<script src="http://localhost:3000/embed.js"></script>
<script>
  const assistant = new AIAssistant({
    config: {
      baseUrl: 'http://localhost:3000',
      position: 'bottom-left',
      theme: 'dark',
      enableVoice: true,
      maxMessages: 100
    },
    onReady: () => {
      console.log('🎉 AI 助手已就绪！');
    },
    onError: (error) => {
      console.error('❌ AI 助手错误:', error);
    }
  });
  
  assistant.init();
</script>
```

## ⚙️ 配置选项

### 基础配置

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `baseUrl` | `string` | `'http://localhost:3000'` | API 服务器地址 |
| `position` | `string` | `'bottom-right'` | 悬浮位置 |
| `theme` | `string` | `'light'` | 界面主题 |
| `enableVoice` | `boolean` | `true` | 是否启用语音功能 |
| `maxMessages` | `number` | `50` | 最大消息历史数量 |

### 位置选项 (position)

```javascript
'bottom-right'  // 右下角 (默认)
'bottom-left'   // 左下角
'top-right'     // 右上角
'top-left'      // 左上角
```

### 主题选项 (theme)

```javascript
'light'  // 浅色主题 (默认)
'dark'   // 深色主题
'auto'   // 跟随系统主题
```

### 语音配置示例

```javascript
// 完整语音配置
const assistant = new AIAssistant({
  config: {
    enableVoice: true,
    voiceSettings: {
      voice: 'xiaoxiao',      // 语音类型
      rate: '0%',             // 语速调节 (-50% ~ +100%)
      pitch: '0%',            // 音调调节 (-50% ~ +50%)
      volume: '0%',           // 音量调节 (-50% ~ +50%)
      autoPlay: true          // 自动播放回复语音
    }
  }
});
```

### 支持的语音类型

| ID | 名称 | 描述 |
|----|------|------|
| `xiaoxiao` | 晓晓 | 温柔女声 (默认) |
| `xiaoyi` | 晓伊 | 活泼女声 |
| `yunjian` | 云健 | 成熟男声 |
| `yunxi` | 云希 | 年轻男声 |
| `xiaomo` | 晓墨 | 甜美女声 |
| `xiaoxuan` | 晓萱 | 知性女声 |

## 📡 API 接口文档

### 聊天接口

**请求:**

```http
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "你好，请介绍一下你自己"
    }
  ],
  "model": "deepseek-reasoner",
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**响应:**

```json
{
  "message": "你好！我是你的 AI 助手，基于先进的 DeepSeek 模型...",
  "messageId": "msg_1234567890",
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 45,
    "total_tokens": 60
  }
}
```

### 语音合成接口

**请求:**

```http
POST /api/tts
Content-Type: application/json

{
  "text": "你好，这是一段测试语音",
  "voice": "xiaoxiao",
  "rate": "+10%",
  "pitch": "0%",
  "volume": "0%"
}
```

**响应:**

```
Content-Type: audio/mpeg
Content-Length: [audio_file_size]

[音频文件二进制数据]
```

### 获取语音列表

```http
GET /api/tts

{
  "voices": [
    {
      "id": "xiaoxiao",
      "name": "zh-CN-XiaoxiaoNeural",
      "displayName": "晓晓（温柔女声）"
    }
  ]
}
```

## 🏗️ 项目结构

```
ai-assistant/
├── 📁 src/
│   ├── 📁 app/                     # Next.js App Router
│   │   ├── 📁 api/                 # API 路由
│   │   │   ├── 📁 chat/           # 聊天API
│   │   │   │   └── route.ts       # 聊天处理逻辑
│   │   │   └── 📁 tts/            # 语音合成API
│   │   │       └── route.ts       # TTS处理逻辑
│   │   ├── 📁 embed/              # 嵌入页面
│   │   │   └── page.tsx           # iframe嵌入页面
│   │   ├── page.tsx               # 主页
│   │   ├── layout.tsx             # 根布局
│   │   └── globals.css            # 全局样式
│   ├── 📁 components/             # React 组件
│   │   └── FloatingAssistant.tsx  # 悬浮助手主组件
│   ├── 📁 types/                  # TypeScript 类型定义
│   │   └── index.ts               # 所有类型定义
│   └── 📁 utils/                  # 工具函数
│       └── streamingSpeechRecognition.ts  # 语音识别工具
├── 📁 public/                     # 静态资源
│   ├── embed.js                   # JavaScript SDK
│   └── example.html               # 集成示例页面
├── 📁 temp/                       # 临时文件 (运行时创建)
├── 📁 venv/                       # Python虚拟环境
├── package.json                   # 项目配置
├── tsconfig.json                  # TypeScript 配置
├── tailwind.config.ts             # Tailwind 配置
└── next.config.js                 # Next.js 配置
```

## 🎨 自定义开发

### 修改样式主题

```typescript
// src/components/FloatingAssistant.tsx
const customTheme = {
  primary: 'bg-purple-500 hover:bg-purple-600',
  secondary: 'bg-purple-100 text-purple-700',
  background: 'bg-white',
  border: 'border-purple-200',
  text: 'text-gray-900',
  // 更多自定义样式...
};
```

### 扩展语音功能

```typescript
// 添加新的语音类型
const CUSTOM_VOICES = {
  'custom_voice': 'zh-CN-YourCustomVoice',
  ...CHINESE_VOICES
};

// 自定义语音参数
const voiceConfig = {
  voice: 'custom_voice',
  rate: '+20%',
  pitch: '+5%',
  volume: '-10%'
};
```

### 自定义消息处理

```typescript
// 扩展消息类型
interface CustomMessage extends ChatMessage {
  customType?: 'image' | 'file' | 'link';
  metadata?: Record<string, any>;
}

// 自定义消息渲染
const renderCustomMessage = (message: CustomMessage) => {
  // 自定义渲染逻辑
};
```

## 🌐 部署指南

### 开发环境部署

```bash
# 构建项目
npm run build

# 启动生产服务器
npm start
```

### 生产环境配置

1. **更新环境变量**

```env
DEEPSEEK_API_KEY=your_production_api_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

如有问题，请通过以下方式联系：

- GitHub Issues
- Email: your-email@example.com

---

Made with ❤️ by AI Assistant Team

</div>

</div>