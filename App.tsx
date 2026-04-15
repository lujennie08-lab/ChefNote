import React, { useState, useEffect } from 'react';
import { HomeView } from './views/Home';
import { EditorView } from './views/Editor';
import { RecipeDetail } from './views/RecipeDetail';
import { ImportSheet } from './views/ImportSheet';
import { AggregationView } from './views/Aggregation';
import { Recipe, ScreenType } from './types';
import { INITIAL_RECIPES, INITIAL_CATEGORIES } from './services/mockData';
import { RecipeAPI } from './services/api';

const App = () => {
  // --- State ---
  const [screen, setScreen] = useState<ScreenType>('home');
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track which recipe is currently being viewed or edited
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // Load recipes from backend on mount
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const response = await RecipeAPI.getAll();
        const data = response.data || [];
        if (Array.isArray(data) && data.length > 0) {
          setRecipes(data);
          // Extract categories from recipes
          const allCategories = new Set<string>();
          data.forEach(recipe => {
            recipe.category?.forEach(cat => allCategories.add(cat));
          });
          if (allCategories.size > 0) {
            setCategories(Array.from(allCategories));
          }
        }
      } catch (error) {
        console.error('Failed to load recipes:', error);
        // Fall back to initial recipes if API fails
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRecipes();
  }, []);

  // --- Handlers ---
  const toggleSelection = (id: number) => {
    if (selectedRecipeIds.includes(id)) {
      setSelectedRecipeIds(selectedRecipeIds.filter(itemId => itemId !== id));
    } else {
      setSelectedRecipeIds([...selectedRecipeIds, id]);
    }
  };

  const onRecipeCardClick = (recipe: Recipe) => {
     if (isSelectionMode) {
         toggleSelection(recipe.id);
     } else {
         setViewingRecipe(recipe);
         setScreen('detail');
     }
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    try {
      // Determine if this is a new recipe or an update
      const existingIndex = recipes.findIndex(r => r.id === recipe.id);
      const isNewRecipe = existingIndex === -1;

      console.log('Saving recipe:', { recipe, isNewRecipe, existingIndex });

      // Call API to save the recipe
      let apiResponse;
      if (isNewRecipe) {
        // Create new recipe (don't send ID for new recipes)
        const { id, ...recipeData } = recipe;
        apiResponse = await RecipeAPI.create(recipeData);
      } else {
        // Update existing recipe
        apiResponse = await RecipeAPI.update(recipe.id, recipe);
      }

      console.log('Raw API response:', apiResponse);

      // Extract data from API response - handle both response objects and direct data
      let savedRecipe = null;
      if (apiResponse && typeof apiResponse === 'object') {
        if (apiResponse.code === 0 || apiResponse.code === undefined) {
          // Success - extract data
          savedRecipe = apiResponse.data || apiResponse;
        } else {
          throw new Error(apiResponse.message || 'Save failed');
        }
      } else {
        savedRecipe = apiResponse;
      }

      console.log('Processed savedRecipe:', savedRecipe);

      // Validate saved recipe has necessary fields
      if (!savedRecipe || typeof savedRecipe !== 'object') {
        throw new Error('Invalid response data');
      }

      // Ensure recipe has an id
      if (!savedRecipe.id && !savedRecipe._id) {
        savedRecipe.id = recipe.id;
      }
      if (savedRecipe._id && !savedRecipe.id) {
        savedRecipe.id = savedRecipe._id;
      }

      // Update local state with saved recipe
      const newCategories = [...categories];
      let hasChanges = false;
      
      (savedRecipe.category || []).forEach((cat: string) => {
        if (!newCategories.includes(cat)) {
          newCategories.push(cat);
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        setCategories(newCategories);
      }

      if (isNewRecipe) {
        // Add new recipe to list
        setRecipes([savedRecipe, ...recipes]);
      } else {
        // Update existing recipe
        const updated = [...recipes];
        updated[existingIndex] = savedRecipe;
        setRecipes(updated);
      }
      
      // Always set viewing recipe before changing screen
      setViewingRecipe(savedRecipe);
      setEditingRecipe(null);
      
      // Change screen last, after all state is set
      setTimeout(() => {
        setScreen('detail');
      }, 0);
    } catch (error) {
      console.error('Failed to save recipe:', error);
      alert('保存失败，请重试：' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleCreateRequest = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setScreen('editor');
  };

  return (
    <div className="w-full h-[100dvh] bg-white overflow-hidden text-gray-900 relative">
        {/* Views */}
        <div className="h-full w-full">
          {screen === 'home' && (
            <HomeView 
              recipes={recipes}
              categories={categories}
              selectedRecipeIds={selectedRecipeIds}
              isSelectionMode={isSelectionMode}
              setIsSelectionMode={setIsSelectionMode}
              toggleSelection={toggleSelection}
              onEditRecipe={onRecipeCardClick}
              onNavigateToImport={() => setScreen('import')}
              onNavigateToAggregation={() => setScreen('aggregation')}
            />
          )}

          {screen === 'import' && (
            <div className="relative h-full">
               <HomeView 
                  recipes={recipes}
                  categories={categories}
                  selectedRecipeIds={selectedRecipeIds}
                  isSelectionMode={isSelectionMode}
                  setIsSelectionMode={setIsSelectionMode}
                  toggleSelection={toggleSelection}
                  onEditRecipe={() => {}} 
                  onNavigateToImport={() => {}}
                  onNavigateToAggregation={() => {}}
                />
               <ImportSheet 
                  onClose={() => setScreen('home')}
                  onRecipeCreated={handleCreateRequest}
               />
            </div>
          )}

          {screen === 'detail' && viewingRecipe && (
             <RecipeDetail 
                recipe={viewingRecipe}
                onBack={() => { setViewingRecipe(null); setScreen('home'); }}
                onEdit={() => { setEditingRecipe(viewingRecipe); setScreen('editor'); }}
             />
          )}

          {screen === 'editor' && editingRecipe && (
            <EditorView 
              initialRecipe={editingRecipe}
              categories={categories}
              onSave={handleSaveRecipe}
              onCancel={() => { 
                  // If it's a new recipe (not in list), go home. If existing, go back to detail.
                  if (recipes.find(r => r.id === editingRecipe.id)) {
                      setScreen('detail');
                  } else {
                      setScreen('home');
                  }
                  setEditingRecipe(null);
              }}
            />
          )}

          {screen === 'aggregation' && (
            <AggregationView 
              recipes={recipes}
              selectedIds={selectedRecipeIds}
              onBack={() => setScreen('home')}
              onClear={() => { setIsSelectionMode(false); setSelectedRecipeIds([]); setScreen('home'); }}
            />
          )}
        </div>
    </div>
  );
};

export default App;