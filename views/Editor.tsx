import React, { useState, useRef } from 'react';
import { Tag, ShoppingBag, Utensils, X, Plus, ChevronDown, Camera, Trash2, Link as LinkIcon } from 'lucide-react';
import { Recipe } from '../types';

interface EditorViewProps {
  initialRecipe: Recipe;
  categories: string[];
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
}

export const EditorView: React.FC<EditorViewProps> = ({ initialRecipe, categories, onSave, onCancel }) => {
  const [form, setForm] = useState<Recipe>(initialRecipe);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ingredient Helpers
  const updateIngredient = (idx: number, field: keyof typeof form.ingredients[0], val: string) => {
    const newIng = [...form.ingredients];
    newIng[idx] = { ...newIng[idx], [field]: val };
    setForm({ ...form, ingredients: newIng });
  };

  const removeIngredient = (idx: number) => {
    setForm({ ...form, ingredients: form.ingredients.filter((_, i) => i !== idx) });
  };

  // Step Helpers
  const updateStep = (idx: number, val: string) => {
    const newSteps = [...form.steps];
    newSteps[idx] = val;
    setForm({ ...form, steps: newSteps });
  };

  const removeStep = (idx: number) => {
    setForm({ ...form, steps: form.steps.filter((_, i) => i !== idx) });
  };

  const addStep = () => {
    setForm({ ...form, steps: [...form.steps, ''] });
  };

  // Category Logic: Multi-select
  // Real-time update: We merge global categories with any local ones attached to this recipe
  const allDisplayCategories = Array.from(new Set([...categories, ...form.category]));

  const toggleCategory = (cat: string) => {
    if (form.category.includes(cat)) {
      setForm({ ...form, category: form.category.filter(c => c !== cat) });
    } else {
      setForm({ ...form, category: [...form.category, cat] });
    }
  };

  const handleCreateCategory = () => {
    if (newCategoryInput.trim()) {
      const newCat = newCategoryInput.trim();
      if (!form.category.includes(newCat)) {
         setForm({ ...form, category: [...form.category, newCat] });
      }
      setNewCategoryInput('');
      setShowCategoryInput(false);
    }
  };

  // Image Upload Logic
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setForm({ ...form, cover: url });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative animate-in slide-in-from-bottom-10 duration-300">
      {/* Transparent Overlay Header - Increased top padding to pt-16 (64px) */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 pt-16 flex justify-between items-center pointer-events-none">
        <button 
          onClick={onCancel} 
          className="pointer-events-auto bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium text-white hover:bg-black/40 transition"
        >
          取消
        </button>
        <button 
          onClick={() => onSave(form)} 
          className="pointer-events-auto bg-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-lg hover:bg-emerald-700 transition"
        >
          完成
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 no-scrollbar">
        {/* Cover Image */}
        <div className="group relative h-64 w-full bg-gray-100 overflow-hidden">
          {form.cover ? (
            <img src={form.cover} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
               <Camera size={48} className="text-gray-300"/>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
          
          {/* Edit Image Button */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-full flex items-center gap-2 font-medium">
              <Camera size={18} />
              {form.cover ? '更换封面' : '上传封面'}
            </div>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>

        <div className="mt-8 px-6 space-y-8">
          {/* Title Section */}
          <div className="space-y-4">
            <input 
              className="w-full text-3xl font-bold text-gray-900 placeholder:text-gray-300 border-none focus:ring-0 p-0 bg-transparent"
              placeholder="输入菜谱名称"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
            />
            
            {/* Category Selector */}
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1.5 w-20 shrink-0">
                <Tag size={14}/> 菜品分类
              </div>
              
              <div className="flex flex-wrap gap-2 flex-1">
                {allDisplayCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1 rounded text-sm border transition-all flex items-center gap-1 ${
                      form.category.includes(cat)
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-medium' 
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {cat}
                    {form.category.includes(cat) && <X size={12} className="opacity-50 hover:opacity-100"/>}
                  </button>
                ))}
                
                {/* Manual Creation Input */}
                {showCategoryInput ? (
                  <div className="flex items-center gap-1 bg-gray-50 rounded px-2 border border-emerald-500">
                    <input 
                      autoFocus
                      placeholder="新建..."
                      className="w-24 py-1 text-sm border-none focus:ring-0 bg-transparent p-0 text-gray-800"
                      value={newCategoryInput}
                      onChange={e => setNewCategoryInput(e.target.value)}
                      onBlur={handleCreateCategory}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleCreateCategory();
                        }
                      }}
                    />
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowCategoryInput(true)}
                    className="px-2 py-1 rounded text-sm border border-dashed border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 flex items-center gap-1 transition-colors"
                  >
                    <Plus size={14}/> 新建
                  </button>
                )}
              </div>
            </div>
          </div>

          <hr className="border-gray-100"/>

          {/* Ingredients Section */}
          <div className="space-y-1">
             <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">
               <ShoppingBag size={14}/> 食材清单
             </div>
             
             <div className="bg-gray-50/50 rounded-xl p-2 border border-gray-100/50 space-y-1">
               {form.ingredients.map((ing, idx) => (
                 <div key={idx} className="flex items-center gap-2 group hover:bg-white rounded-lg p-1 transition-colors">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-2" />
                   <input 
                     value={ing.name} 
                     onChange={e => updateIngredient(idx, 'name', e.target.value)}
                     placeholder="食材名" 
                     className="flex-1 border-none focus:ring-0 text-sm bg-transparent text-gray-800 placeholder:text-gray-300"
                   />
                   <div className="h-4 w-[1px] bg-gray-200"/>
                   <input 
                     value={ing.amount} 
                     onChange={e => updateIngredient(idx, 'amount', e.target.value)}
                     placeholder="数量" 
                     className="w-16 text-right border-none focus:ring-0 text-sm bg-transparent text-gray-600 placeholder:text-gray-300"
                   />
                   <input 
                     value={ing.unit} 
                     onChange={e => updateIngredient(idx, 'unit', e.target.value)}
                     placeholder="单位" 
                     className="w-12 text-right border-none focus:ring-0 text-sm text-gray-500 bg-transparent placeholder:text-gray-300"
                   />
                   <button onClick={() => removeIngredient(idx)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 p-1">
                      <X size={14}/>
                   </button>
                 </div>
               ))}
               <button 
                 onClick={() => setForm({ ...form, ingredients: [...form.ingredients, { name: '', amount: '', unit: '' }] })}
                 className="w-full text-left text-xs text-gray-400 hover:text-emerald-600 flex items-center gap-2 py-2 px-4 transition-colors"
               >
                 <Plus size={14}/> 添加一行食材
               </button>
             </div>
          </div>

          {/* Seasonings */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">
              <Utensils size={14}/> 所需调料
            </div>
            <div className="flex flex-wrap gap-2">
              {form.seasonings.map((s, i) => (
                <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-sm border border-gray-200">
                  {s}
                  <button 
                    onClick={() => setForm({...form, seasonings: form.seasonings.filter((_, idx) => idx !== i)})}
                    className="ml-1.5 text-gray-400 hover:text-red-500"
                  >
                    <X size={12}/>
                  </button>
                </span>
              ))}
              <input 
                placeholder="+ 调料 (回车)"
                className="bg-transparent text-sm text-gray-900 font-medium min-w-[100px] focus:ring-0 border-none p-0 px-2 py-1 placeholder:text-gray-300 hover:placeholder:text-gray-400"
                onKeyDown={(e) => {
                   if(e.key === 'Enter') {
                      const val = e.currentTarget.value.trim();
                      if (val) {
                        setForm({...form, seasonings: [...form.seasonings, val]});
                        e.currentTarget.value = '';
                      }
                   }
                }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="pb-4">
             <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">
               <ChevronDown size={14}/> 制作步骤
             </div>
             
             <div className="space-y-3">
               {form.steps.map((step, idx) => (
                 <div key={idx} className="flex gap-2 items-start group">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold mt-1">
                      {idx + 1}
                    </div>
                    {/* Changed from text-[15px] to text-sm */}
                    <textarea 
                      className="flex-1 bg-gray-50 rounded-lg p-3 text-sm leading-relaxed border-transparent focus:border-emerald-300 focus:bg-white focus:ring-0 transition-all resize-none overflow-hidden min-h-[60px] text-gray-900"
                      placeholder={`步骤 ${idx + 1}...`}
                      value={step}
                      onChange={e => {
                        updateStep(idx, e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      onFocus={e => {
                         e.target.style.height = 'auto';
                         e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                    />
                    <button 
                      onClick={() => removeStep(idx)}
                      className="mt-2 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16}/>
                    </button>
                 </div>
               ))}
               
               <button 
                 onClick={addStep}
                 className="w-full py-3 flex items-center justify-center gap-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-xl border border-dashed border-gray-200 transition-all text-sm font-medium"
               >
                 <Plus size={16}/> 添加步骤
               </button>
             </div>
          </div>

          {/* Link Section */}
          <div className="pb-10 pt-2 border-t border-gray-50">
             <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">
               <LinkIcon size={14}/> 菜谱链接 (选填)
             </div>
             <input 
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800 border-none focus:ring-1 focus:ring-emerald-500 placeholder:text-gray-300"
                placeholder="粘贴小红书、B站等分享链接..."
                value={form.link || ''}
                onChange={e => setForm({...form, link: e.target.value})}
             />
          </div>

        </div>
      </div>
    </div>
  );
};