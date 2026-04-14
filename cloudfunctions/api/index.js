const tcb = require('@cloudbase/node-sdk');

const app = tcb.init({
  env: 'chefnote-v1-6glzfl9g4e98cc89',
});

const db = app.database();
const recipesCollection = db.collection('recipes');

/**
 * 菜谱 API Cloud Function
 * 支持 RESTful 路由：/api/recipes, /api/upload 等
 */
exports.main = async (event, context) => {
  console.log('Event:', event);
  console.log('Context:', context);

  // 从 HTTP 请求头获取方法和路径
  const method = event.httpMethod || 'GET';
  const path = event.path || event.requestPath || '/';
  const body = event.body ? JSON.parse(event.body) : {};
  const queryParams = event.queryStringParameters || {};

  // 设置响应头
  const responseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    // OPTIONS 请求处理（CORS 预检）
    if (method === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: responseHeaders,
        body: JSON.stringify({ message: 'OK' }),
      };
    }

    // GET /api/recipes - 获取所有菜谱
    if (method === 'GET' && path === '/api/recipes') {
      const { data: recipes } = await recipesCollection.get();
      return {
        statusCode: 200,
        headers: responseHeaders,
        body: JSON.stringify({
          code: 0,
          data: recipes || [],
          message: 'Success',
        }),
      };
    }

    // GET /api/recipes/:id - 获取单个菜谱
    if (method === 'GET' && path.match(/^\/api\/recipes\/[^/]+$/)) {
      const id = path.split('/').pop();
      const { data: recipe } = await recipesCollection.doc(id).get();
      if (recipe.length === 0) {
        return {
          statusCode: 404,
          headers: responseHeaders,
          body: JSON.stringify({
            code: 404,
            data: null,
            message: 'Recipe not found',
          }),
        };
      }
      return {
        statusCode: 200,
        headers: responseHeaders,
        body: JSON.stringify({
          code: 0,
          data: recipe[0],
          message: 'Success',
        }),
      };
    }

    // POST /api/recipes - 创建菜谱
    if (method === 'POST' && path === '/api/recipes') {
      const id = `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      const recipe = {
        _id: id,
        id,
        title: body.title || '未命名菜谱',
        category: body.category || [],
        cover: body.cover || '',
        ingredients: body.ingredients || [],
        seasonings: body.seasonings || [],
        steps: body.steps || [],
        link: body.link || '',
        createdAt: now,
        updatedAt: now,
      };

      await recipesCollection.doc(id).set(recipe);
      return {
        statusCode: 201,
        headers: responseHeaders,
        body: JSON.stringify({
          code: 0,
          data: recipe,
          message: 'Success',
        }),
      };
    }

    // PUT /api/recipes/:id - 更新菜谱
    if (method === 'PUT' && path.match(/^\/api\/recipes\/[^/]+$/)) {
      const id = path.split('/').pop();
      
      // 获取原始记录以保留 createdAt
      const { data: original } = await recipesCollection.doc(id).get();
      if (original.length === 0) {
        return {
          statusCode: 404,
          headers: responseHeaders,
          body: JSON.stringify({
            code: 404,
            data: null,
            message: 'Recipe not found',
          }),
        };
      }

      const updated = {
        ...original[0],
        ...body,
        _id: id,
        id,
        createdAt: original[0].createdAt, // 保留原始创建时间
        updatedAt: new Date().toISOString(),
      };

      await recipesCollection.doc(id).update(updated);
      return {
        statusCode: 200,
        headers: responseHeaders,
        body: JSON.stringify({
          code: 0,
          data: updated,
          message: 'Success',
        }),
      };
    }

    // DELETE /api/recipes/:id - 删除菜谱
    if (method === 'DELETE' && path.match(/^\/api\/recipes\/[^/]+$/)) {
      const id = path.split('/').pop();
      await recipesCollection.doc(id).remove();
      return {
        statusCode: 200,
        headers: responseHeaders,
        body: JSON.stringify({
          code: 0,
          data: null,
          message: 'Success',
        }),
      };
    }

    // POST /api/upload - 上传图片（使用 CloudBase 云存储）
    if (method === 'POST' && path === '/api/upload') {
      const { filename, fileContentBase64 } = body;
      
      if (!fileContentBase64 || !filename) {
        return {
          statusCode: 400,
          headers: responseHeaders,
          body: JSON.stringify({
            code: 400,
            data: null,
            message: 'Missing filename or file content',
          }),
        };
      }

      // 生成云存储路径
      const cloudPath = `recipes/${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${filename}`;
      
      try {
        // 上传到云存储
        const storage = app.storage();
        const buffer = Buffer.from(fileContentBase64, 'base64');
        await storage.uploadFile({
          localPath: null, // 直接使用 buffer
          cloudPath,
          Body: buffer,
        });

        // 获取临时下载链接
        const { fileUrl } = await storage.getDownloadURL({
          fileList: [cloudPath],
        });

        const url = fileUrl[0] || `https://tcb-file-${app.config.env}.tcloudbaseapp.com/${cloudPath}`;
        
        return {
          statusCode: 200,
          headers: responseHeaders,
          body: JSON.stringify({
            code: 0,
            data: { url },
            url,
            message: 'Success',
          }),
        };
      } catch (error) {
        console.error('Upload error:', error);
        return {
          statusCode: 500,
          headers: responseHeaders,
          body: JSON.stringify({
            code: -1,
            data: null,
            message: `Upload failed: ${error.message}`,
          }),
        };
      }
    }

    // 404 - 未找到路由
    return {
      statusCode: 404,
      headers: responseHeaders,
      body: JSON.stringify({
        code: 404,
        data: null,
        message: 'Route not found',
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: responseHeaders,
      body: JSON.stringify({
        code: -1,
        data: null,
        message: `Error: ${error.message}`,
      }),
    };
  }
};
