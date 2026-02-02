import React, { useState } from 'react';
import { ChevronLeft, ShoppingBag, Utensils, Share, Check } from 'lucide-react';
import { Recipe, AggregatedData } from '../lib/types';

interface AggregationViewProps {
  recipes: Recipe[];
  selectedIds: number[];
  onBack: () => void;
  onClear: () => void;
}

export const AggregationView: React.FC<AggregationViewProps> = ({ recipes, selectedIds, onBack, onClear }) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const calculateAggregation = (): AggregatedData => {
    const selectedRecipes = recipes.filter(r => selectedIds.includes(r.id));
    const ingredientMap: Record<string, { name: string; amount: number; unit: string }> = {};
    
    selectedRecipes.forEach(recipe => {
      recipe.ingredients.forEach(ing => {
        // Simple key generation for aggregation
        const key = `${ing.name.trim()}_${ing.unit.trim()}`;
        if (!ingredientMap[key]) {
          ingredientMap[key] = { name: ing.name, amount: 0, unit: ing.unit };
        }
        ingredientMap[key].amount += parseFloat(ing.amount) || 0;
      });
    });

    const seasoningSet = new Set<string>();
    selectedRecipes.forEach(recipe => {
      recipe.seasonings.forEach(s => seasoningSet.add(s));
    });

    return {
      ingredients: Object.values(ingredientMap),
      seasonings: Array.from(seasoningSet),
      count: selectedRecipes.length,
      menuNames: selectedRecipes.map(r => r.title)
    };
  };

  const data = calculateAggregation();

  const toggleCheck = (name: string, unit: string) => {
    const key = `${name}_${unit}`;
    const newSet = new Set(checkedItems);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setCheckedItems(newSet);
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header - Increased top padding to pt-20 (80px) to clear Dynamic Island */}
      <div className="pt-20 pb-3 px-4 flex items-center justify-between border-b border-gray-100 bg-white/85 backdrop-blur-md sticky top-0 z-20 transition-all">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-900 flex items-center gap-1 pl-1">
          <ChevronLeft size={24}/>
          <span className="text-base font-medium">返回</span>
        </button>
        <span className="font-semibold text-gray-900 text-lg">备菜清单</span>
        <button className="w-9 h-9 flex items-center justify-center text-emerald-600 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors">
            <Share size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 pb-32">
         {/* Menu Card */}
         <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3">今日菜单</div>
            <div className="flex flex-wrap gap-2.5">
              {data.menuNames.map((name, i) => (
                <span key={i} className="text-[15px] font-medium text-gray-800 bg-white shadow-sm border border-gray-100 px-3 py-1.5 rounded-lg">
                  {name}
                </span>
              ))}
            </div>
         </div>

         {/* Ingredients List */}
         <div>
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                 <ShoppingBag className="text-emerald-600" size={20}/>
                 采购/备菜
               </h3>
               <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                 共 {data.ingredients.length} 项
               </span>
            </div>
            
            <div className="space-y-1.5">
              {data.ingredients.map((item, idx) => {
                const key = `${item.name}_${item.unit}`;
                const isChecked = checkedItems.has(key);
                
                return (
                  <div 
                    key={idx} 
                    onClick={() => toggleCheck(item.name, item.unit)}
                    className="group flex items-center gap-3 py-3 border-b border-gray-50 hover:bg-gray-50 px-2 rounded-xl transition-all cursor-pointer select-none"
                  >
                    {/* Custom Checkbox */}
                    <div className={`w-6 h-6 rounded-[6px] border-2 transition-all flex items-center justify-center ${
                      isChecked 
                        ? 'bg-emerald-500 border-emerald-500' 
                        : 'border-gray-300 group-hover:border-emerald-400 bg-white'
                    }`}>
                      <Check size={14} strokeWidth={3} className={`text-white transition-transform duration-200 ${isChecked ? 'scale-100' : 'scale-0'}`} />
                    </div>
                    
                    <span className={`flex-1 font-medium text-[15px] transition-colors ${isChecked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {item.name}
                    </span>
                    <span className={`font-mono text-sm font-semibold px-2 py-0.5 rounded transition-all ${
                      isChecked 
                        ? 'text-gray-400 bg-gray-100 line-through decoration-gray-400' 
                        : 'text-emerald-700 bg-emerald-50'
                    }`}>
                      {item.amount}{item.unit}
                    </span>
                  </div>
                );
              })}
            </div>
         </div>

         {/* Seasonings */}
         <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Utensils size={14}/>
              检查调料
            </h3>
            <div className="flex flex-wrap gap-2 text-gray-700">
               {data.seasonings.map((s, i) => (
                  <span key={i} className="bg-white border border-gray-200 px-2 py-1 rounded text-sm">
                    {s}
                  </span>
               ))}
            </div>
         </div>

         <div className="pt-4 flex justify-center">
           <button 
             onClick={onClear}
             className="text-gray-400 hover:text-red-500 text-sm font-medium transition-colors flex items-center gap-1"
           >
             清空当前选择
           </button>
         </div>
      </div>
    </div>
  );
};