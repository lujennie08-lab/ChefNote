import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'chefnote';
const COLLECTION = 'recipes';

// Serverless 连接复用——避免每次请求都新建连接
let cachedClient: MongoClient | null = null;

async function getCollection() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI environment variable is not set');
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI);
    await cachedClient.connect();
  }
  return cachedClient.db(DB_NAME).collection(COLLECTION);
}

function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id, category, q } = req.query;

  try {
    const col = await getCollection();

    // GET /api/recipes — list / search / filter
    if (req.method === 'GET' && !id) {
      const filter: any = {};
      if (category && typeof category === 'string') {
        filter.category = { $in: category.split(',') };
      }
      if (q && typeof q === 'string') {
        const re = { $regex: q, $options: 'i' };
        filter.$or = [{ title: re }, { 'ingredients.name': re }];
      }
      const recipes = await col.find(filter).sort({ id: -1 }).toArray();
      return res.status(200).json({ code: 0, data: recipes, message: 'Success' });
    }

    // GET /api/recipes/:id
    if (req.method === 'GET' && id) {
      const numId = Number(id);
      const recipe = await col.findOne({ id: isNaN(numId) ? id : numId });
      if (!recipe) return res.status(404).json({ code: 404, data: null, message: 'Recipe not found' });
      return res.status(200).json({ code: 0, data: recipe, message: 'Success' });
    }

    // POST /api/recipes — create
    if (req.method === 'POST') {
      if (!req.body?.title) {
        return res.status(400).json({ code: 400, data: null, message: 'Title is required' });
      }
      // 生成递增数字 ID
      const last = await col.find().sort({ id: -1 }).limit(1).toArray();
      const newId = last.length > 0 ? (Number(last[0].id) || 0) + 1 : 1;
      const newRecipe = {
        ...req.body,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await col.insertOne(newRecipe);
      return res.status(201).json({ code: 0, data: newRecipe, message: 'Success' });
    }

    // PUT /api/recipes/:id — update
    if (req.method === 'PUT' && id) {
      const numId = Number(id);
      const query = { id: isNaN(numId) ? id : numId };
      const existing = await col.findOne(query);
      if (!existing) return res.status(404).json({ code: 404, data: null, message: 'Recipe not found' });
      const updated = {
        ...existing,
        ...req.body,
        id: existing.id,
        _id: existing._id,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
      };
      await col.replaceOne(query, updated);
      return res.status(200).json({ code: 0, data: updated, message: 'Success' });
    }

    // DELETE /api/recipes/:id
    if (req.method === 'DELETE' && id) {
      const numId = Number(id);
      await col.deleteOne({ id: isNaN(numId) ? id : numId });
      return res.status(200).json({ code: 0, data: null, message: 'Success' });
    }

    return res.status(404).json({ code: 404, data: null, message: 'Route not found' });

  } catch (error: any) {
    console.error('API Error:', error);
    cachedClient = null; // 连接出错时重置，下次重连
    return res.status(500).json({ code: -1, data: null, message: error.message || 'Internal Server Error' });
  }
}
  {
    _id: '1',
    id: 1,
    title: '番茄炒蛋',
    category: ['家常菜', '快手菜'],
    cover: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop',
    ingredients: [
      { name: '番茄', amount: '2', unit: '个' },
      { name: '鸡蛋', amount: '3', unit: '个' }
    ],
    seasonings: ['盐', '糖', '油', '葱'],
    steps: ['番茄切块', '鸡蛋打散', '热油炒蛋', '加入番茄翻炒', '调味即可'],
    link: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    id: 2,
    title: '红烧肉',
    category: ['硬菜', '家常菜'],
    cover: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop',
    ingredients: [
      { name: '五花肉', amount: '500', unit: 'g' },
      { name: '冰糖', amount: '30', unit: 'g' }
    ],
    seasonings: ['生抽', '老抽', '料酒', '八角', '桂皮'],
    steps: ['五花肉切块焯水', '炒糖色', '加入肉块翻炒', '加调料炖煮1小时', '大火收汁'],
    link: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// 生成递增数字ID（与前端 types.ts 的 id: number 保持一致）
let nextId = 3;
function generateId(): number {
  return nextId++;
}

// CORS 头
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS
  setCorsHeaders(res);

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id, category, q } = req.query;

  try {
    // GET /api/recipes - 获取所有食谱
    if (req.method === 'GET' && !id) {
      let result = recipes;

      // 按分类筛选
      if (category && typeof category === 'string') {
        result = recipes.filter(r =>
          r.category && r.category.some((c: string) =>
            c.toLowerCase().includes(category.toLowerCase())
          )
        );
      }

      // 按标题搜索
      if (q && typeof q === 'string') {
        result = recipes.filter(r =>
          r.title && r.title.toLowerCase().includes(q.toLowerCase())
        );
      }

      return res.status(200).json({
        code: 0,
        data: result,
        message: 'Success'
      });
    }

    // GET /api/recipes/:id - 获取单个食谱
    if (req.method === 'GET' && id) {
      const recipe = recipes.find(r => r._id === id || r.id === id);
      if (!recipe) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: 'Recipe not found'
        });
      }
      return res.status(200).json({
        code: 0,
        data: recipe,
        message: 'Success'
      });
    }

    // POST /api/recipes - 创建食谱
    if (req.method === 'POST') {
      const { title, category: cats, cover, ingredients, seasonings, steps, link } = req.body;

      if (!title) {
        return res.status(400).json({
          code: 400,
          data: null,
          message: 'Title is required'
        });
      }

      const newId = generateId();
      const newRecipe = {
        _id: String(newId),
        id: newId,
        title,
        category: Array.isArray(cats) ? cats : (cats ? [cats] : []),
        cover,
        ingredients: Array.isArray(ingredients) ? ingredients : [],
        seasonings: Array.isArray(seasonings) ? seasonings : [],
        steps: Array.isArray(steps) ? steps : [],
        link: link || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      recipes.push(newRecipe);

      return res.status(201).json({
        code: 0,
        data: newRecipe,
        message: 'Success'
      });
    }

    // PUT /api/recipes/:id - 更新食谱
    if (req.method === 'PUT' && id) {
      const index = recipes.findIndex(r => r._id === id || r.id === id);
      if (index === -1) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: 'Recipe not found'
        });
      }

      const original = recipes[index];
      const updated = {
        ...original,
        ...req.body,
        _id: original._id,
        id: original.id,
        createdAt: original.createdAt,
        updatedAt: new Date().toISOString(),
      };

      recipes[index] = updated;

      return res.status(200).json({
        code: 0,
        data: updated,
        message: 'Success'
      });
    }

    // DELETE /api/recipes/:id - 删除食谱
    if (req.method === 'DELETE' && id) {
      const index = recipes.findIndex(r => r._id === id || r.id === id);
      if (index === -1) {
        return res.status(404).json({
          code: 404,
          data: null,
          message: 'Recipe not found'
        });
      }

      recipes.splice(index, 1);

      return res.status(200).json({
        code: 0,
        data: null,
        message: 'Success'
      });
    }

    // 未知路由
    return res.status(404).json({
      code: 404,
      data: null,
      message: 'Route not found'
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({
      code: -1,
      data: null,
      message: error.message || 'Internal Server Error'
    });
  }
}
