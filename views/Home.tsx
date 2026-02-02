import React, { useState } from 'react';
import { Search, List, Check, Plus } from 'lucide-react';
import { RecipeCard } from '../components/RecipeCard';
import { Recipe } from '../lib/types';

interface HomeViewProps {
  recipes: Recipe[];
  categories: string[];
  selectedRecipeIds: number[];
  isSelectionMode: boolean;
  setIsSelectionMode: (v: boolean) => void;
  toggleSelection: (id: number) => void;
  onEditRecipe: (recipe: Recipe) => void;
  onNavigateToImport: () => void;
  onNavigateToAggregation: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  recipes,
  categories,
  selectedRecipeIds,
  isSelectionMode,
  setIsSelectionMode,
  toggleSelection,
  onEditRecipe,
  onNavigateToImport,
  onNavigateToAggregation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('全部');

  // Filter Logic
  const filteredRecipes = recipes.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.ingredients.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategoryFilter === '全部' || r.category.includes(selectedCategoryFilter);
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/85 backdrop-blur-xl border-b border-gray-200/50 pb-2 transition-all">
        {/* Top Bar - Increased top padding to pt-20 (80px) to comfortably clear Dynamic Island */}
        <div className="px-5 pt-20 pb-2 flex justify-between items-start">
          <div className="flex flex-col">
            {/* Reduced title size, increased subtitle spacing */}
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 leading-none mb-2">ChefNote</h1>
            <p className="text-xs text-gray-400 font-medium tracking-wider">Jenny小厨的个人灵感菜谱库</p>
          </div>
          <button 
            onClick={() => { setIsSelectionMode(!isSelectionMode); }}
            className={`p-2 rounded-full transition-all active:scale-90 ${isSelectionMode ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            {isSelectionMode ? <Check size={20} strokeWidth={3} /> : <List size={22} />}
          </button>
        </div>

        {/* Search & Filter Section (Requirement 1) */}
        <div className="px-4 space-y-4 mt-3">
          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="搜索家常菜、食材..." 
              className="w-full bg-gray-100/80 text-gray-900 rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all border-none placeholder:text-gray-400 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Category Filters (Requirement 1) */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
            {['全部', ...categories].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all border ${
                  selectedCategoryFilter === cat 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area - Increased bottom padding for FAB and safe area */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32">
        {isSelectionMode && (
           <div className="mb-4 px-4 py-2.5 bg-emerald-50 rounded-lg text-emerald-800 text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-emerald-100">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/>
             请勾选需要采购的菜品
           </div>
        )}

        <div className="grid grid-cols-1 gap-5">
          {filteredRecipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-2">
              <Search size={40} className="opacity-20"/>
              <p className="text-sm">没有找到相关食谱</p>
            </div>
          ) : (
            filteredRecipes.map(recipe => (
              <RecipeCard 
                key={recipe.id}
                recipe={recipe}
                isSelectionMode={isSelectionMode}
                isSelected={selectedRecipeIds.includes(recipe.id)}
                onClick={() => {
                  if (isSelectionMode) {
                    toggleSelection(recipe.id);
                  } else {
                    onEditRecipe(recipe);
                  }
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Floating Action Buttons - Positioned higher to respect safe area */}
      <div className="absolute bottom-10 w-full px-6 flex justify-end pointer-events-none z-30">
        {isSelectionMode && selectedRecipeIds.length > 0 ? (
          <button 
            onClick={onNavigateToAggregation}
            className="pointer-events-auto w-full bg-emerald-600 text-white h-12 rounded-xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 font-semibold active:scale-95 transition-all text-[15px]"
          >
            生成备菜清单 <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs font-mono">{selectedRecipeIds.length}</span>
          </button>
        ) : (
          !isSelectionMode && (
            <button 
              onClick={onNavigateToImport}
              className="pointer-events-auto bg-gray-900 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-90 transition-all border-4 border-white/10"
            >
              <Plus size={26} />
            </button>
          )
        )}
      </div>
    </div>
  );
};