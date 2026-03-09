# AI Agent

跨平台桌面 AI Agent 工具，支持本地 Ollama 和云端 AI 模型。

## 功能特性

- 💬 聊天对话界面
- 🤖 **支持多家 AI 提供商**
  - 🔹 Ollama (本地运行)
  - 🔹 OpenAI
  - 🔹 Anthropic (Claude)
  - 🔹 DeepSeek (深度求索)
  - 🔹 Moonshot (月之暗面)
  - 🔹 Zhipu (智谱 AI)
  - 🔹 Baichuan (百川智能)
  - 🔹 Qwen (阿里云通义)
  - 🔹 自定义 API
- ⚙️ **灵活的配置系统**
  - 自定义 API 地址 (Base URL)
  - API Key 管理
  - 模型管理 (添加/删除)
  - 模型参数调节 (Temperature, Max Tokens, Top P)
- 🛠️ 工具调用 (文件操作 / 终端命令 / 剪贴板)
- 🎨 现代化深色 UI 设计
- 🔒 本地优先，隐私安全

## 技术栈

- **前端**: React + TypeScript + TailwindCSS
- **框架**: Tauri 2.0
- **后端**: Rust
- **AI**: Ollama (本地) / OpenAI 兼容 API / Anthropic

## 快速开始

### 1. 安装依赖

```bash
cd ai-agent
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm tauri dev
```

### 3. 构建发布版本

```bash
pnpm tauri build
```

构建产物位于：
- `src-tauri/target/release/bundle/macos/AI Agent.app`
- `src-tauri/target/release/bundle/dmg/AI Agent_0.1.0_aarch64.dmg`

## 项目结构

```
ai-agent/
├── src/                        # React 前端
│   ├── components/
│   │   ├── ChatWindow.tsx      # 聊天窗口
│   │   ├── Sidebar.tsx         # 侧边栏
│   │   └── SettingsPanel.tsx   # 设置面板
│   ├── stores/
│   │   ├── agentStore.ts       # 状态管理
│   │   └── messageStore.ts     # 消息类型
│   ├── types/
│   │   └── config.ts           # 配置类型
│   └── App.tsx
├── src-tauri/                  # Rust 后端
│   ├── src/
│   │   ├── ai/
│   │   │   ├── mod.rs          # AI 服务层
│   │   │   ├── ollama.rs       # 本地 Ollama
│   │   │   └── cloud.rs        # 云端 API
│   │   ├── config.rs           # 配置管理
│   │   └── tools/              # 工具调用
│   ├── Cargo.toml
│   └── tauri.conf.json
└── package.json
```

## 配置说明

### 配置文件位置

配置文件存储在 `~/.config/ai-agent/config.json`

### 支持的 API 提供商

| 提供商 | Base URL | 说明 |
|--------|----------|------|
| Ollama | `http://localhost:11434` | 本地运行，无需 API Key |
| OpenAI | `https://api.openai.com/v1` | GPT-4, GPT-3.5 |
| Anthropic | `https://api.anthropic.com` | Claude 系列 |
| DeepSeek | `https://api.deepseek.com` | 深度求索 |
| Moonshot | `https://api.moonshot.cn/v1` | 月之暗面 Kimi |
| Zhipu | `https://open.bigmodel.cn/api/paas/v4` | 智谱 GLM |
| Baichuan | `https://api.baichuan-ai.com/v1` | 百川智能 |
| Qwen | `https://dashscope.aliyuncs.com/compatible-mode/v1` | 阿里云通义 |
| Custom | 自定义 | 任意 OpenAI 兼容 API |

### 模型参数说明

- **Temperature (温度)**: 控制输出的随机性
  - 较低值 (0.2-0.5)：更精确、确定性高
  - 较高值 (0.8-1.0)：更创意、多样性高
  
- **Max Tokens**: 单次响应的最大 token 数
  
- **Top P**: 核采样参数，控制多样性

## 使用指南

### 1. 配置 API 提供商

1. 点击侧边栏的 **⚙️ 模型设置**
2. 在左侧选择要配置的提供商
3. 填写 API 地址和 API Key
4. 添加可用模型
5. 点击 **保存配置**

### 2. 切换提供商

- 在设置面板左侧选择不同提供商
- 点击 **设为当前** 切换

### 3. 添加自定义模型

1. 在设置面板选择 **自定义**
2. 填写 API 地址和 Key
3. 添加模型名称
4. 保存并设为当前

## 环境变量 (可选)

也可以通过环境变量配置 API Key：

```bash
export OPENAI_API_KEY=sk-xxx
export ANTHROPIC_API_KEY=sk-ant-xxx
export DEEPSEEK_API_KEY=xxx
```

## 开发

```bash
# 开发模式
pnpm tauri dev

# 构建
pnpm tauri build

# 清理
rm -rf src-tauri/target
rm -rf node_modules dist
```

## License

MIT
