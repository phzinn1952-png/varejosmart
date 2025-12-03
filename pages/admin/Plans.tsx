import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Check, Edit, X, DollarSign, Users, Package, Layers, CheckCircle, Plus, Trash2, AlertCircle } from 'lucide-react';
import { PlanConfig } from '../../types';

const Plans: React.FC = () => {
  const { plans, updatePlan, addPlan, deletePlan } = useAppContext();
  const plansList = Object.values(plans) as PlanConfig[];
  
  const [editingPlan, setEditingPlan] = useState<PlanConfig | null>(null);
  const [isNewPlan, setIsNewPlan] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleCreateNew = () => {
      const newId = `plan_${Date.now()}`;
      setEditingPlan({
          id: newId,
          name: 'Novo Plano',
          productLimit: 100,
          userLimit: 1,
          implementationFee: 0,
          supportFee: 0,
          features: ['Suporte Básico']
      });
      setIsNewPlan(true);
  };

  const handleEdit = (plan: PlanConfig) => {
    setEditingPlan(plan);
    setIsNewPlan(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlan) {
      if (isNewPlan) {
          addPlan(editingPlan);
      } else {
          updatePlan(editingPlan);
      }
      setEditingPlan(null);
      setIsNewPlan(false);
    }
  };

  const handleDelete = (id: string) => {
      deletePlan(id);
      setDeleteConfirmId(null);
  };

  const handleAddFeature = () => {
      if (editingPlan) {
          setEditingPlan({
              ...editingPlan,
              features: [...editingPlan.features, 'Nova funcionalidade']
          });
      }
  };

  const handleFeatureChange = (index: number, value: string) => {
      if (editingPlan) {
          const newFeatures = [...editingPlan.features];
          newFeatures[index] = value;
          setEditingPlan({ ...editingPlan, features: newFeatures });
      }
  };

  const handleRemoveFeature = (index: number) => {
      if (editingPlan) {
          const newFeatures = editingPlan.features.filter((_, i) => i !== index);
          setEditingPlan({ ...editingPlan, features: newFeatures });
      }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
       <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Planos e Tarifas</h1>
                <p className="text-slate-500 text-sm">Configure as ofertas comerciais do sistema</p>
            </div>
            <button 
                onClick={handleCreateNew}
                className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 flex items-center gap-2 font-medium shadow-lg shadow-emerald-900/10 active:scale-95 transition-all"
            >
                <Plus size={20} /> Criar Novo Plano
            </button>
       </div>

       {plansList.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
               <Layers size={48} className="mx-auto text-slate-300 mb-4" />
               <h3 className="text-lg font-bold text-slate-700">Nenhum plano cadastrado</h3>
               <p className="text-slate-500 max-w-sm mx-auto mt-2">Crie planos para começar a cadastrar empresas no sistema.</p>
               <button 
                onClick={handleCreateNew}
                className="mt-6 text-emerald-600 font-bold hover:underline"
               >
                   Criar o primeiro plano
               </button>
           </div>
       ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {plansList.map(plan => (
                   <div key={plan.id} className="relative bg-white rounded-2xl shadow-lg border-2 border-slate-100 flex flex-col hover:border-emerald-200 transition-colors group">
                       <div className="p-8 flex-1">
                           <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
                                <button 
                                    onClick={() => setDeleteConfirmId(plan.id)}
                                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                >
                                    <Trash2 size={18} />
                                </button>
                           </div>
                           
                           <div className="mt-4 flex items-baseline">
                               <span className="text-4xl font-extrabold text-slate-900">R$ {plan.supportFee.toFixed(2)}</span>
                               <span className="ml-1 text-slate-500 font-medium">/mês</span>
                           </div>
                           
                           <div className="mt-6 space-y-4">
                               <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600 border border-slate-200">
                                   <div className="flex justify-between mb-1">
                                       <span>Taxa de Implantação:</span>
                                       <span className="font-semibold text-slate-800">R$ {plan.implementationFee.toFixed(2)}</span>
                                   </div>
                               </div>

                               <ul className="space-y-3">
                                   <li className="flex items-center text-slate-600 text-sm">
                                       <Check size={16} className="text-emerald-500 mr-2 flex-shrink-0" />
                                       {plan.productLimit === -1 ? 'Produtos Ilimitados' : `Até ${plan.productLimit} Produtos`}
                                   </li>
                                   <li className="flex items-center text-slate-600 text-sm">
                                       <Check size={16} className="text-emerald-500 mr-2 flex-shrink-0" />
                                       {plan.userLimit} Logins de Usuário
                                   </li>
                                   {plan.features.map((feat, idx) => (
                                       <li key={idx} className="flex items-center text-slate-600 text-sm">
                                            <Check size={16} className="text-emerald-500 mr-2 flex-shrink-0" />
                                            {feat}
                                       </li>
                                   ))}
                               </ul>
                           </div>
                       </div>

                       <div className="p-6 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
                           <button 
                             onClick={() => handleEdit(plan)}
                             className="w-full py-2.5 rounded-xl font-semibold border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                           >
                               <Edit size={16} /> Editar Plano
                           </button>
                       </div>
                   </div>
               ))}
           </div>
       )}

       {/* Edit/Create Plan Modal */}
       {editingPlan && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm animate-fade-in">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                 <div className="flex justify-between items-center p-6 bg-emerald-600 text-white rounded-t-2xl sticky top-0 z-10">
                     <div className="flex items-center gap-3">
                         <div className="p-2 bg-white/20 rounded-lg">
                             <Layers size={20} />
                         </div>
                         <div>
                             <h2 className="text-lg font-bold">{isNewPlan ? 'Criar Novo Plano' : `Editar ${editingPlan.name}`}</h2>
                         </div>
                     </div>
                     <button onClick={() => setEditingPlan(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                         <X size={20} />
                     </button>
                 </div>

                 <form onSubmit={handleSave} className="p-6 space-y-6">
                     <div className="space-y-4">
                         <div className="space-y-1">
                             <label className="text-sm font-semibold text-slate-700">Nome do Plano</label>
                             <input 
                                 type="text" 
                                 className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
                                 value={editingPlan.name}
                                 onChange={e => setEditingPlan({...editingPlan, name: e.target.value})}
                                 placeholder="Ex: Plano Master"
                                 required
                             />
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">Implantação (R$)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input 
                                        type="number" step="0.01"
                                        className="w-full pl-8 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
                                        value={editingPlan.implementationFee}
                                        onChange={e => setEditingPlan({...editingPlan, implementationFee: parseFloat(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">Taxa Suporte (R$)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input 
                                        type="number" step="0.01"
                                        className="w-full pl-8 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-bold"
                                        value={editingPlan.supportFee}
                                        onChange={e => setEditingPlan({...editingPlan, supportFee: parseFloat(e.target.value)})}
                                    />
                                </div>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                             <div className="space-y-1">
                                 <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                     <Package size={14} className="text-emerald-500" /> Limite Produtos
                                 </label>
                                 <input 
                                     type="number"
                                     className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 text-center"
                                     value={editingPlan.productLimit}
                                     placeholder="-1 para ilimitado"
                                     onChange={e => setEditingPlan({...editingPlan, productLimit: parseInt(e.target.value)})}
                                 />
                                 <p className="text-[10px] text-slate-400 text-center">-1 = Ilimitado</p>
                             </div>
                             <div className="space-y-1">
                                 <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                     <Users size={14} className="text-emerald-500" /> Limite Usuários
                                 </label>
                                 <input 
                                     type="number"
                                     className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 text-center"
                                     value={editingPlan.userLimit}
                                     onChange={e => setEditingPlan({...editingPlan, userLimit: parseInt(e.target.value)})}
                                 />
                             </div>
                         </div>

                         <div className="space-y-2 pt-2 border-t border-slate-100">
                             <label className="text-sm font-semibold text-slate-700 block">Funcionalidades</label>
                             {editingPlan.features.map((feat, index) => (
                                 <div key={index} className="flex gap-2 items-center">
                                     <input 
                                        type="text"
                                        className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-slate-400"
                                        value={feat}
                                        onChange={e => handleFeatureChange(index, e.target.value)}
                                        placeholder="Ex: Suporte 24h"
                                     />
                                     <button 
                                        type="button" 
                                        onClick={() => handleRemoveFeature(index)}
                                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                     >
                                         <X size={18} />
                                     </button>
                                 </div>
                             ))}
                             <button 
                                type="button" 
                                onClick={handleAddFeature}
                                className="text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1 mt-2 px-1"
                             >
                                 <Plus size={16} /> Adicionar Funcionalidade
                             </button>
                         </div>
                     </div>

                     <div className="flex justify-end gap-3 pt-2">
                         <button 
                             type="button" 
                             onClick={() => setEditingPlan(null)}
                             className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium"
                         >
                             Cancelar
                         </button>
                         <button 
                             type="submit" 
                             className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-900/10 flex items-center gap-2"
                         >
                             <CheckCircle size={18} /> Salvar
                         </button>
                     </div>
                 </form>
             </div>
         </div>
       )}

       {/* Delete Confirmation */}
       {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="text-red-500" size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Plano?</h3>
                <p className="text-slate-500 text-sm mb-6">
                    Isso pode afetar empresas que utilizam este plano. Tem certeza?
                </p>
                <div className="flex gap-3 justify-center">
                    <button 
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={() => handleDelete(deleteConfirmId)}
                        className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 shadow-lg"
                    >
                        Excluir
                    </button>
                </div>
             </div>
        </div>
       )}
    </div>
  );
};

export default Plans;