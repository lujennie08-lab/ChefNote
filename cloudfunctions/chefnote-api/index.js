'use strict';

const cloudbase = require('@cloudbase/node-sdk');

// Initialize CloudBase
let app, db, collection;
try {
  app = cloudbase.init({
    env: cloudbase.SYMBOL_CURRENT_ENV,
  });
  db = app.database();
  collection = db.collection('recipes');
  console.log('CloudBase initialized successfully');
} catch (err) {
  console.error('Failed to initialize CloudBase:', err);
}

// Track current request origin (will be set at runtime)
let currentOrigin = '*';

// Helper function to send response
function sendResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': currentOrigin || '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Max-Age': '3600'
    },
    body: JSON.stringify({
      code: statusCode === 200 || statusCode === 201 ? 0 : -1,
      data: statusCode >= 200 && statusCode < 300 ? body : null,
      message: statusCode >= 200 && statusCode < 300 ? 'Success' : body?.message || 'Error'
    })
  };
}

// Main handler
exports.main = async (event, context) => {
  try {
    // Set currentOrigin from incoming request headers to allow origin echo
    currentOrigin = (event && event.headers && (event.headers.origin || event.headers.Origin)) || '*';
    const { httpMethod, path, queryStringParameters = {}, body: requestBody } = event;
    
    console.log('=== REQUEST START ===');
    console.log('HTTP Method:', httpMethod);
    console.log('Path:', path);
    console.log('Origin:', currentOrigin);
    console.log('Request body:', requestBody);
    
    // Parse path
    const pathParts = path.split('/').filter(Boolean);
    const action = pathParts[1];
    const id = pathParts[2];
    
    console.log('Parsed action:', action, 'id:', id);

    // Handle CORS preflight
    if (httpMethod === 'OPTIONS') {
      console.log('Handling OPTIONS preflight');
      return sendResponse(200, { message: 'OK' });
    }

    let body;
    if (requestBody) {
      try {
        body = typeof requestBody === 'string' ? JSON.parse(requestBody) : requestBody;
      } catch (e) {
        return sendResponse(400, { message: 'Invalid JSON' });
      }
    }

    // Routes
    if (action === 'recipes') {
      if (httpMethod === 'GET') {
        if (id) {
          // Get single recipe by ID
          const { data } = await collection.doc(id).get();
          if (!data || data.length === 0) {
            return sendResponse(404, { message: 'Recipe not found' });
          }
          return sendResponse(200, data[0]);
        } else if (queryStringParameters.category) {
          // Get recipes by category
          const category = decodeURIComponent(queryStringParameters.category);
          const query = collection.where({
            category: db.command.elemMatch(
              db.command.regex(new RegExp(category))
            )
          });
          const { data } = await query.get();
          return sendResponse(200, data || []);
        } else if (queryStringParameters.q) {
          // Search recipes by title
          const query = queryStringParameters.q.toLowerCase();
          const searchQuery = collection.where({
            title: db.command.regex(new RegExp(query, 'i'))
          });
          const { data } = await searchQuery.get();
          return sendResponse(200, data || []);
        } else {
          // Get all recipes
          const { data } = await collection.get();
          return sendResponse(200, data || []);
        }
      } else if (httpMethod === 'POST') {
        // Create recipe
        const { title, category, cover, ingredients, seasonings, steps, link } = body;
        if (!title || !cover) {
          return sendResponse(400, { message: 'Title and cover are required' });
        }
        const newRecipe = {
          title,
          category: Array.isArray(category) ? category : (category ? [category] : []),
          cover,
          ingredients: Array.isArray(ingredients) ? ingredients : (ingredients ? [ingredients] : []),
          seasonings: Array.isArray(seasonings) ? seasonings : (seasonings ? [seasonings] : []),
          steps: Array.isArray(steps) ? steps : (steps ? [steps] : []),
          link: link || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const { id: newId } = await collection.add(newRecipe);
        newRecipe._id = newId;
        return sendResponse(201, newRecipe);
      } else if (httpMethod === 'PUT' && id) {
        // Update recipe
        const { title, category, cover, ingredients, seasonings, steps, link } = body;
        if (!title || !cover) {
          return sendResponse(400, { message: 'Title and cover are required' });
        }
        const updatedData = {
          title,
          category: Array.isArray(category) ? category : (category ? [category] : []),
          cover,
          ingredients: Array.isArray(ingredients) ? ingredients : (ingredients ? [ingredients] : []),
          seasonings: Array.isArray(seasonings) ? seasonings : (seasonings ? [seasonings] : []),
          steps: Array.isArray(steps) ? steps : (steps ? [steps] : []),
          link: link || '',
          updatedAt: new Date().toISOString()
        };
        await collection.doc(id).update(updatedData);
        const { data } = await collection.doc(id).get();
        if (data && data.length > 0) {
          return sendResponse(200, data[0]);
        } else {
          return sendResponse(404, { message: 'Recipe not found' });
        }
      } else if (httpMethod === 'DELETE' && id) {
        // Delete recipe
        await collection.doc(id).remove();
        return sendResponse(200, { message: 'Recipe deleted successfully' });
      }
    }

    // Upload route: POST /api/upload
    if (action === 'upload' && httpMethod === 'POST') {
      try {
        const { filename, fileContentBase64 } = body || {};
        if (!filename || !fileContentBase64) {
          return sendResponse(400, { message: 'Missing filename or fileContentBase64' });
        }

        // sanitize filename
        const safeName = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
        const cloudPath = `uploads/${Date.now()}-${safeName}`;

        // upload file buffer to CloudBase storage
        const buffer = Buffer.from(fileContentBase64, 'base64');
        const uploadRes = await app.uploadFile({
          cloudPath,
          fileContent: buffer,
        });

        const fileID = uploadRes && (uploadRes.fileID || uploadRes.fileId || uploadRes.fileid);
        if (!fileID) {
          return sendResponse(500, { message: 'Upload failed, no fileID returned' });
        }

        // get temporary URL (valid for 7 days)
        const tempRes = await app.getTempFileURL({ fileList: [fileID], maxAge: 7 * 24 * 60 * 60 });
        const url = tempRes && tempRes.fileList && tempRes.fileList[0] && tempRes.fileList[0].tempFileURL;
        if (!url) {
          return sendResponse(500, { message: 'Failed to retrieve temp URL' });
        }

        return sendResponse(200, { url });
      } catch (err) {
        console.error('Upload error:', err);
        return sendResponse(500, { message: err.message });
      }
    }

    if (httpMethod === 'GET' && path === '/') {
      return sendResponse(200, { message: 'ChefNote API Server', version: '2.0.0' });
    }

    return sendResponse(404, { message: 'Route not found' });
  } catch (error) {
    console.error('Unhandled error in main handler:', error);
    // Return error response with CORS headers even if something crashed
    return sendResponse(500, { message: error.message || 'Internal Server Error' });
  }
};
