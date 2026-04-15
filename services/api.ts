// API Configuration
// Vercel 部署时，API 路径自动指向 /api
// 本地开发时，使用 api目录下的 Express 服务器

const API_BASE = import.meta.env.PROD
  ? '/api'  // Vercel 生产环境：API 路由
  : 'http://localhost:3000/api';  // 本地开发环境（api目录的Express服务器）

export const API_ENDPOINTS = {
  RECIPES_LIST: `${API_BASE}/recipes`,
  RECIPES_BY_ID: (id: number) => `${API_BASE}/recipes/${id}`,
  RECIPES_BY_CATEGORY: (category: string) => `${API_BASE}/recipes?category=${encodeURIComponent(category)}`,
  RECIPES_SEARCH: (query: string) => `${API_BASE}/recipes?q=${encodeURIComponent(query)}`,
};

// 通用的 API 请求方法
export const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<{ code: number; data: T; message: string }> => {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// 特定的 API 调用方法
export const RecipeAPI = {
  // 获取所有食谱
  getAll: () => apiRequest<any[]>(API_ENDPOINTS.RECIPES_LIST),

  // 根据 ID 获取单个食谱
  getById: (id: number) => apiRequest<any>(API_ENDPOINTS.RECIPES_BY_ID(id)),

  // 按分类获取食谱
  getByCategory: (category: string) => apiRequest<any[]>(API_ENDPOINTS.RECIPES_BY_CATEGORY(category)),

  // 搜索食谱
  search: (query: string) => apiRequest<any[]>(API_ENDPOINTS.RECIPES_SEARCH(query)),

  // 创建新食谱
  create: (recipe: any) =>
    apiRequest<any>(API_ENDPOINTS.RECIPES_LIST, {
      method: 'POST',
      body: JSON.stringify(recipe),
    }),

  // 更新食谱
  update: (id: number, recipe: any) =>
    apiRequest<any>(API_ENDPOINTS.RECIPES_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(recipe),
    }),

  // 删除食谱
  delete: (id: number) =>
    apiRequest<any>(API_ENDPOINTS.RECIPES_BY_ID(id), {
      method: 'DELETE',
    }),

  // 上传图片：直接转为 base64 data URL，无需服务端存储
  // Vercel Serverless 无持久化文件系统，data URL 是最简可靠方案
  uploadImage: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
};

export default {
  API_ENDPOINTS,
  apiRequest,
  RecipeAPI,
};
