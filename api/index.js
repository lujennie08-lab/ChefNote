'use strict';

const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for recipes (for demo purposes)
let recipes = [
  {
    id: 1,
    title: '番茄炒蛋',
    category: ['家常菜', '下饭菜'],
    cover: 'https://picsum.photos/seed/tomato-egg/400/300.jpg',
    ingredients: [
      { name: '鸡蛋', amount: '3', unit: '个' },
      { name: '番茄', amount: '2', unit: '个' }
    ],
    seasonings: ['油', '盐', '糖'],
    steps: ['打蛋', '炒番茄', '混合炒蛋'],
    link: 'https://example.com/tomato-egg'
  },
  {
    id: 2,
    title: '红烧肉',
    category: ['硬菜', '家常菜'],
    cover: 'https://picsum.photos/seed/braised-pork/400/300.jpg',
    ingredients: [
      { name: '五花肉', amount: '500', unit: 'g' },
      { name: '冰糖', amount: '30', unit: 'g' }
    ],
    seasonings: ['油', '盐', '酱油', '料酒'],
    steps: ['切肉', '炒糖色', '炖煮'],
    link: 'https://example.com/braised-pork'
  }
];

// Helper function to generate new ID
function generateId() {
  return Math.max(...recipes.map(r => r.id), 0) + 1;
}

// API Routes
app.get('/api/recipes', (req, res) => {
  const { category, q } = req.query;

  let filteredRecipes = [...recipes];

  if (category) {
    const categories = category.split(',');
    filteredRecipes = filteredRecipes.filter(recipe =>
      categories.some(cat => recipe.category.includes(cat))
    );
  }

  if (q) {
    filteredRecipes = filteredRecipes.filter(recipe =>
      recipe.title.toLowerCase().includes(q.toLowerCase()) ||
      recipe.ingredients.some(ing => ing.name.toLowerCase().includes(q.toLowerCase()))
    );
  }

  res.json({
    code: 0,
    data: filteredRecipes,
    message: 'Success'
  });
});

app.get('/api/recipes/:id', (req, res) => {
  const recipe = recipes.find(r => r.id === parseInt(req.params.id));

  if (recipe) {
    res.json({
      code: 0,
      data: recipe,
      message: 'Success'
    });
  } else {
    res.status(404).json({
      code: -1,
      data: null,
      message: 'Recipe not found'
    });
  }
});

app.post('/api/recipes', (req, res) => {
  const newRecipe = {
    ...req.body,
    id: generateId()
  };

  recipes.push(newRecipe);

  res.status(201).json({
    code: 0,
    data: newRecipe,
    message: 'Recipe created successfully'
  });
});

app.put('/api/recipes/:id', (req, res) => {
  const index = recipes.findIndex(r => r.id === parseInt(req.params.id));

  if (index !== -1) {
    recipes[index] = { ...recipes[index], ...req.body };
    res.json({
      code: 0,
      data: recipes[index],
      message: 'Recipe updated successfully'
    });
  } else {
    res.status(404).json({
      code: -1,
      data: null,
      message: 'Recipe not found'
    });
  }
});

app.delete('/api/recipes/:id', (req, res) => {
  const index = recipes.findIndex(r => r.id === parseInt(req.params.id));

  if (index !== -1) {
    const deletedRecipe = recipes.splice(index, 1)[0];
    res.json({
      code: 0,
      data: deletedRecipe,
      message: 'Recipe deleted successfully'
    });
  } else {
    res.status(404).json({
      code: -1,
      data: null,
      message: 'Recipe not found'
    });
  }
});

// Image upload endpoint
// On Vercel there is no persistent filesystem; the client now handles
// uploads as data URLs directly. This route exists as a fallback only.
app.post('/api/upload', (req, res) => {
  res.status(400).json({
    code: -1,
    data: null,
    message: '请在客户端直接使用 data URL 上传图片'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    code: 0,
    data: { status: 'healthy' },
    message: 'API is running'
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// For Vercel deployment
module.exports = app;