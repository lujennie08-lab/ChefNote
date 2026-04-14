# ChefNote - 菜单食谱管理应用

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## 📋 项目概述

ChefNote 是一个现代化的菜单食谱管理应用，支持食谱的创建、编辑、浏览和分享。应用采用前后端分离架构，前端使用 React + TypeScript，后端部署在 CloudBase 云函数。

## 🚀 快速开始

### 前提条件
- Node.js 14+
- npm 或 yarn 包管理器
- 浏览器 (Chrome, Firefox, Safari 等)

### 第1步：启动前端开发服务器

```bash
# 进入项目目录
cd chefnote

# 安装依赖 (首次运行)
npm install

# 启动开发服务器
npm run dev
```

您会看到类似的输出：
```
  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

**在浏览器中打开**: `http://localhost:5173/`

### 第2步：测试后端 API (可选)

打开终端，运行以下命令测试 API：
```bash
# 测试获取所有食谱
curl https://api.tcloudbasegateway.com/chefnote-v1-6glzfl9g4e98cc89/api/recipes
```

### 第3步：在本地运行后端 (可选)

```bash
# 进入后端目录
cd chefnote-api

# 安装依赖
npm install

# 启动后端服务器
npm start

# 服务将在 http://localhost:3000 运行
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

## 📁 项目文件结构

```
chefnote/
│
├── src/
│   ├── components/
│   │   └── RecipeCard.tsx              # 食谱卡片组件
│   │
│   ├── views/                         # 页面视图组件
│   │   ├── Home.tsx                    # 首页 - 浏览食谱
│   │   ├── RecipeDetail.tsx            # 详情页 - 查看食谱
│   │   ├── Editor.tsx                  # 编辑页 - 创建/编辑食谱
│   │   ├── ImportSheet.tsx             # 导入页 - 批量导入
│   │   └── Aggregation.tsx             # 聚合页 - 汇总食材
│   │
│   ├── services/
│   │   ├── mockData.ts                 # 本地模拟数据
│   │   └── api.ts                      # CloudBase API 调用模块
│   │
│   ├── types.ts                        # TypeScript 类型定义
│   ├── App.tsx                         # 主应用组件（路由和状态管理）
│   └── index.tsx                       # 应用入口点
│
├── cloudfunctions/                     # CloudBase 云函数
│   └── chefnote-api/
│       ├── index.js                    # 云函数入口 (169 行)
│       │   ├─ RESTful API 实现
│       │   ├─ 食谱 CRUD 操作
│       │   ├─ 搜索和筛选功能
│       │   ├─ CORS 支持
│       │   └─ 错误处理
│       │
│       └── package.json                # 依赖管理
│
├── chefnote-api/                       # Express 本地开发版本
│   │
│   ├── routes/
│   │   ├── recipes.js                  # 食谱路由 (188 行)
│   │   │   ├─ GET /recipes
│   │   │   ├─ GET /recipes/:id
│   │   │   ├─ GET /recipes?category
│   │   │   ├─ GET /recipes/search
│   │   │   ├─ POST /recipes
│   │   │   ├─ PUT /recipes/:id
│   │   │   └─ DELETE /recipes/:id
│   │   │
│   │   ├── index.js                    # 主页路由
│   │   └── users.js                    # 用户路由
│   │
│   ├── views/                          # 模板视图
│   │   ├── index.hbs
│   │   └── error.hbs
│   │
│   ├── public/                         # 静态文件
│   │   ├── stylesheets/
│   │   └── images/
│   │
│   ├── app.js                          # 添加了 CORS 和 recipes 路由
│   │   ├─ 添加了 CORS 中间件
│   │   ├─ 注册了 /api/recipes 路由
│   │   └─ Express 应用配置
│   │
│   ├── Dockerfile                      # Docker 镜像配置
│   │
│   ├── package.json                    # Node.js 依赖
│   │
│   └── bin/
│       └── www                         # 启动脚本
│
├── index.html                          # HTML 入口
├── package.json                        # 前端依赖管理
├── tsconfig.json                       # TypeScript 配置
├── vite.config.ts                      # Vite 构建配置
├── .gitignore                          # Git 忽略配置
└── .git/                               # Git 版本控制
```

## 📊 已部署的资源

### 1. CloudBase 云函数服务

| 项目 | 内容 |
|------|------|
| **服务名** | `chefnote-api` |
| **运行时** | Node.js 18.15 |
| **状态** | ✅ Active (活跃) |
| **函数 ID** | `lam-rp9ggi13` |
| **创建时间** | 2026-02-03 13:01:29 |
| **HTTP 访问** | ✅ 已启用 |

### 2. API 端点

```
Base URL: https://api.tcloudbasegateway.com/chefnote-v1-6glzfl9g4e98cc89/api/recipes
```

**可用的 RESTful API**:
- `GET    /api/recipes`           - 获取所有食谱
- `GET    /api/recipes/:id`       - 获取单个食谱
- `GET    /api/recipes?category=xx` - 按分类筛选
- `GET    /api/recipes?q=xx`      - 搜索食谱
- `POST   /api/recipes`           - 创建新食谱
- `PUT    /api/recipes/:id`       - 更新食谱
- `DELETE /api/recipes/:id`       - 删除食谱

### 3. CORS 支持

✅ 已启用跨域资源共享
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
- Node.js 18.15
- Express 4.16 (用于本地开发)
- CloudBase 云函数 (生产环境)

### 云基础设施
- CloudBase (腾讯云开发平台)
- 云函数 (Function as a Service)
- 静态托管 (CDN + 云存储)

## 🚀 部署信息

### 环境信息
- **环境 ID**: `chefnote-v1-6glzfl9g4e98cc89`
- **环境别名**: `chefnote-v1`
- **地域**: 上海 (ap-shanghai)
- **状态**: 正常运行

### 前端部署

```bash
# 构建前端应用
npm run build

