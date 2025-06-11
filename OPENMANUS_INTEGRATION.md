# OpenManus集成文档

## 概述

本文档详细说明了悬浮框助手与OpenManus AI代理的集成实现。通过这个集成，悬浮框助手获得了强大的任务处理能力，包括网页自动化、代码执行、文件操作等高级功能。

## 🎯 集成特性

### 核心功能
- **智能工具调度**: DeepSeek作为主对话引擎，自动判断何时需要OpenManus
- **无缝用户体验**: 用户无需手动切换模式，自然对话即可触发OpenManus
- **任务进度可视化**: 实时显示OpenManus任务执行进度
- **错误处理和重试**: 完善的错误处理机制
- **统一界面**: 在同一个界面中使用两套AI能力

### OpenManus工具集
1. **网页自动化** (`openmanus_web_automation`)
   - 网页数据抓取
   - 表单自动填写
   - 页面元素交互
   - 批量网页操作

2. **代码执行** (`openmanus_code_execution`)
   - Python代码运行
   - 数据分析和可视化
   - 算法实现
   - 计算任务

3. **文件操作** (`openmanus_file_operations`)
   - 文件读写编辑
   - 格式转换
   - 批量文件处理
   - 目录操作

4. **通用任务** (`openmanus_general_task`)
   - 复杂多步骤任务
   - 智能任务规划
   - 自动化流程执行

## 🏗️ 架构设计

```
用户输入 → DeepSeek分析 → 工具选择决策
├── 简单对话 → DeepSeek直接回复
├── 基础工具 → 天气/搜索工具
└── 复杂任务 → OpenManus代理处理 → 结果整合 → 用户回复
```

### 技术架构
```
悬浮框助手 (Next.js)
├── Chat API (/api/chat) - 主对话引擎
├── Tools API (/api/tools) - 工具执行
├── OpenManus API (/api/openmanus) - OpenManus集成
└── OpenManus API Service (Python FastAPI) - HTTP包装器
    └── OpenManus Core (Python) - 核心代理
```

## 📁 文件结构

```
ai-assistant/
├── src/
│   ├── app/api/
│   │   ├── chat/route.ts          # 主聊天API（已增强）
│   │   ├── tools/route.ts         # 工具执行API
│   │   └── openmanus/route.ts     # OpenManus集成API
│   ├── components/
│   │   └── FloatingAssistant.tsx  # 主组件（已增强）
│   ├── utils/
│   │   └── toolManager.ts         # 工具管理器（已扩展）
│   └── types/
│       └── index.ts               # 类型定义（已扩展）
├── openmanus-api-service/
│   ├── main.py                    # OpenManus HTTP API服务
│   └── requirements.txt           # Python依赖
├── OpenManus/                     # OpenManus源代码
├── start-with-openmanus.sh        # 启动脚本
├── stop-services.sh               # 停止脚本
└── test-openmanus-integration.js  # 集成测试
```

## 🚀 快速开始

### 1. 环境准备

```bash
# 进入项目目录
cd ai-assistant/

# 安装Node.js依赖
npm install

# 设置环境变量
export DEEPSEEK_API_KEY="your_deepseek_key"
export QWEATHER_API_KEY="your_qweather_key"
export BOCHA_API_KEY="your_bocha_key"
```

### 2. 启动服务

```bash
# 使用集成启动脚本（推荐）
./start-with-openmanus.sh

# 或者手动启动
# 1. 启动OpenManus API服务
cd openmanus-api-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py &

# 2. 启动Next.js应用
cd ..
npm run dev
```

### 3. 测试集成

```bash
# 运行集成测试
node test-openmanus-integration.js

# 或在浏览器中访问
# http://localhost:3000
```

## 🔧 使用方式

### 触发OpenManus工具的关键词

**网页自动化**:
- "帮我爬取/抓取这个网页"
- "自动填写这个表单"  
- "批量下载网页内容"
- "网页数据提取"

**代码执行**:
- "帮我写一段Python代码"
- "数据分析/处理"
- "生成图表/可视化"
- "算法实现"

**文件操作**:
- "编辑/修改文件"
- "转换文件格式"
- "批量处理文件"
- "文件操作"

**复杂任务**:
- "帮我完成一个复杂的任务"
- "自动化流程"
- "多步骤操作"

### 示例对话

