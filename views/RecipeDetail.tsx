import React, { useState } from 'react';
import { ChevronLeft, ShoppingBag, Utensils, ChevronDown, Link as LinkIcon, Copy, Check, ImageOff, ChefHat } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onEdit: () => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onBack, onEdit }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (recipe.link) {
      navigator.clipboard.writeText(recipe.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative animate-in slide-in-from-right duration-300">
      {/* Header - Increased top padding to pt-16 (64px) */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 pt-16 flex justify-between items-center pointer-events-none">
        <button 
          onClick={onBack} 
          className="pointer-events-auto bg-black/30 backdrop-blur-md w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-black/40 transition"
        >
          <ChevronLeft size={22} />
        </button>
        <button 
          onClick={onEdit} 
          className="pointer-events-auto bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-semibold text-emerald-700 shadow-lg hover:bg-white transition"
        >
          编辑
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        {/* Cover Image */}
        <div className="relative h-72 w-full bg-gray-100">
          {recipe.cover ? (
             <img src={recipe.cover} className="w-full h-full object-cover" alt="cover" />
          ) : (
             <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                <ChefHat className="text-emerald-200" size={64} />
             </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6">
             <div className="flex items-center gap-2 mb-2 flex-wrap">
                {recipe.category.map((cat, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-500/90 text-white text-xs font-semibold tracking-wide backdrop-blur-sm">
                    {cat}
                  </span>
                ))}
             </div>
             <h1 className="text-3xl font-bold text-white drop-shadow-md leading-tight">
               {recipe.title}
             </h1>
          </div>
        </div>

        <div className="mt-6 px-6 space-y-8">
          
          {/* Ingredients Section */}
          <div className="space-y-3">
             <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider">
               <ShoppingBag size={14}/> 食材清单
             </div>
             
             <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
               {recipe.ingredients.map((ing, idx) => (
                 <div key={idx} className="flex items-center justify-between text-sm">
                   <span className="text-gray-800 font-medium flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                     {ing.name}
                   </span>
                   <span className="text-gray-500 font-mono">
                     {ing.amount}{ing.unit}
                   </span>
                 </div>
               ))}
               {recipe.ingredients.length === 0 && <span className="text-gray-400 text-xs">暂无食材</span>}
             </div>
          </div>

          {/* Seasonings */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider">
              <Utensils size={14}/> 所需调料
            </div>
            <div className="flex flex-wrap gap-2">
              {recipe.seasonings.map((s, i) => (
                <span key={i} className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-sm border border-gray-200">
                  {s}
                </span>
              ))}
              {recipe.seasonings.length === 0 && <span className="text-gray-400 text-sm">无需特殊调料</span>}
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
             <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider">
               <ChevronDown size={14}/> 制作步骤
             </div>
             
             <div className="space-y-6">
                {recipe.steps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold mt-0.5">
                      {index + 1}
                    </div>
                    {/* Changed from text-[15px] to text-sm to match ingredients */}
                    <p className="text-gray-800 text-sm leading-relaxed pt-0.5">
                      {step}
                    </p>
                  </div>
                ))}
                {recipe.steps.length === 0 && (
                  <div className="text-gray-400 text-sm italic">暂无制作步骤</div>
                )}
             </div>
          </div>

          {/* Link Section */}
          {recipe.link && (
            <div className="pb-10 pt-4 border-t border-gray-50">
               <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">
                 <LinkIcon size={14}/> 参考链接
               </div>
               <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl">
                 <a 
                   href={recipe.link} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex-1 text-sm text-emerald-600 hover:underline truncate"
                 >
                   {recipe.link}
                 </a>
                 <button 
                   onClick={handleCopyLink}
                   className="p-2 bg-white rounded-lg shadow-sm text-gray-500 hover:text-emerald-600 active:scale-90 transition-all"
                 >
                   {copied ? <Check size={16} className="text-emerald-500"/> : <Copy size={16}/>}
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};