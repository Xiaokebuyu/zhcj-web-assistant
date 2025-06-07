# AI 悬浮框助手

一个现代化的可嵌入式 AI 聊天助手，采用 Anthropic 风格设计，支持语音交互，可轻松集成到任何网站中。

## 功能特性

- 🎨 **Anthropic 风格设计** - 现代简洁的 UI 设计
- 🤖 **智能对话** - 基于 DeepSeek AI 的强大对话能力
- 🎯 **轻松集成** - 一行代码即可集成到任何网站
- 🎙️ **语音支持** - 支持语音输入和语音回复（开发中）
- 📱 **响应式设计** - 完美适配移动端和桌面端
- 🔒 **安全可靠** - 采用现代安全架构

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```env
# DeepSeek API密钥
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# 应用基础URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000` 查看项目主页。

## 集成到其他网站

### 方法一：使用 JavaScript SDK

```html
<!-- 在您的网站中添加以下代码 -->
<script src="http://localhost:3000/embed.js"></script>
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

### 方法二：使用构造函数

```html
<script src="http://localhost:3000/embed.js"></script>
<script>
  const assistant = new AIAssistant({
    config: {
      baseUrl: 'http://localhost:3000',
      position: 'bottom-left',
      theme: 'dark',
      enableVoice: false
    },
    onReady: () => {
      console.log('AI 助手已就绪');
    },
    onError: (error) => {
      console.error('AI 助手错误:', error);
    }
  });
  
  assistant.init();
</script>
```

## 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `baseUrl` | string | `'http://localhost:3000'` | 服务器地址 |
| `position` | string | `'bottom-right'` | 位置：`'bottom-right'` \| `'bottom-left'` \| `'top-right'` \| `'top-left'` |
| `theme` | string | `'light'` | 主题：`'light'` \| `'dark'` \| `'auto'` |
| `enableVoice` | boolean | `true` | 是否启用语音功能 |
| `maxMessages` | number | `50` | 最大消息数量 |

## API 接口

### 聊天接口

```http
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "你好"
    }
  ]
}
```

响应：

```json
{
  "message": "你好！我是你的 AI 助手，有什么可以帮助你的吗？",
  "messageId": "1234567890",
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

## 开发

### 项目结构

```
ai-assistant/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/route.ts      # 聊天 API
│   │   ├── embed/
│   │   │   └── page.tsx           # 嵌入页面
│   │   └── page.tsx               # 主页
│   ├── components/
│   │   └── FloatingAssistant.tsx  # 悬浮助手组件
│   └── types/
│       └── index.ts               # 类型定义
├── public/
│   └── embed.js                   # JavaScript SDK
└── package.json
```

### 自定义样式

组件采用 Tailwind CSS 构建，您可以通过修改类名来自定义样式：

```typescript
// 修改 src/components/FloatingAssistant.tsx
const customTheme = {
  primary: 'bg-purple-500',
  secondary: 'bg-purple-100',
  // ...
};
```

## 部署

### 生产环境部署

1. 构建项目：

```bash
npm run build
```

2. 启动生产服务器：

```bash
npm start
```

3. 更新环境变量：

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
