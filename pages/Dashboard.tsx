import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle, Sparkles, Loader2, ArrowRight, BellRing } from 'lucide-react';
import { getBusinessInsight } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const { getDashboardStats, products, sales } = useAppContext();
  const stats = getDashboardStats();
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  const handleGetInsight = async () => {
    setLoadingInsight(true);
    const result = await getBusinessInsight(sales, products, 'SALES_ANALYSIS');
    setInsight(result);
    setLoadingInsight(false);
  };

  const handleStockAdvice = async () => {
      setLoadingInsight(true);
      const result = await getBusinessInsight(sales, products, 'STOCK_ADVICE');
      setInsight(result);
      setLoadingInsight(false);
  }

  // Green/Teal Palette
  const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Painel de Controle</h1>
            <p className="text-slate-500 text-sm">Visão geral do seu negócio em tempo real</p>
        </div>
        <div className="flex flex-wrap gap-2">
            <button 
                onClick={handleGetInsight}
                disabled={loadingInsight}
                className="flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md disabled:opacity-50 active:scale-95 text-sm font-medium"
            >
                {loadingInsight ? <Loader2 className="animate-spin mr-2" size={16}/> : <Sparkles className="mr-2" size={16}/>}
                Análise de Vendas IA
            </button>
            <button 
                onClick={handleStockAdvice}
                disabled={loadingInsight}
                className="flex items-center px-4 py-2.5 bg-white text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-all disabled:opacity-50 text-sm font-medium"
            >
                Gestão de Estoque
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Vendas Totais</p>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                {stats.totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Transações</p>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{stats.transactionCount}</h3>
            </div>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl group-hover:scale-110 transition-transform">
              <ShoppingBag size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Ticket Médio</p>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                {stats.averageTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </h3>
            </div>
            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        {/* Critical Stock Card with Animation */}
        <div className={`relative bg-white p-6 rounded-xl shadow-sm border transition-all group ${lowStockCount > 0 ? 'border-red-200 shadow-red-100 ring-1 ring-red-100' : 'border-slate-200 hover:shadow-md'}`}>
          {lowStockCount > 0 && (
             <span className="absolute top-3 right-3 flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
             </span>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium mb-1 ${lowStockCount > 0 ? 'text-red-600' : 'text-slate-500'}`}>Estoque Crítico</p>
              <h3 className={`text-2xl font-bold tracking-tight ${lowStockCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                {lowStockCount} itens
              </h3>
              {lowStockCount > 0 && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1 animate-pulse">Ação Necessária!</p>
              )}
            </div>
            <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform ${lowStockCount > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}>
               {lowStockCount > 0 ? (
                   <BellRing size={24} className="animate-[wiggle_1s_ease-in-out_infinite]" />
               ) : (
                   <AlertTriangle size={24} />
               )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insight Section */}
      {insight && (
        <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-xl border border-emerald-100 shadow-sm animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={100} className="text-emerald-500" />
          </div>
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <div className="p-2 bg-white rounded-lg shadow-sm">
                <Sparkles className="text-emerald-600" size={20} />
            </div>
            <h3 className="font-bold text-emerald-900">Insight Gerado por Gemini IA</h3>
          </div>
          <div className="prose prose-sm max-w-none text-slate-700 relative z-10">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-transparent border-none p-0">
                {insight}
            </pre>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-bold text-slate-800">Top Produtos Vendidos</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#ecfdf5'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {stats.topProducts.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Atividade Recente</h3>
          <div className="flex-1 overflow-auto space-y-3 custom-scrollbar">
            {sales.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                    <p className="text-sm">Nenhuma venda registrada.</p>
                </div>
            ) : (
                sales.slice().reverse().slice(0, 5).map((sale) => (
                <div key={sale.id} className="group flex items-center justify-between p-3.5 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-100 hover:border-emerald-100 transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold">
                            #{sale.items.length}
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800 text-sm">
                                Venda #{sale.id.slice(0, 4)}
                            </p>
                            <p className="text-xs text-slate-500">
                                {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                    <span className="font-bold text-emerald-600 text-sm">
                    {sale.finalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                </div>
                ))
            )}
          </div>
          <button className="mt-4 w-full py-2 text-sm text-emerald-600 font-medium hover:bg-emerald-50 rounded-lg transition-colors flex items-center justify-center gap-1">
              Ver histórico completo <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;