<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ChefNote — Next.js 完整前后端应用

这是一个 Next.js 全栈应用，使用安全的后端 API 路由调用 Google Gemini AI，确保你的 API 密钥永远不会暴露到浏览器。

## 快速开始

### 1. 配置环境变量

```bash
cp .env.example .env.local
```

然后在 `.env.local` 中填入你的 Gemini API Key（从 https://ai.google.dev/ 获取）：

```
GEMINI_API_KEY=你的实际密钥
```

**重要**: 不要把 `.env.local` 提交到 git。使用 `.gitignore` 已经排除了这个文件。

### 2. 安装依赖和运行

```bash
npm install
npm run dev
```

打开浏览器访问 `http://localhost:3000`。

## 架构说明

- **前端**：`pages/` 下的 React 组件，基于 Next.js 页面路由
- **后端**：`pages/api/generate.ts` 是一个 API 路由，负责所有 AI 调用
  - 从服务器环境变量读取 `GEMINI_API_KEY`
  - 使用 Google 官方 SDK `@google/generative-ai` 调用 Gemini API
  - 浏览器永远不会接收到你的 API 密钥
- **组件和工具类**：
  - `components/` - React 组件（RecipeCard 等）
  - `views/` - 页面视图（Home、Editor、RecipeDetail 等）
  - `lib/` - 工具函数和类型定义（types.ts, mockData.ts）

## 功能概述

- 📝 **食谱管理**：创建、编辑、删除食谱
- 🤖 **AI识别**：用 Gemini AI 从文本自动识别食谱结构
- 🏷️ **分类浏览**：按分类筛选食谱
- 📋 **采购清单**：聚合选中食谱的食材和调料
- 📱 **响应式设计**：优化移动设备体验

## 部署

在你的部署平台（Vercel、Render 等）配置环境变量：

```
GEMINI_API_KEY = 你的实际密钥
```

然后正常部署即可。

## 使用 Gemini API

默认使用模型 `gemini-1.5-flash`。如需更改，可在 `pages/api/generate.ts` 中修改。

示例调用：

```javascript
fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: '你的提示词' })
})
.then(r => r.json())
.then(data => console.log(data.text))
```

