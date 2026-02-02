import React, { useState } from 'react';
import { FileText, Camera, Plus, X, ChevronLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { Recipe } from '../lib/types';

interface ImportSheetProps {
  onClose: () => void;
  onRecipeCreated: (recipe: Recipe) => void;
}

type ViewState = 'menu' | 'input' | 'loading' | 'error';

export const ImportSheet: React.FC<ImportSheetProps> = ({ onClose, onRecipeCreated }) => {
  const [view, setView] = useState<ViewState>('menu');
  const [inputText, setInputText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Call backend API to parse text with Gemini
  const handleSimulateAI = async () => {
    setView('loading');
    setErrorMessage('');
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Please parse the following text into a structured recipe. 
          Extract the title, ingredients, seasonings, and cooking steps.
          If the category is not clear, default to "家常菜".
          Return ONLY valid JSON (no markdown code blocks).
          
          Text to parse:
          ${inputText}`
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to parse recipe');
      }

      const data = await response.json();
      const jsonStr = data.text;
      
      if (jsonStr) {
        let parsed;
        try {
          parsed = JSON.parse(jsonStr);
        } catch {
          // Try to extract JSON from the response if it's wrapped in code blocks
          const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('Failed to extract JSON from response');
          }
        }
        
        const newDraft: Recipe = {
          id: Date.now(),
          title: parsed.title || 'AI识别食谱',
          category: parsed.category && parsed.category.length > 0 ? parsed.category : ['家常菜'],
          cover: '',
          ingredients: parsed.ingredients || [],
          seasonings: parsed.seasonings || [],
          steps: parsed.steps || [],
          link: '' 
        };
        
        onRecipeCreated(newDraft);
      } else {
        throw new Error("Empty response from AI");
      }

    } catch (error: any) {
      console.error("AI Parsing failed:", error);
      setErrorMessage(error.message || "AI解析失败，请检查网络或重试。");
      setView('error');
    }
  };

  const handleManualCreate = () => {
      const emptyRecipe: Recipe = {
          id: Date.now(),
          category: ['家常菜'],
          title: '',
          ingredients: [],
          seasonings: [],
          steps: [],
          cover: ''
      };
      onRecipeCreated(emptyRecipe);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-t-[32px] p-6 pb-10 animate-in slide-in-from-bottom-full duration-300 shadow-2xl relative min-h-[400px]"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
        
        {/* Header with Close/Back */}
        <div className="flex justify-between items-center mb-6 px-1">
            {(view === 'input' || view === 'error') ? (
               <button onClick={() => setView('menu')} className="p-1 -ml-2 text-gray-500 flex items-center gap-1">
                 <ChevronLeft size={20}/> 返回
               </button>
            ) : (
               <h2 className="text-xl font-bold text-gray-900">
                 {view === 'loading' ? '正在处理' : '添加新食谱'}
               </h2>
            )}
            <button onClick={onClose} className="p-1 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
              <X size={16}/>
            </button>
        </div>

        {view === 'menu' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button 
              onClick={() => setView('input')}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors text-left group active:scale-[0.98]"
            >
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-700 group-hover:text-emerald-600 transition-colors">
                <FileText size={24} />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg">粘贴文本</div>
                <div className="text-sm text-gray-400">自动解析食材与步骤</div>
              </div>
            </button>

            <button 
              disabled
              className="w-full flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl text-left cursor-not-allowed opacity-60 grayscale"
            >
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400">
                <Camera size={24} />
              </div>
              <div>
                <div className="font-bold text-gray-500 text-lg">拍照识别 <span className="text-xs font-normal border border-gray-300 rounded px-1 ml-1">开发中</span></div>
                <div className="text-sm text-gray-400">支持截图或纸质菜单</div>
              </div>
            </button>
            
            <div className="pt-4">
              <button 
                 onClick={handleManualCreate}
                 className="w-full py-4 text-center text-gray-500 text-sm font-semibold hover:text-emerald-700 bg-white border border-gray-100 rounded-xl shadow-sm active:bg-gray-50"
              >
                手动创建空白食谱
              </button>
            </div>
          </div>
        )}

        {(view === 'input' || view === 'error') && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
             {view === 'error' && (
               <div className="p-3 bg-red-50 text-red-600 rounded-xl flex items-start gap-2 text-sm">
                 <AlertCircle size={16} className="mt-0.5 shrink-0"/>
                 {errorMessage}
               </div>
             )}
             <textarea 
               className="w-full h-40 bg-gray-50 rounded-xl p-4 text-gray-800 text-base border-none focus:ring-2 focus:ring-emerald-500/20 resize-none placeholder:text-gray-400"
               placeholder="请粘贴菜谱文本，例如：&#10;番茄炒蛋&#10;食材：鸡蛋3个，番茄2个...&#10;步骤：1. 鸡蛋炒熟..."
               value={inputText}
               onChange={e => setInputText(e.target.value)}
               autoFocus={view !== 'error'}
             />
             <button 
               onClick={handleSimulateAI}
               disabled={!inputText.trim()}
               className="w-full py-4 bg-emerald-600 disabled:bg-emerald-300 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
             >
               {view === 'error' ? '重试' : '去识别'} <ArrowRight size={20}/>
             </button>
          </div>
        )}

        {view === 'loading' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            <p className="text-gray-600 text-sm">正在处理中...</p>
          </div>
        )}

      </div>
    </div>
  );
};