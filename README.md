# ChefNote - 菜单食谱管理应用

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## 📋 项目概述

ChefNote 是一个现代化的菜单食谱管理应用，支持食谱的创建、编辑、浏览和分享。应用采用前后端分离架构，前端使用 React + TypeScript，后端以 Vercel Serverless Functions 提供 API 服务，整个项目统一部署在 **Vercel** 平台。

## 🚀 快速开始

### 前提条件
- Node.js 18+
- npm 或 yarn 包管理器
- 浏览器 (Chrome, Firefox, Safari 等)

### 本地开发

```bash
# 进入项目目录
cd chefnote

# 安装依赖 (首次运行)
npm install

# 方式一：仅启动前端（API 请求会指向本地 3000 端口）
npm run dev

# 方式二（推荐）：使用 Vercel CLI 同时启动前端和 API
npm install -g vercel
vercel dev
```

**在浏览器中打开**: `http://localhost:5173/`（`npm run dev`）或 `http://localhost:3000/`（`vercel dev`）

### 测试 API

```bash
# 本地测试
curl http://localhost:3000/api/recipes

# 生产环境测试（替换为实际 Vercel 域名）
curl https://<your-project>.vercel.app/api/recipes
```

## 📚 功能导览

### 首页 (Home)
- 浏览所有食谱卡片
- 点击卡片查看详情
- 长按或选择模式进行多选

### 食谱详情 (Detail)
- 查看完整的食谱信息
- 原食谱链接 (如有)
- 返回首页按钮

### 编辑器 (Editor)
- 创建新食谱
- 编辑现有食谱
- 支持表单验证

### 导入 (Import)
- 从文本或 JSON 导入食谱
- 快速添加多个食谱

### 聚合 (Aggregation)
- 汇总选中食谱的食材
- 显示所有调料列表
- 统计食谱数量

## 🔌 API 调用示例

### 在前端中使用 API

```typescript
import { RecipeAPI } from './services/api';

// 获取所有食谱
async function loadRecipes() {
  try {
    const response = await RecipeAPI.getAll();
    console.log(response.data); // 食谱数组
  } catch (error) {
    console.error('Error loading recipes:', error);
  }
}

// 创建新食谱
async function addNewRecipe() {
  const newRecipe = {
    title: '番茄炒蛋',
    category: ['家常菜'],
    cover: 'https://...',
    ingredients: [
      { name: '鸡蛋', amount: '3', unit: '个' },
      { name: '番茄', amount: '2', unit: '个' }
    ],
    seasonings: ['油', '盐'],
    steps: ['打蛋', '炒番茄', '混合炒蛋']
  };

  try {
    const response = await RecipeAPI.create(newRecipe);
    console.log('Recipe created:', response.data);
  } catch (error) {
    console.error('Error creating recipe:', error);
  }
}

// 搜索食谱
async function searchRecipes(query: string) {
  try {
    const response = await RecipeAPI.search(query);
    console.log('Search results:', response.data);
  } catch (error) {
    console.error('Error searching:', error);
  }
}
```

> **说明**：`services/api.ts` 在生产环境自动将请求指向 `/api`（Vercel Serverless Function），本地开发时指向 `http://localhost:3000/api`，无需手动修改。

## 📁 项目文件结构

```
chefnote/
│
├── api/
│   └── index.js                        # Vercel Serverless Function（API 入口）
│       ├─ RESTful API 实现
│       ├─ 食谱 CRUD 操作
│       ├─ 搜索和筛选功能
│       ├─ CORS 支持
│       └─ 错误处理
│
├── components/
│   └── RecipeCard.tsx                  # 食谱卡片组件
│
├── views/                              # 页面视图组件
│   ├── Home.tsx                        # 首页 - 浏览食谱
│   ├── RecipeDetail.tsx                # 详情页 - 查看食谱
│   ├── Editor.tsx                      # 编辑页 - 创建/编辑食谱
│   ├── ImportSheet.tsx                 # 导入页 - 批量导入
│   └── Aggregation.tsx                 # 聚合页 - 汇总食材
│
├── services/
│   ├── mockData.ts                     # 本地模拟数据
│   ├── api.ts                          # API 调用模块（自动适配 Vercel/本地）
│   └── cloudbaseApi.ts                 # （旧）CloudBase API 参考（已废弃）
│
├── App.tsx                             # 主应用组件（路由和状态管理）
├── index.tsx                           # 应用入口点
├── types.ts                            # TypeScript 类型定义
├── index.html                          # HTML 入口
├── package.json                        # 依赖管理
├── tsconfig.json                       # TypeScript 配置
├── vite.config.ts                      # Vite 构建配置
└── vercel.json                         # Vercel 路由和部署配置
```

## 📊 部署架构

### Vercel 部署结构

| 组件 | 部署方式 | 路径 |
|------|----------|------|
| **前端** | Vercel 静态托管（CDN） | `/` |
| **后端 API** | Vercel Serverless Function | `/api/*` |

### API 端点

```
生产环境 Base URL: https://<your-project>.vercel.app/api
本地开发 Base URL: http://localhost:3000/api
```

