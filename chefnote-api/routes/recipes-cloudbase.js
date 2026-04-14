var express = require('express');
var router = express.Router();
var cloudbase = require('@cloudbase/node-sdk');

// Initialize CloudBase
const app = cloudbase.init({
  env: 'chefnote-v1-6glzfl9g4e98cc89', // CloudBase environment ID
});

const db = app.database();
const collection = db.collection('recipes');

// Helper function to send response
function sendResponse(res, statusCode, body) {
  res.status(statusCode).json({
    code: statusCode === 200 ? 0 : -1,
    data: statusCode === 200 ? body : null,
    message: statusCode === 200 ? 'Success' : body?.message || 'Error'
  });
}

// GET all recipes
router.get('/', async (req, res) => {
  try {
    const { category, q } = req.query;
    let query = collection;

    if (category) {
      // Search by category
      query = query.where({
        category: db.command.regex(new RegExp(category))
      });
    }

    if (q) {
      // Search by title or ingredients
      query = query.where(
        db.command.or([
          { title: db.command.regex(new RegExp(q)) },
          { ingredients: db.command.regex(new RegExp(q)) }
        ])
      );
    }

    const { data } = await query.get();
    sendResponse(res, 200, data || []);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    sendResponse(res, 500, { message: error.message });
  }
});

// GET recipe by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = await collection.doc(id).get();
    
    if (!data || data.length === 0) {
      return sendResponse(res, 404, { message: 'Recipe not found' });
    }
    
    sendResponse(res, 200, data[0]);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    sendResponse(res, 500, { message: error.message });
  }
});

// POST create recipe
router.post('/', async (req, res) => {
  try {
    const { title, category, cover, ingredients, seasonings, steps, link } = req.body;

    // Validation
    if (!title || !cover) {
      return sendResponse(res, 400, { message: 'Title and cover are required' });
    }

    const newRecipe = {
      title,
      category: Array.isArray(category) ? category.join(',') : category || '',
      cover,
      ingredients: typeof ingredients === 'object' ? JSON.stringify(ingredients) : ingredients || '[]',
      seasonings: Array.isArray(seasonings) ? seasonings.join(',') : seasonings || '',
      steps: typeof steps === 'object' ? JSON.stringify(steps) : steps || '[]',
      link: link || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { id } = await collection.add(newRecipe);
    newRecipe._id = id;

    sendResponse(res, 200, newRecipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    sendResponse(res, 500, { message: error.message });
  }
});

// PUT update recipe
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, cover, ingredients, seasonings, steps, link } = req.body;

    if (!title || !cover) {
      return sendResponse(res, 400, { message: 'Title and cover are required' });
    }

    const updatedData = {
      title,
      category: Array.isArray(category) ? category.join(',') : category || '',
      cover,
      ingredients: typeof ingredients === 'object' ? JSON.stringify(ingredients) : ingredients || '[]',
      seasonings: Array.isArray(seasonings) ? seasonings.join(',') : seasonings || '',
      steps: typeof steps === 'object' ? JSON.stringify(steps) : steps || '[]',
      link: link || '',
      updatedAt: new Date().toISOString()
    };

    await collection.doc(id).update(updatedData);

    const { data } = await collection.doc(id).get();
    if (data && data.length > 0) {
      sendResponse(res, 200, data[0]);
    } else {
      sendResponse(res, 404, { message: 'Recipe not found' });
    }
  } catch (error) {
    console.error('Error updating recipe:', error);
    sendResponse(res, 500, { message: error.message });
  }
});

// DELETE recipe
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await collection.doc(id).remove();

    sendResponse(res, 200, null);
  } catch (error) {
    console.error('Error deleting recipe:', error);
    sendResponse(res, 500, { message: error.message });
  }
});

module.exports = router;
