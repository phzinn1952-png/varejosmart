import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Wallet, TrendingUp, AlertCircle, Calendar, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminFinancial: React.FC = () => {
  const { tenants } = useAppContext();

  // Mock Financial Data derived from tenants
  const totalMRR = tenants.reduce((acc, t) => t.status === 'Active' ? acc + t.monthlyFee : acc, 0);
  const totalActive = tenants.filter(t => t.status === 'Active').length;
  const overdueCount = tenants.filter(t => t.status === 'Blocked' || new Date(t.nextBilling) < new Date()).length;

  // Gerar dados dinâmicos para o gráfico (Últimos 6 meses baseados na data atual)
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();

    // Loop para os últimos 6 meses (incluindo o atual)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      
      // Nome do mês (Ex: Nov)
      const monthName = d.toLocaleString('pt-BR', { month: 'short' });
      // Capitalizar (nov -> Nov)
      const formattedName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      
      // Data limite para considerar um tenant ativo neste mês
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      // Calcular receita deste mês histórico
      // Soma as mensalidades de tenants que foram criados ANTES do fim deste mês e estão Ativos
      const monthlyRevenue = tenants.reduce((acc, tenant) => {
        const joinedAt = new Date(tenant.joinedAt);
        // Lógica simplificada: Se o tenant entrou antes do fim deste mês e está ativo hoje
        // Num sistema real com backend, teríamos uma tabela de pagamentos históricos
        if (tenant.status === 'Active' && joinedAt <= endOfMonth) {
          return acc + tenant.monthlyFee;
        }
        return acc;
      }, 0);

      data.push({
        name: formattedName,
        receita: monthlyRevenue,
        fullDate: d // Usado para ordenação se necessário
      });
    }
    return data;
  }, [tenants]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Financeiro SaaS</h1>
            <p className="text-slate-500 text-sm">Visão geral da receita de assinaturas</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-emerald-200 text-emerald-700 rounded-xl hover:bg-emerald-50 text-sm font-medium transition-colors shadow-sm">
            <Download size={18} /> Exportar Relatório
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-lg shadow-emerald-900/10 relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 p-4 opacity-20"><Wallet size={80} className="text-white"/></div>
            <p className="text-sm font-medium text-emerald-100/90">MRR (Receita Recorrente)</p>
            <h3 className="text-3xl font-bold mt-2">R$ {totalMRR.toFixed(2)}</h3>
            <div className="mt-4 flex items-center text-xs text-emerald-800 bg-white/90 w-fit px-2.5 py-1 rounded-full font-bold">
                <TrendingUp size={14} className="mr-1" /> Receita Atual
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Calendar size={80} className="text-emerald-600"/></div>
            <p className="text-sm font-medium text-slate-500">Assinaturas Ativas</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-2">{totalActive}</h3>
             <p className="text-xs text-slate-400 mt-2">Total de {tenants.length} cadastros</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-red-200 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><AlertCircle size={80} className="text-red-600"/></div>
            <p className="text-sm font-medium text-slate-500">Inadimplentes / Bloqueados</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-2">{overdueCount}</h3>
             <div className="mt-4 text-xs text-red-700 bg-red-50 w-fit px-2.5 py-1 rounded-full font-medium flex items-center">
                <AlertCircle size={12} className="mr-1"/> Ação necessária
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <TrendingUp className="text-emerald-600" size={20}/> Evolução de Receita
            </h3>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip 
                        cursor={{fill: '#ecfdf5'}} 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
                        formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                    />
                    <Bar dataKey="receita" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
                </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar className="text-emerald-600" size={20}/> Próximos Pagamentos
            </h3>
            <div className="space-y-3 flex-1 overflow-auto pr-2 custom-scrollbar">
                {tenants.length === 0 ? (
                     <div className="text-center py-8 text-slate-400 text-sm">Nenhum pagamento agendado</div>
                ) : (
                    tenants
                    .sort((a, b) => new Date(a.nextBilling).getTime() - new Date(b.nextBilling).getTime())
                    .map(tenant => (
                    <div key={tenant.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all">
                        <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm ${tenant.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <div>
                                <p className="font-semibold text-sm text-slate-700">{tenant.companyName}</p>
                                <p className="text-xs text-slate-500">Vencimento: {new Date(tenant.nextBilling).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>
                        <span className="font-bold text-emerald-700 text-sm bg-emerald-100/50 px-2 py-1 rounded-lg">R$ {tenant.monthlyFee.toFixed(2)}</span>
                    </div>
                ))
                )}
            </div>
            <button className="mt-4 w-full py-2.5 text-sm text-emerald-600 font-medium hover:bg-emerald-50 rounded-xl transition-colors border border-transparent hover:border-emerald-100">
                Ver calendário completo
            </button>
          </div>
      </div>
    </div>
  );
};

export default AdminFinancial;