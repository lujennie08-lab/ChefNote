// API Configuration
// Vercel 部署时，API 路径自动指向 /api
// 本地开发时，使用 localhost:3001

const API_BASE = import.meta.env.PROD
  ? '/api'  // Vercel 生产环境：API 路由
  : 'http://localhost:3001/api';  // 本地开发环境

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

  // 上传图片（生产环境：云函数 /api/upload）
  uploadImage: async (file: File) => {
    const reader = new FileReader();
    return new Promise<string>((resolve, reject) => {
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const res = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              fileContentBase64: base64,
            }),
          });
          const data = await res.json();
          if (data.code === 0 && data.url) resolve(data.url);
          else reject(data.message || '上传失败');
        } catch (err) {
          reject(err);
        }
      };
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