```
用户: "帮我抓取这个网页的产品信息: https://example.com"
助手: [自动调用openmanus_web_automation工具]
     "我已经为您抓取了该网页的产品信息，共找到15个产品..."

用户: "分析一下这个CSV文件的销售趋势"
助手: [自动调用openmanus_code_execution工具]
     "根据数据分析，销售趋势显示..."

用户: "今天天气怎么样？"
助手: [调用常规天气工具]
     "今天北京天气晴朗，气温22°C..."
```

## ⚙️ 配置选项

### OpenManus API服务配置

`openmanus-api-service/main.py`:
```python
# 服务配置
OPENMANUS_API_URL = 'http://127.0.0.1:8001'
WORKSPACE_DIR = OPENMANUS_DIR / "workspace"

# CORS设置
allow_origins=["http://localhost:3000", "https://localhost:3000"]
```

### 前端配置

`src/utils/toolManager.ts`:
```typescript
private static readonly OPENMANUS_API_URL = 'http://127.0.0.1:8001';
```

## 🔍 API接口文档

### OpenManus API服务

#### 执行任务
```http
POST /api/execute_task
Content-Type: application/json

{
  "task_description": "任务描述",
  "agent_type": "manus",
  "max_steps": 20
}
```

#### 查询任务状态
```http
GET /api/task_status/{task_id}
```

#### 获取可用工具
```http
GET /api/available_tools
```

#### 健康检查
```http
GET /api/health
```

### 悬浮框助手API

#### OpenManus集成API
```http
POST /api/openmanus
Content-Type: application/json

{
  "action": "execute_task",
  "task_description": "任务描述"
}
```

#### 聊天API（已增强）
```http
POST /api/chat
Content-Type: application/json

{
  "messages": [...],
  "tools": [...] // 包含OpenManus工具定义
}
```

## 🐛 故障排除

### 常见问题

1. **OpenManus API服务无法启动**
   ```bash
   # 检查Python环境
   which python3
   
   # 检查依赖安装
   pip list
   
   # 查看日志
   tail -f logs/openmanus-api.log
   ```

2. **工具调用失败**
   ```bash
   # 检查API连接
   curl http://localhost:8001/api/health
   
   # 检查端口占用
   lsof -i :8001
   ```

3. **OpenManus任务执行超时**
   - 默认超时时间为5分钟
   - 可以在`toolManager.ts`中调整超时设置
   - 检查任务复杂度，考虑分解任务

### 调试模式

```bash
# 启用详细日志
export DEBUG=true

# 查看实时日志
tail -f logs/openmanus-api.log

# 使用测试脚本
node test-openmanus-integration.js
```

## 🔒 安全考虑

1. **API访问控制**
   - OpenManus API仅绑定本地地址
   - CORS配置限制访问来源
   - 任务执行在沙盒环境中

2. **输入验证**
   - 所有用户输入都经过验证
   - 任务描述长度限制
   - 恶意代码过滤

3. **资源管理**
   - 任务执行时间限制
   - 内存使用监控
   - 进程隔离

## 📈 性能优化

### 建议配置
- **任务并行**: OpenManus和常规工具可并行执行
- **连接池**: 复用OpenManus实例减少初始化开销
- **缓存机制**: 缓存常用任务结果
- **异步处理**: 长时间任务使用异步处理

### 监控指标
- API响应时间
- 任务成功率
- 资源使用情况
- 错误频率

## 🎉 功能演示

### 示例场景

1. **数据抓取和分析**
   ```
   用户: "帮我抓取这个电商网站的产品价格，然后分析价格趋势"
   流程: 网页抓取 → 数据清洗 → 趋势分析 → 图表生成
   ```

2. **自动化报告生成**
   ```
   用户: "根据这些CSV文件生成月度销售报告"
   流程: 文件读取 → 数据分析 → 报告生成 → 格式转换
   ```

3. **批量文件处理**
   ```
   用户: "将这个文件夹中的所有图片转换为PDF"
   流程: 文件扫描 → 格式转换 → 批量处理 → 结果整合
   ```

## 🔮 未来计划

### 短期计划
- [ ] 添加更多OpenManus代理类型支持
- [ ] 实现任务队列和批处理
- [ ] 增强错误处理和重试机制
- [ ] 添加任务历史记录

### 长期计划
- [ ] 支持自定义工具扩展
- [ ] 实现分布式任务处理
- [ ] 添加可视化任务编排器
- [ ] 集成更多外部服务

## 📞 支持

如遇到问题，请：
1. 查看本文档的故障排除部分
2. 运行测试脚本进行诊断
3. 查看相关日志文件
4. 提交Issue到项目仓库

---

**最后更新**: 2025年6月11日  
**版本**: 1.0.0  
**维护者**: AI Assistant Team