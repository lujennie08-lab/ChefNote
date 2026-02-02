'use client';

import { useState } from 'react';
import { HomeView } from '../views/Home';
import { EditorView } from '../views/Editor';
import { RecipeDetail } from '../views/RecipeDetail';
import { ImportSheet } from '../views/ImportSheet';
import { AggregationView } from '../views/Aggregation';
import { Recipe, ScreenType } from '../lib/types';
import { INITIAL_RECIPES, INITIAL_CATEGORIES } from '../lib/mockData';

export default function Home() {
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
    // Add new categories if they don't exist
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
                  onEditRecipe={onRecipeCardClick}
                  onNavigateToImport={() => setScreen('import')}
                  onNavigateToAggregation={() => setScreen('aggregation')}
               />
               <ImportSheet 
                  onClose={() => setScreen('home')}
                  onRecipeCreated={(recipe) => {
                     handleCreateRequest(recipe);
                     setScreen('editor');
                  }}
               />
            </div>
          )}

          {screen === 'detail' && viewingRecipe && (
             <RecipeDetail 
                recipe={viewingRecipe}
                onBack={() => setScreen('home')}
                onEdit={() => {
                   setEditingRecipe(viewingRecipe);
                   setScreen('editor');
                }}
             />
          )}

          {screen === 'editor' && editingRecipe && (
             <EditorView 
                initialRecipe={editingRecipe}
                categories={categories}
                onSave={handleSaveRecipe}
                onCancel={() => {
                   setEditingRecipe(null);
                   setScreen(viewingRecipe ? 'detail' : 'home');
                }}
             />
          )}

          {screen === 'aggregation' && (
             <AggregationView 
                recipes={recipes}
                selectedIds={selectedRecipeIds}
                onBack={() => {
                   setSelectedRecipeIds([]);
                   setIsSelectionMode(false);
                   setScreen('home');
                }}
                onClear={() => {
                   setSelectedRecipeIds([]);
                   setIsSelectionMode(false);
                   setScreen('home');
                }}
             />
          )}
        </div>
    </div>
  );
}
