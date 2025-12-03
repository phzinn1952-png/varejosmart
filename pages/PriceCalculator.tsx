
import React, { useState, useMemo } from 'react';
import { Calculator, Plus, Trash2, DollarSign, Scale, ChefHat, Info, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  packagePrice: number;
  packageWeight: number; // in grams/ml
  usedWeight: number; // in grams/ml
}

const PriceCalculator: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', name: 'Farinha de Trigo', packagePrice: 25.00, packageWeight: 5000, usedWeight: 1000 },
    { id: '2', name: 'Peito de Frango', packagePrice: 18.00, packageWeight: 1000, usedWeight: 500 },
  ]);

  const [yieldAmount, setYieldAmount] = useState(50); // Quantidade rendida (unidades)
  const [markup, setMarkup] = useState(100); // Margem de lucro (%)
  const [operationalCostPct, setOperationalCostPct] = useState(10); // Gás, Luz, Embalagem (%)

  const [newIngredient, setNewIngredient] = useState({
      name: '',
      packagePrice: '',
      packageWeight: '',
      usedWeight: ''
  });

  const addIngredient = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newIngredient.name || !newIngredient.packagePrice) return;

      setIngredients([
          ...ingredients,
          {
              id: crypto.randomUUID(),
              name: newIngredient.name,
              packagePrice: parseFloat(newIngredient.packagePrice),
              packageWeight: parseFloat(newIngredient.packageWeight) || 1000,
              usedWeight: parseFloat(newIngredient.usedWeight) || 100
          }
      ]);
      setNewIngredient({ name: '', packagePrice: '', packageWeight: '', usedWeight: '' });
  };

  const removeIngredient = (id: string) => {
      setIngredients(ingredients.filter(i => i.id !== id));
  };

  // Calculations
  const calculations = useMemo(() => {
      // Custo de cada ingrediente usado
      const ingredientsCost = ingredients.reduce((acc, item) => {
          if (item.packageWeight === 0) return acc;
          const costPerGram = item.packagePrice / item.packageWeight;
          return acc + (costPerGram * item.usedWeight);
      }, 0);

      // Custo com operacionais (Gás, Luz, Embalagem)
      const operationalCost = ingredientsCost * (operationalCostPct / 100);
      const totalRecipeCost = ingredientsCost + operationalCost;

      // Custo unitário
      const unitCost = yieldAmount > 0 ? totalRecipeCost / yieldAmount : 0;

      // Preço de venda sugerido
      const suggestedPrice = unitCost * (1 + markup / 100);
      const profitPerUnit = suggestedPrice - unitCost;

      return {
          ingredientsCost,
          operationalCost,
          totalRecipeCost,
          unitCost,
          suggestedPrice,
          profitPerUnit
      };
  }, [ingredients, yieldAmount, markup, operationalCostPct]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
       <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Calculator className="text-emerald-600" /> Calculadora de Preços
            </h1>
            <p className="text-slate-500 text-sm">Engenharia de cardápio para salgados e produtos de produção própria.</p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Left Col: Ingredients */}
           <div className="lg:col-span-2 space-y-6">
                
                {/* Add Form */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Plus size={18} className="text-emerald-600"/> Adicionar Ingrediente
                    </h3>
                    <form onSubmit={addIngredient} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-xs font-bold text-slate-700">Ingrediente</label>
                            <input 
                                type="text" 
                                placeholder="Ex: Farinha de Trigo"
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 placeholder-slate-400"
                                value={newIngredient.name}
                                onChange={e => setNewIngredient({...newIngredient, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Preço Pacote</label>
                            <input 
                                type="number" step="0.01" 
                                placeholder="R$ 0,00"
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 placeholder-slate-400"
                                value={newIngredient.packagePrice}
                                onChange={e => setNewIngredient({...newIngredient, packagePrice: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Peso Pacote (g)</label>
                            <input 
                                type="number" 
                                placeholder="Ex: 5000"
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 placeholder-slate-400"
                                value={newIngredient.packageWeight}
                                onChange={e => setNewIngredient({...newIngredient, packageWeight: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Usado (g)</label>
                            <input 
                                type="number" 
                                placeholder="Ex: 1000"
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 placeholder-slate-400"
                                value={newIngredient.usedWeight}
                                onChange={e => setNewIngredient({...newIngredient, usedWeight: e.target.value})}
                            />
                        </div>
                        <button className="md:col-span-5 w-full bg-emerald-600 text-white font-bold py-2.5 rounded-lg hover:bg-emerald-700 transition-colors shadow-md mt-2 md:mt-0 flex items-center justify-center gap-2">
                            <Plus size={18} /> Adicionar à Receita
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <ChefHat size={18} className="text-slate-500"/> Ingredientes da Receita
                        </h3>
                        <span className="text-sm font-semibold text-slate-500">{ingredients.length} itens</span>
                    </div>
                    
                    {ingredients.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            Adicione ingredientes para calcular o custo.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {ingredients.map(item => {
                                const cost = (item.packagePrice / item.packageWeight) * item.usedWeight;
                                return (
                                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800">{item.name}</p>
                                            <p className="text-xs text-slate-500">
                                                Pacote: R$ {item.packagePrice.toFixed(2)} ({item.packageWeight}g) • Usado: <span className="text-emerald-600 font-bold">{item.usedWeight}g</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-bold text-slate-700">R$ {cost.toFixed(2)}</p>
                                                <p className="text-xs text-slate-400">Custo</p>
                                            </div>
                                            <button 
                                                onClick={() => removeIngredient(item.id)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div className="p-4 bg-emerald-50 border-t border-emerald-100 flex justify-between items-center">
                        <span className="text-sm font-bold text-emerald-800">Total Ingredientes</span>
                        <span className="text-lg font-bold text-emerald-700">R$ {calculations.ingredientsCost.toFixed(2)}</span>
                    </div>
                </div>

           </div>

           {/* Right Col: Configuration & Results */}
           <div className="space-y-6">
               
               {/* Config Card */}
               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                   <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Configuração da Produção</h3>
                   
                   <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-800 flex justify-between">
                           <span>Custos Operacionais Extras</span>
                           <span className="text-emerald-700">{operationalCostPct}%</span>
                       </label>
                       <input 
                            type="range" min="0" max="50" step="1"
                            className="w-full accent-emerald-600"
                            value={operationalCostPct}
                            onChange={e => setOperationalCostPct(parseInt(e.target.value))}
                       />
                       <p className="text-xs text-slate-500 flex gap-1 font-medium">
                           <Info size={12} className="mt-0.5"/> Gás, Luz, Água, Detergente, Embalagem.
                       </p>
                   </div>

                   <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-800">Rendimento da Receita (Unidades)</label>
                       <div className="relative">
                           <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                           <input 
                                type="number" 
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-900"
                                value={yieldAmount}
                                onChange={e => setYieldAmount(parseInt(e.target.value) || 1)}
                           />
                       </div>
                   </div>

                   <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-800">Margem de Lucro Desejada (%)</label>
                       <div className="relative">
                           <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" size={18} />
                           <input 
                                type="number" 
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-700"
                                value={markup}
                                onChange={e => setMarkup(parseFloat(e.target.value) || 0)}
                           />
                       </div>
                   </div>
               </div>

               {/* Results Card */}
               <div className="bg-emerald-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-6 opacity-10">
                       <DollarSign size={100} />
                   </div>
                   
                   <div className="relative z-10 space-y-6">
                        <div>
                            <p className="text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">Custo Total da Produção</p>
                            <p className="text-2xl font-bold">R$ {calculations.totalRecipeCost.toFixed(2)}</p>
                            <p className="text-xs text-emerald-400 mt-1">Incluindo +{operationalCostPct}% custos extras</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-emerald-800 pt-4">
                            <div>
                                <p className="text-emerald-300 text-xs font-semibold mb-1">Custo Unitário</p>
                                <p className="text-xl font-bold">R$ {calculations.unitCost.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-emerald-300 text-xs font-semibold mb-1">Lucro p/ Un.</p>
                                <p className="text-xl font-bold text-emerald-400">R$ {calculations.profitPerUnit.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-emerald-500/30">
                            <p className="text-emerald-200 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                                <CheckCircle size={14} /> Preço de Venda Sugerido
                            </p>
                            <p className="text-3xl font-extrabold text-white tracking-tight">
                                R$ {calculations.suggestedPrice.toFixed(2)}
                            </p>
                        </div>
                   </div>
               </div>

               <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex gap-3">
                   <AlertCircle className="text-orange-500 shrink-0" size={20} />
                   <div>
                       <h4 className="text-sm font-bold text-orange-800">Dica Importante</h4>
                       <p className="text-xs text-orange-800/80 mt-1 leading-relaxed font-medium">
                           Sempre pese os ingredientes crus. Lembre-se que o óleo da fritura deve entrar nos custos operacionais ou como ingrediente estimado.
                       </p>
                   </div>
               </div>

           </div>
       </div>
    </div>
  );
};

export default PriceCalculator;