**可用的 RESTful API**:
- `GET    /api/recipes`            - 获取所有食谱
- `GET    /api/recipes/:id`        - 获取单个食谱
- `GET    /api/recipes?category=xx`- 按分类筛选
- `GET    /api/recipes?q=xx`       - 搜索食谱
- `POST   /api/recipes`            - 创建新食谱
- `PUT    /api/recipes/:id`        - 更新食谱
- `DELETE /api/recipes/:id`        - 删除食谱

### CORS 配置

✅ 已在 `vercel.json` 中配置跨域支持
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## 📚 API 响应格式

所有 API 响应遵循统一格式：

```json
{
  "code": 0,
  "data": { /* 数据 */ },
  "message": "Success"
}
```

## 📂 数据模型

### Recipe（食谱）

```typescript
interface Recipe {
  id: number;              // 食谱 ID
  title: string;           // 食谱名称
  category: string[];      // 分类标签（如 "家常菜", "硬菜" 等）
  cover: string;           // 封面图片 URL
  ingredients: Ingredient[]; // 食材列表
  seasonings: string[];    // 调料列表
  steps: string[];         // 烹饪步骤
  link?: string;           // 来源链接（可选）
}

interface Ingredient {
  name: string;            // 食材名称
  amount: string;          // 数量
  unit: string;           // 单位
}
```

## 📈 API 使用统计

### 支持的操作
| 操作类型 | 数量 | 状态 |
|---------|------|------|
| GET | 4 | ✅ |
| POST | 1 | ✅ |
| PUT | 1 | ✅ |
| DELETE | 1 | ✅ |
| **总计** | **7** | ✅ |

## 🎯 技术栈

### 前端
- React 19.2.4
- TypeScript 5.8
- Vite 6.2
- Lucide React (图标库)

### 后端
- Node.js 18+
- Express 5（用于本地及 Serverless 运行）
- Vercel Serverless Functions（生产环境）

### 云基础设施
- **Vercel**（前端静态托管 + API Serverless Functions）
- 自动 CI/CD：推送到 GitHub 主分支即触发部署
- 全球 CDN 加速

## 🚀 部署到 Vercel

### 方式一：通过 GitHub 自动部署（推荐）

1. 将代码推送到 GitHub 仓库（`lujennie08-lab/ChefNote`）
2. 在 [vercel.com](https://vercel.com) 登录并点击 **Add New Project**
3. 选择 GitHub 仓库 `ChefNote`，点击 **Import**
4. Framework Preset 选择 **Vite**，保持其余默认配置
5. 点击 **Deploy**，等待部署完成

此后，每次推送到 `main` 分支都会自动触发 Vercel 重新部署。

### 方式二：使用 Vercel CLI 手动部署

```bash
# 安装 Vercel CLI（全局）
npm install -g vercel

# 首次部署（在项目根目录执行）
vercel

# 部署到生产环境
vercel --prod
```

### 关键配置说明

`vercel.json` 已配置好路由规则：
- `/api/*` → 转发到 `api/index.js`（Serverless Function）
- 其余所有路由 → 转发到 `index.html`（前端 SPA）

### 环境变量（可选）

如需在 Vercel 后台配置环境变量（Settings → Environment Variables）：

| 变量名 | 说明 |
|--------|------|
| `GEMINI_API_KEY` | Google Gemini AI API Key（如使用 AI 功能）|

## 📞 技术支持资源

### 官方文档
- Vercel 文档: https://vercel.com/docs
- Vercel Serverless Functions: https://vercel.com/docs/functions
- React: https://react.dev/
- Express: https://expressjs.com/
- TypeScript: https://www.typescriptlang.org/

### 在线工具
- Vercel 控制台: https://vercel.com/dashboard
- Postman (API 测试): https://www.postman.com/
- JSON 格式化: https://jsonformatter.org/

### 社区支持
- GitHub Issues: 在 `lujennie08-lab/ChefNote` 提交问题
- StackOverflow: 标签 `vercel`, `react`, `node.js`
- Vercel 社区: https://github.com/vercel/vercel/discussions

## 🎉 项目总结

✨ **前端**: React + TypeScript + Vite，部署为 Vercel 静态站点  
✨ **后端**: Express Serverless Function，部署在 Vercel `/api` 路由  
✨ **CI/CD**: 推送到 GitHub 自动触发 Vercel 重新部署  
✨ **CORS**: 已在 `vercel.json` 统一配置  

**现在您可以**:
- 🚀 `git push` 后几秒内完成自动部署
- 📊 在 Vercel 控制台查看访问日志和函数执行情况
- 💾 接入外部数据库（如 PlanetScale、Supabase）实现数据持久化
- 🔐 添加身份认证（如 NextAuth、Clerk）
- 📈 基于现有 API 扩展更多功能

## 📮 反馈和改进

如有任何问题或改进建议，请在 GitHub 仓库 [lujennie08-lab/ChefNote](https://github.com/lujennie08-lab/ChefNote) 提交 Issue。

---

**部署平台**: Vercel  
**仓库**: github.com/lujennie08-lab/ChefNote  
**部署状态**: ✅ 就绪