# 将 dist 目录上传到 CloudBase 静态托管
# 可通过控制台或 CLI 工具上传
```

### 后端部署（已完成）

云函数已经部署到 CloudBase，无需额外操作。若需更新后端代码：

```bash
# 更新云函数代码
npm run deploy:function

# 或通过控制台手动更新
```

## 📞 技术支持资源

### 官方文档
- CloudBase: https://docs.cloudbase.net/
- React: https://react.dev/
- Express: https://expressjs.com/
- TypeScript: https://www.typescriptlang.org/

### 在线工具
- CloudBase 控制台: https://tcb.cloud.tencent.com/
- Postman (API 测试): https://www.postman.com/
- JSON 格式化: https://jsonformatter.org/

### 社区支持
- GitHub Issues: 提交问题和建议
- StackOverflow: 标签 `cloudbase`, `react`, `node.js`
- CloudBase 论坛: 官方社区讨论

## 📚 详细文档

### 快速参考
1. **QUICK_START.md** ⭐⭐⭐
   - 5分钟快速开始
   - 功能导览
   - 常见问题排查

2. **DEPLOYMENT_SUMMARY.md** ⭐⭐⭐
   - 完整部署信息
   - API 接口文档
   - 前端集成指南

3. **BACKEND_DEPLOYMENT.md** ⭐⭐
   - 详细部署说明
   - 数据模型定义
   - CloudBase 资源清单

## 🎉 总结

您的 ChefNote 项目现在已经：

✨ **前端**: 完全功能性的 React 应用  
✨ **后端**: 生产级别的 CloudBase API  
✨ **文档**: 全面的部署和使用指南  
✨ **集成**: 即插即用的 API 调用模块  

**现在您可以**:
- 🚀 立即启动和测试应用
- 📊 实时监控 API 性能
- 💾 集成数据库实现持久化
- 🔐 添加身份认证保护用户数据
- 📈 扩展功能以满足业务需求

## 📮 反馈和改进

如有任何问题或改进建议，请：
1. 查看故障排查部分
2. 参考官方文档
3. 在 GitHub 提交 Issue
4. 联系技术支持

---

**🎊 恭喜！您已成功部署 ChefNote 后端服务！**

**开始时间**: 2026-02-03 13:00  
**完成时间**: 2026-02-03 13:10  
**部署状态**: ✅ 成功完成  
**下一步**: 读取 QUICK_START.md 开始开发！