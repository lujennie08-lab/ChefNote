import React, { useState } from 'react';
import { HomeView } from './views/Home';
import { EditorView } from './views/Editor';
import { RecipeDetail } from './views/RecipeDetail';
import { ImportSheet } from './views/ImportSheet';
import { AggregationView } from './views/Aggregation';
import { Recipe, ScreenType } from './types';
import { INITIAL_RECIPES, INITIAL_CATEGORIES } from './services/mockData';

const App = () => {
  // --- State ---
  const [screen, setScreen] = useState<ScreenType>('home');
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  // Track which recipe is currently being viewed or edited
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

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

  const handleSaveRecipe = (recipe: Recipe) => {
    // Requirements check: Add new categories if they don't exist
    const newCategories = [...categories];
    let hasChanges = false;
    
    recipe.category.forEach(cat => {
      if (!newCategories.includes(cat)) {
        newCategories.push(cat);
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      setCategories(newCategories);
    }

    const existingIndex = recipes.findIndex(r => r.id === recipe.id);
    if (existingIndex >= 0) {
      const updated = [...recipes];
      updated[existingIndex] = recipe;
      setRecipes(updated);
      // Update viewing recipe as well since we are returning to detail view
      setViewingRecipe(recipe);
    } else {
      setRecipes([recipe, ...recipes]);
      setViewingRecipe(recipe);
    }
    
    setEditingRecipe(null);
    setScreen('detail');
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