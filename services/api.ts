// API Configuration
const API_BASE = import.meta.env.PROD
  ? '/api'
  : 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  RECIPES_LIST: `${API_BASE}/recipes`,
  RECIPES_BY_ID: (id: number) => `${API_BASE}/recipes/${id}`,
  RECIPES_BY_CATEGORY: (category: string) => `${API_BASE}/recipes?category=${encodeURIComponent(category)}`,
  RECIPES_SEARCH: (query: string) => `${API_BASE}/recipes?q=${encodeURIComponent(query)}`,
};

const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<{ code: number; data: T; message: string }> => {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  return response.json();
};

export const RecipeAPI = {
  getAll: () => apiRequest<any[]>(API_ENDPOINTS.RECIPES_LIST),
  getById: (id: number) => apiRequest<any>(API_ENDPOINTS.RECIPES_BY_ID(id)),
  getByCategory: (category: string) => apiRequest<any[]>(API_ENDPOINTS.RECIPES_BY_CATEGORY(category)),
  search: (query: string) => apiRequest<any[]>(API_ENDPOINTS.RECIPES_SEARCH(query)),
  create: (recipe: any) => apiRequest<any>(API_ENDPOINTS.RECIPES_LIST, { method: 'POST', body: JSON.stringify(recipe) }),
  update: (id: number, recipe: any) => apiRequest<any>(API_ENDPOINTS.RECIPES_BY_ID(id), { method: 'PUT', body: JSON.stringify(recipe) }),
  delete: (id: number) => apiRequest<any>(API_ENDPOINTS.RECIPES_BY_ID(id), { method: 'DELETE' }),

  // 图片上传：客户端直接转 data URL
  uploadImage: (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }),
};

export default { RecipeAPI };
