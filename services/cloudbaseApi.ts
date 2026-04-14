import tcb from '@cloudbase/js-sdk';

const ENV_ID = 'chefnote-v1-6glzfl9g4e98cc89';
// Use local backend in development, cloud function in production
const API_URL = import.meta.env.MODE === 'production' 
  ? `https://service-${ENV_ID}.ap-shanghai.tcloudbaseapp.com`
  : 'http://localhost:3001';

console.log('Using API_URL:', API_URL);

// Initialize CloudBase (for image uploads if needed)
let app: any = null;

export const initCloudBase = async () => {
  if (app) return app;
  
  try {
    app = tcb.init({
      env: ENV_ID,
    });
    
    console.log('CloudBase SDK initialized');
    return app;
  } catch (err) {
    console.error('Failed to initialize CloudBase:', err);
    return app;
  }
};

// Recipe API
export const RecipeAPISDK = {
  // Get all recipes
  getAll: async () => {
    try {
      console.log('getAll: Fetching from', API_URL);
      const response = await fetch(`${API_URL}/api/recipes`);
      const json = await response.json();
      console.log('getAll response:', json);
      
      if (json.code === 0) {
        return {
          code: 0,
          data: json.data || [],
          message: 'Success',
        };
      } else {
        throw new Error(json.message || 'API error');
      }
    } catch (error: any) {
      console.error('getAll error:', error);
      return {
        code: -1,
        data: [],
        message: error.message || 'Failed to get recipes',
      };
    }
  },

  // Get recipe by ID
  getById: async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/recipes/${id}`);
      const json = await response.json();
      
      if (json.code === 0 && json.data) {
        return {
          code: 0,
          data: json.data,
          message: 'Success',
        };
      } else {
        return {
          code: 404,
          data: null,
          message: 'Recipe not found',
        };
      }
    } catch (error: any) {
      console.error('getById error:', error);
      return {
        code: -1,
        data: null,
        message: error.message || 'Failed to get recipe',
      };
    }
  },

  // Get recipes by category
  getByCategory: async (category: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/recipes?category=${encodeURIComponent(category)}`
      );
      const json = await response.json();
      
      if (json.code === 0) {
        return {
          code: 0,
          data: json.data || [],
          message: 'Success',
        };
      } else {
        throw new Error(json.message || 'API error');
      }
    } catch (error: any) {
      console.error('getByCategory error:', error);
      return {
        code: -1,
        data: [],
        message: error.message || 'Failed to get recipes',
      };
    }
  },

  // Search recipes
  search: async (query: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/recipes?search=${encodeURIComponent(query)}`
      );
      const json = await response.json();
      
      if (json.code === 0) {
        return {
          code: 0,
          data: json.data || [],
          message: 'Success',
        };
      } else {
        throw new Error(json.message || 'API error');
      }
    } catch (error: any) {
      console.error('search error:', error);
      return {
        code: -1,
        data: [],
        message: error.message || 'Failed to search recipes',
      };
    }
  },

  // Create recipe
  create: async (recipe: any) => {
    try {
      console.log('create: Sending recipe');
      const response = await fetch(`${API_URL}/api/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...recipe,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });
      const json = await response.json();
      console.log('create response:', json);
      
      if (json.code === 0 && json.data) {
        const result = { ...json.data };
        result.id = result._id || result.id;
        return {
          code: 0,
          data: result,
          message: 'Success',
        };
      } else {
        throw new Error(json.message || 'Create failed');
      }
    } catch (error: any) {
      console.error('create error:', error);
      return {
        code: -1,
        data: null,
        message: error.message || 'Failed to create recipe',
      };
    }
  },

  // Update recipe
  update: async (id: string, recipe: any) => {
    try {
      console.log('=== UPDATE START ===');
      console.log('Updating recipe with id:', id);
      
      // Build update data by excluding _id and id
      const updateData: any = {};
      for (const key in recipe) {
        if (key !== '_id' && key !== 'id') {
          updateData[key] = recipe[key];
        }
      }
      updateData.updatedAt = new Date().toISOString();
      
      console.log('Update data to send:', updateData);
      
      const response = await fetch(`${API_URL}/api/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      console.log('Update response status:', response.status);
      const json = await response.json();
      console.log('Update response:', json);
      
      if (json.code === 0 && json.data) {
        const result = { ...json.data };
        result.id = result._id || id;
        console.log('=== UPDATE SUCCESS ===');
        return {
          code: 0,
          data: result,
          message: 'Success',
        };
      } else {
        throw new Error(json.message || 'Update failed');
      }
    } catch (error: any) {
      console.error('=== UPDATE FAILED ===');
      console.error('Error details:', error);
      return {
        code: -1,
        data: null,
        message: error.message || 'Failed to update recipe',
      };
    }
  },

  // Delete recipe
  delete: async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/recipes/${id}`, {
        method: 'DELETE',
      });
      const json = await response.json();
      
      if (json.code === 0) {
        return {
          code: 0,
          data: null,
          message: 'Success',
        };
      } else {
        throw new Error(json.message || 'Delete failed');
      }
    } catch (error: any) {
      console.error('delete error:', error);
      return {
        code: -1,
        data: null,
        message: error.message || 'Failed to delete recipe',
      };
    }
  },

  // Upload image 
  uploadImage: async (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          if (!base64Data) {
            reject(new Error('Failed to convert file to base64'));
            return;
          }

          const response = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              fileContentBase64: base64Data,
            }),
          });

          const json = await response.json();
          console.log('Upload response:', json);

          if (json.code === 0 && (json.data?.url || json.url)) {
            resolve(json.data?.url || json.url);
          } else {
            reject(new Error(json.message || 'Upload failed'));
          }
        } catch (err: any) {
          console.error('Upload error:', err);
          reject(err);
        }
      };

      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  },
};

export const getDB = async () => {
  // For compatibility - API is used instead
  return null;
};

export default {
  initCloudBase,
  getDB,
  RecipeAPISDK,
};
