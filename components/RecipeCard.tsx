import React from 'react';
import { Check, Utensils } from 'lucide-react';
import { Recipe } from '../lib/types';

interface RecipeCardProps {
  recipe: Recipe;
  isSelectionMode: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, isSelectionMode, isSelected, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`group relative bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer
        ${isSelected ? 'ring-2 ring-emerald-500 border-transparent' : ''}
      `}
    >
      {/* Cover Image */}
      <div className="h-32 w-full bg-gray-100 relative overflow-hidden">
        {recipe.cover ? (
          <img src={recipe.cover} className="w-full h-full object-cover" alt="cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
             <Utensils className="text-gray-300" size={32}/>
          </div>
        )}
        
        {/* Selection Overlay */}
        {isSelectionMode && (
          <div className={`absolute inset-0 bg-white/30 backdrop-blur-[2px] flex items-center justify-center transition-all duration-200 ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg transform scale-110">
              <Check size={16} className="text-white" strokeWidth={3}/>
            </div>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="px-4 pb-4 pt-3 relative">
        {/* Title Row with Category Badge */}
        <div className="flex justify-between items-start gap-3 mb-2">
          <h3 className="font-bold text-lg text-gray-900 leading-tight line-clamp-1">
            {recipe.title}
          </h3>
          <div className="flex gap-1 flex-wrap justify-end max-w-[40%]">
            {recipe.category.slice(0, 2).map((cat, i) => (
              <span key={i} className="shrink-0 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-medium tracking-wide">
                {cat}
              </span>
            ))}
          </div>
        </div>
        
        {/* Ingredient Tags Only */}
        <div className="flex flex-wrap gap-1.5">
          {recipe.ingredients.slice(0, 5).map((ing, i) => (
            <span key={i} className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-xs text-gray-600">
              {ing.name}
            </span>
          ))}
          {recipe.ingredients.length > 5 && (
            <span className="text-xs text-gray-400 px-1">...</span>
          )}
        </div>
      </div>
    </div>
  );
};