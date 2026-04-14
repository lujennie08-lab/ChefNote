import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// CloudBase 数据库 REST API
const ENV_ID = 'chefnote-v1-6glzfl9g4e98cc89';
const DATABASE_API = `https://api.cloudbase.net/v1/databases/recipes`;

// Enable CORS
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(uploadsDir));

console.log('Local proxy server running on http://localhost:3001');
console.log('Using CloudBase REST API for data access');

// Helper function to make CloudBase API calls
async function makeCloudBaseRequest(method, path, data = null) {
  const url = `https://api.cloudbase.net/v1/${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ENV_ID}`,
    },
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  console.log(`CloudBase API: ${method} ${path}`);
  
  try {
    const response = await fetch(url, options);
    const json = await response.json();
    console.log('CloudBase response:', json);
    return json;
  } catch (error) {
    console.error('CloudBase API error:', error);
    throw error;
  }
}

// Get all recipes - use in-memory mock data for now
const mockRecipes = [
  {
    _id: '1',
    id: '1',
    title: '番茄炒蛋',
    category: ['家常菜', '快手菜'],
    cover: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop',
    ingredients: ['番茄', '鸡蛋'],
    seasonings: ['盐', '糖', '油', '葱'],
    steps: ['步骤1', '步骤2', '步骤3'],
    link: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

app.get('/api/recipes', async (req, res) => {
  try {
    console.log('GET /api/recipes');
    res.json({ code: 0, data: mockRecipes, message: 'Success' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ code: -1, data: null, message: error.message });
  }
});

app.get('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('GET /api/recipes/:id', id);
    const recipe = mockRecipes.find(r => r.id === id || r._id === id);
    if (!recipe) {
      return res.status(404).json({ code: 404, data: null, message: 'Recipe not found' });
    }
    res.json({ code: 0, data: recipe, message: 'Success' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ code: -1, data: null, message: error.message });
  }
});

// Create recipe
app.post('/api/recipes', async (req, res) => {
  try {
    console.log('POST /api/recipes', req.body);
    const id = String(Math.max(...mockRecipes.map(r => parseInt(r.id) || 0)) + 1);
    const recipe = {
      ...req.body,
      _id: id,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockRecipes.push(recipe);
    res.status(201).json({ code: 0, data: recipe, message: 'Success' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ code: -1, data: null, message: error.message });
  }
});

// Update recipe
app.put('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('PUT /api/recipes/:id', id);
    console.log('Request body:', req.body);
    
    const index = mockRecipes.findIndex(r => r.id === id || r._id === id);
    if (index === -1) {
      return res.status(404).json({ code: 404, data: null, message: 'Recipe not found' });
    }
    
    const original = mockRecipes[index];
    const updated = {
      ...original,
      ...req.body,
      _id: original._id,
      id: original.id,
      createdAt: original.createdAt, // preserve original createdAt
      updatedAt: new Date().toISOString(),
    };
    
    mockRecipes[index] = updated;
    console.log('Updated recipe:', updated);
    res.json({ code: 0, data: updated, message: 'Success' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ code: -1, data: null, message: error.message });
  }
});

// Delete recipe
app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('DELETE /api/recipes/:id', id);
    const index = mockRecipes.findIndex(r => r.id === id || r._id === id);
    if (index === -1) {
      return res.status(404).json({ code: 404, data: null, message: 'Recipe not found' });
    }
    mockRecipes.splice(index, 1);
    res.json({ code: 0, data: null, message: 'Success' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ code: -1, data: null, message: error.message });
  }
});

// Upload endpoint - save files to disk
app.post('/api/upload', async (req, res) => {
  try {
    const { fileContentBase64, filename } = req.body;
    console.log('POST /api/upload');
    console.log('Received filename:', filename);
    console.log('Base64 length:', fileContentBase64?.length);
    
    if (!fileContentBase64) {
      console.error('Missing fileContentBase64');
      return res.status(400).json({ code: 400, data: null, message: 'Missing file content' });
    }
    if (!filename) {
      console.error('Missing filename');
      return res.status(400).json({ code: 400, data: null, message: 'Missing filename' });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = filename.split('.').pop().toLowerCase();
    const savedFilename = `${timestamp}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filepath = path.join(uploadsDir, savedFilename);
    
    try {
      // Convert base64 to buffer and save
      const buffer = Buffer.from(fileContentBase64, 'base64');
      fs.writeFileSync(filepath, buffer);
      
      // Return URL that can be served by this server
      const fileUrl = `http://localhost:3001/uploads/${savedFilename}`;
      console.log('File saved successfully:', fileUrl);
      
      res.json({ code: 0, data: { url: fileUrl }, url: fileUrl, message: 'Success' });
    } catch (saveError) {
      console.error('File save error:', saveError);
      res.status(500).json({ code: -1, data: null, message: `Save error: ${saveError.message}` });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ code: -1, data: null, message: error.message });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'ChefNote Local Proxy Server', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`Server ready: http://localhost:${PORT}`);
});
