var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

// Database file path
const DB_FILE = path.join(__dirname, '../data/recipes.json');
const DATA_DIR = path.dirname(DB_FILE);

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load recipes from file
function loadRecipes() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data || '[]');
    }
  } catch (error) {
    console.error('Error loading recipes:', error);
  }
  // Return initial data if file doesn't exist
  return [
    {
      id: 1,
      title: '番茄炒蛋',
      category: ['家常菜', '下饭菜'],
      cover: 'https://picsum.photos/600/400?random=1',
      ingredients: [
        { name: '鸡蛋', amount: '3', unit: '个' },
        { name: '番茄', amount: '2', unit: '个' },
        { name: '葱花', amount: '10', unit: 'g' }
      ],
      seasonings: ['油', '盐', '糖', '番茄酱'],
      steps: [
        '鸡蛋打散炒熟备用。',
        '番茄切块炒出汁。',
        '混合翻炒加调料。'
      ],
      link: 'https://www.xiaohongshu.com/explore'
    },
    {
      id: 2,
      title: '青椒肉丝',
      category: ['硬菜', '家常菜'],
      cover: 'https://picsum.photos/600/400?random=2',
      ingredients: [
        { name: '猪瘦肉', amount: '200', unit: 'g' },
        { name: '青椒', amount: '3', unit: '个' },
        { name: '姜', amount: '5', unit: 'g' }
      ],
      seasonings: ['油', '盐', '生抽', '料酒', '淀粉'],
      steps: [
        '肉丝腌制。',
        '青椒切丝。',
        '大火快炒。'
      ]
    },
    {
      id: 3,
      title: '紫菜蛋花汤',
      category: ['素菜', '汤羹'],
      cover: 'https://picsum.photos/600/400?random=3',
      ingredients: [
        { name: '鸡蛋', amount: '1', unit: '个' },
        { name: '干紫菜', amount: '10', unit: 'g' }
      ],
      seasonings: ['盐', '香油', '葱花'],
      steps: [
        '水烧开加紫菜。',
        '打入蛋花。',
        '调味出锅。'
      ]
    }
  ];
}

// Save recipes to file
function saveRecipes(recipes) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(recipes, null, 2), 'utf-8');
    console.log(`✅ Recipes saved to ${DB_FILE}`, recipes.length, 'items');
  } catch (error) {
    console.error('❌ Error saving recipes:', error);
  }
}

// Initialize recipes from file
let recipes = loadRecipes();

// Helper function to send response
function sendResponse(res, statusCode, body) {
  res.status(statusCode).json({
    code: statusCode === 200 ? 0 : -1,
    data: statusCode === 200 ? body : null,
    message: statusCode === 200 ? 'Success' : body?.message || 'Error'
  });
}


// GET all recipes
router.get('/', (req, res) => {
  try {
    const { category, q } = req.query;
    let filteredRecipes = recipes;

    if (category) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.category && recipe.category.includes(category)
      );
    }

    if (q) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.title.toLowerCase().includes(q.toLowerCase())
      );
    }

    sendResponse(res, 200, filteredRecipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    sendResponse(res, 500, { message: error.message });
  }
});

// GET recipe by id
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const recipe = recipes.find(r => r.id === parseInt(id));

    if (!recipe) {
      return sendResponse(res, 404, { message: 'Recipe not found' });
    }

    sendResponse(res, 200, recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    sendResponse(res, 500, { message: error.message });
  }
});

// POST create recipe
router.post('/', (req, res) => {
  try {
    const { title, category, cover, ingredients, seasonings, steps, link } = req.body;

    // Only title is required
    if (!title) {
      return sendResponse(res, 400, { message: 'Title is required' });
    }

    const maxId = recipes.length > 0 ? Math.max(...recipes.map(r => r.id || 0)) : 0;
    const newId = maxId + 1;

    const newRecipe = {
      id: newId,
      title,
      category: Array.isArray(category) ? category : (category ? [category] : []),
      cover: cover || 'https://picsum.photos/600/400?random=' + newId,  // Default image if not provided
      ingredients: Array.isArray(ingredients) ? ingredients : (ingredients ? [ingredients] : []),
      seasonings: Array.isArray(seasonings) ? seasonings : (seasonings ? [seasonings] : []),
      steps: Array.isArray(steps) ? steps : (steps ? [steps] : []),
      link: link || ''
    };

    recipes.push(newRecipe);
    saveRecipes(recipes);

    sendResponse(res, 200, newRecipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    sendResponse(res, 500, { message: error.message });
  }
});

// PUT update recipe
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, cover, ingredients, seasonings, steps, link } = req.body;

    // Only title is required
    if (!title) {
      return sendResponse(res, 400, { message: 'Title is required' });
    }

    const recipeIndex = recipes.findIndex(r => r.id === parseInt(id));

    if (recipeIndex === -1) {
      return sendResponse(res, 404, { message: 'Recipe not found' });
    }

    const updatedRecipe = {
      id: parseInt(id),
      title,
      category: Array.isArray(category) ? category : (category ? [category] : []),
      cover: cover || recipes[recipeIndex].cover,  // Keep existing cover if not provided
      ingredients: Array.isArray(ingredients) ? ingredients : (ingredients ? [ingredients] : []),
      seasonings: Array.isArray(seasonings) ? seasonings : (seasonings ? [seasonings] : []),
      steps: Array.isArray(steps) ? steps : (steps ? [steps] : []),
      link: link || ''
    };

    recipes[recipeIndex] = updatedRecipe;
    saveRecipes(recipes);

    sendResponse(res, 200, updatedRecipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    sendResponse(res, 500, { message: error.message });
  }
});

// DELETE recipe
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const recipeIndex = recipes.findIndex(r => r.id === parseInt(id));

    if (recipeIndex === -1) {
      return sendResponse(res, 404, { message: 'Recipe not found' });
    }

    recipes.splice(recipeIndex, 1);
    saveRecipes(recipes);

    sendResponse(res, 200, null);
  } catch (error) {
    console.error('Error deleting recipe:', error);
    sendResponse(res, 500, { message: error.message });
  }
});

module.exports = router;
