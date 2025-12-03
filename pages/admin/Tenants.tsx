import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Tenant, PlanConfig } from '../../types';
import { Building2, Search, Plus, Mail, CheckCircle, X, Store, Edit, FileText, Clock, ChevronDown, User, CreditCard, AlertCircle, Lock, Key, Trash2, Copy, RefreshCcw, MoreHorizontal, ShieldCheck, Layers } from 'lucide-react';

const Tenants: React.FC = () => {
  const { tenants, addTenant, updateTenant, deleteTenant, plans, resetTenantPassword } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const plansList = Object.values(plans) as PlanConfig[];
  
  // State for Fixed Position Menu
  const [actionMenu, setActionMenu] = useState<{
      id: string;
      top: number;
      right: number;
      openUp: boolean;
  } | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Tenant>>({
    status: 'Active'
  });

  const filteredTenants = tenants.filter(t => 
    t.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.document.includes(searchTerm) ||
    t.email.includes(searchTerm)
  );

  // Auto-generate credentials when opening modal for new tenant
  useEffect(() => {
    if (isModalOpen && !formData.id && formData.email) {
        const generatedPass = Math.random().toString(36).slice(-8);
        setFormData(prev => ({ ...prev, tempPassword: generatedPass }));
    }
  }, [formData.email, isModalOpen, formData.id]);

  // Global listener to close menu on scroll or click outside
  useEffect(() => {
    const closeMenu = () => setActionMenu(null);
    
    if (actionMenu) {
        window.addEventListener('resize', closeMenu);
        window.addEventListener('scroll', closeMenu, true); 
    }

    return () => {
        window.removeEventListener('resize', closeMenu);
        window.removeEventListener('scroll', closeMenu, true);
    };
  }, [actionMenu]);

  const handleActionClick = (e: React.MouseEvent<HTMLButtonElement>, tenant: Tenant) => {
      e.stopPropagation();
      e.preventDefault();

      if (actionMenu?.id === tenant.id) {
          setActionMenu(null);
          return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const menuHeightEstimate = 220; 
      const spaceBelow = window.innerHeight - rect.bottom;
      
      const openUp = spaceBelow < menuHeightEstimate;

      setActionMenu({
          id: tenant.id,
          top: openUp ? (rect.top - 8) : (rect.bottom + 8),
          right: window.innerWidth - rect.right, 
          openUp
      });
  };


  const handleOpenModal = (tenant?: Tenant) => {
    if (plansList.length === 0) {
        alert("Você precisa cadastrar planos antes de criar uma empresa.");
        return;
    }

    setActionMenu(null);
    setNewPassword(null); 
    if (tenant) {
      setFormData(tenant);
    } else {
      setFormData({
        plan: plansList[0].id, // Default to first plan found
        status: 'Active',
        tempPassword: Math.random().toString(36).slice(-8)
      });
    }
    setIsModalOpen(true);
  };

  const handleSendBoleto = (tenant: Tenant) => {
    setActionMenu(null);
    alert(`Boleto de renovação enviado para ${tenant.email}`);
  };

  const handleHistory = (tenant: Tenant) => {
    setActionMenu(null);
    alert(`Histórico de ${tenant.companyName}:\n- Criado em: ${new Date(tenant.joinedAt).toLocaleDateString()}\n- Último pagamento: Confirmado\n- Próximo vencimento: ${new Date(tenant.nextBilling).toLocaleDateString()}`);
  };

  const confirmDelete = (tenant: Tenant) => {
      setActionMenu(null);
      setTenantToDelete(tenant.id);
      setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
      if (tenantToDelete) {
          deleteTenant(tenantToDelete);
          setIsDeleteModalOpen(false);
          setTenantToDelete(null);
      }
  };

  const handleResetPassword = async () => {
    if (!formData.id) return;
    setResetLoading(true);
    const pass = await resetTenantPassword(formData.id);
    setNewPassword(pass);
    setResetLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.email || !formData.plan) return;

    const selectedPlan = plans[formData.plan];
    if (!selectedPlan) return;

    const totalRecurring = selectedPlan.supportFee;

    if (formData.id) {
        const updatedTenant = { ...formData as Tenant };
        updatedTenant.monthlyFee = totalRecurring;
        updateTenant(updatedTenant);
    } else {
        const newTenant: Tenant = {
            ...formData as Tenant,
            id: crypto.randomUUID(),
            joinedAt: new Date().toISOString(),
            nextBilling: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
            monthlyFee: totalRecurring,
            mustChangePassword: true 
        };
        addTenant(newTenant);
    }

    setIsModalOpen(false);
  };

  const selectedPlanConfig = formData.plan ? plans[formData.plan] : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Gerenciar Empresas</h1>
            <p className="text-slate-500 text-sm">Controle de clientes do sistema (SaaS)</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 active:scale-95 font-medium"
        >
          <Plus size={20} />
          Nova Empresa
        </button>
      </div>
      
      {plansList.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Layers size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Nenhum plano configurado</h3>
              <p className="text-slate-500 mt-2 mb-6">Você precisa criar planos de assinatura antes de cadastrar empresas.</p>
              <a href="#/admin/plans" className="inline-flex items-center text-emerald-600 font-bold hover:underline">Ir para Planos</a>
          </div>
      ) : (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible min-h-[400px]">
        {/* Search */}
        <div className="p-4 border-b border-slate-200 bg-emerald-50/30">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome, CNPJ ou email..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all text-slate-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Content */}
        {filteredTenants.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
                <p>Nenhuma empresa encontrada.</p>
            </div>
        ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold tracking-wider">
                <th className="p-4 rounded-tl-xl">Empresa / Responsável</th>
                <th className="p-4">Plano</th>
                <th className="p-4">Status</th>
                <th className="p-4">Financeiro</th>
                <th className="p-4 text-center rounded-tr-xl">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.map((tenant) => {
                const planName = plans[tenant.plan]?.name || 'Plano Removido';
                return (
                <tr key={tenant.id} className="hover:bg-emerald-50/40 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-200">
                            {tenant.companyName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="font-semibold text-slate-800 group-hover:text-emerald-800 transition-colors">{tenant.companyName}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                <User size={12} /> {tenant.ownerName}
                            </div>
                        </div>
                    </div>
                  </td>
                  <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold border bg-slate-100 text-slate-600 border-slate-200">
                          {planName}
                      </span>
                  </td>
                  <td className="p-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        tenant.status === 'Active' ? 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-600/20' : 
                        tenant.status === 'Blocked' ? 'text-red-700 bg-red-50 ring-1 ring-red-600/20' :
                        'text-yellow-700 bg-yellow-50 ring-1 ring-yellow-600/20'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                             tenant.status === 'Active' ? 'bg-emerald-500' : tenant.status === 'Blocked' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        {tenant.status === 'Active' ? 'Ativo' : tenant.status === 'Blocked' ? 'Bloqueado' : 'Pendente'}
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                      <div className="flex flex-col">
                        <span className="text-slate-800 font-bold text-sm">R$ {tenant.monthlyFee.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Suporte Mensal</span>
                      </div>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                        onClick={(e) => handleActionClick(e, tenant)}
                        className={`
                            inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                            ${actionMenu?.id === tenant.id 
                                ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500/50' 
                                : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600'}
                        `}
                    >
                        <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        )}
      </div>
      )}

       {/* Floating Action Menu */}
       {actionMenu && (
           <>
               <div 
                   className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px] transition-opacity"
                   onClick={() => setActionMenu(null)}
               />
               <div 
                    className="fixed z-50 bg-white shadow-2xl overflow-hidden transition-all duration-300 md:rounded-2xl md:ring-1 md:ring-black/5 rounded-t-3xl md:rounded-b-2xl w-full md:w-72"
                    style={{
                        ...(window.innerWidth >= 768 ? {
                            top: actionMenu.openUp ? 'auto' : actionMenu.top,
                            bottom: actionMenu.openUp ? (window.innerHeight - actionMenu.top) : 'auto',
                            right: actionMenu.right,
                            transformOrigin: actionMenu.openUp ? 'bottom right' : 'top right'
                        } : {
                            bottom: 0,
                            left: 0,
                            right: 0,
                            top: 'auto',
                            transform: 'translateY(0)' 
                        })
                    }}
                >
                    <div className="md:hidden flex justify-center pt-3 pb-1">
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                    </div>

                    <div className="p-2 space-y-1">
                        <div className="px-4 py-2 border-b border-slate-100 mb-2 md:hidden">
                            <h3 className="font-bold text-slate-800">Ações da Empresa</h3>
                        </div>

                        <button 
                            onClick={() => handleOpenModal(tenants.find(t => t.id === actionMenu.id))}
                            className="flex w-full items-center px-4 py-3 md:py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors rounded-xl group font-medium"
                        >
                            <div className="p-2 bg-emerald-100/50 rounded-lg mr-3 text-emerald-600 group-hover:bg-emerald-200 group-hover:text-emerald-900 shadow-sm">
                                <Edit size={18} />
                            </div>
                            <div className="text-left">
                                <span className="block font-semibold">Editar Cadastro</span>
                                <span className="text-xs text-slate-400 font-normal">Alterar dados e acesso</span>
                            </div>
                        </button>
                        
                        <button 
                            onClick={() => handleSendBoleto(tenants.find(t => t.id === actionMenu.id)!)}
                            className="flex w-full items-center px-4 py-3 md:py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors rounded-xl group font-medium"
                        >
                            <div className="p-2 bg-blue-50 rounded-lg mr-3 text-blue-600 group-hover:bg-blue-100 group-hover:text-blue-900 shadow-sm">
                                <FileText size={18} />
                            </div>
                            <div className="text-left">
                                <span className="block font-semibold">Enviar Boleto</span>
                                <span className="text-xs text-slate-400 font-normal">Renovação de suporte</span>
                            </div>
                        </button>

                        <button 
                            onClick={() => handleHistory(tenants.find(t => t.id === actionMenu.id)!)}
                            className="flex w-full items-center px-4 py-3 md:py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors rounded-xl group font-medium"
                        >
                            <div className="p-2 bg-purple-50 rounded-lg mr-3 text-purple-600 group-hover:bg-purple-100 group-hover:text-purple-900 shadow-sm">
                                <Clock size={18} />
                            </div>
                            <div className="text-left">
                                <span className="block font-semibold">Ver Histórico</span>
                                <span className="text-xs text-slate-400 font-normal">Logs e pagamentos</span>
                            </div>
                        </button>
                        
                        <div className="my-1 border-t border-slate-100"></div>

                        <button 
                            onClick={() => confirmDelete(tenants.find(t => t.id === actionMenu.id)!)}
                            className="flex w-full items-center px-4 py-3 md:py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors rounded-xl group font-medium"
                        >
                                <div className="p-2 bg-red-50 rounded-lg mr-3 text-red-500 group-hover:bg-red-100 group-hover:text-red-700 shadow-sm">
                                <Trash2 size={18} />
                            </div>
                            <div className="text-left">
                                <span className="block font-semibold">Excluir Empresa</span>
                                <span className="text-xs text-red-400/80 font-normal">Ação irreversível</span>
                            </div>
                        </button>
                    </div>
                    <div className="h-6 md:hidden"></div>
               </div>
           </>
       )}

       {/* Add/Edit Tenant Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all custom-scrollbar">
            
            {/* Header */}
            <div className="flex justify-between items-center p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white sticky top-0 z-10 shadow-md">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                    <Building2 size={24} className="text-white" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold">{formData.id ? 'Editar Empresa' : 'Nova Empresa'}</h2>
                    <p className="text-emerald-100 text-sm opacity-90">Gestão de cliente e acesso</p>
                 </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="hover:bg-white/20 p-2 rounded-full transition-colors active:scale-95"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column: Registration */}
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-2 text-emerald-800 pb-2 border-b border-emerald-100">
                            <Store size={18} />
                            <h3 className="text-sm font-bold uppercase tracking-wider">Dados da Empresa</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="group">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome da Empresa <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        required 
                                        type="text" 
                                        placeholder="Ex: Mercado Super Bom" 
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900 placeholder-slate-400 focus:bg-white"
                                        value={formData.companyName || ''} 
                                        onChange={e => setFormData({...formData, companyName: e.target.value})} 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="group">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Responsável <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input 
                                            required 
                                            type="text" 
                                            placeholder="João da Silva" 
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900 placeholder-slate-400 focus:bg-white"
                                            value={formData.ownerName || ''} 
                                            onChange={e => setFormData({...formData, ownerName: e.target.value})} 
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">CPF / CNPJ <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input 
                                            required 
                                            type="text" 
                                            placeholder="00.000.000/0000-00" 
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900 placeholder-slate-400 focus:bg-white"
                                            value={formData.document || ''} 
                                            onChange={e => setFormData({...formData, document: e.target.value})} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Access Credentials Section */}
                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <div className="flex items-center justify-between text-emerald-800 pb-2 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Key size={18} />
                                        <h3 className="text-sm font-bold uppercase tracking-wider">Acesso ao Sistema</h3>
                                    </div>
                                    {formData.id && (
                                        <span className="text-xs px-2 py-1 bg-slate-100 rounded-lg text-slate-500">
                                            Usuário já cadastrado
                                        </span>
                                    )}
                                </div>
                                
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email de Login</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input 
                                                required 
                                                type="email" 
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-slate-700 font-medium"
                                                value={formData.email || ''} 
                                                onChange={e => setFormData({...formData, email: e.target.value})} 
                                                readOnly={!!formData.id}
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                         <label className="block text-sm font-semibold text-slate-700 mb-1.5">Senha de Acesso</label>
                                         {!formData.id ? (
                                             <div className="flex items-center gap-3 px-4 py-3 bg-white border border-emerald-200 rounded-xl text-emerald-800 font-mono text-sm shadow-sm">
                                                <Lock size={16} className="text-emerald-500" /> 
                                                <span className="font-bold tracking-wider">{formData.tempPassword}</span>
                                                <span className="text-xs text-slate-400 ml-auto">(Senha Provisória)</span>
                                             </div>
                                         ) : (
                                            <div className="space-y-2">
                                                {!newPassword ? (
                                                    <button 
                                                        type="button"
                                                        onClick={handleResetPassword}
                                                        disabled={resetLoading}
                                                        className="w-full px-4 py-2.5 bg-white border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-300 font-medium transition-all flex items-center justify-center gap-2 text-sm"
                                                    >
                                                        {resetLoading ? <RefreshCcw className="animate-spin" size={16} /> : <RefreshCcw size={16} />}
                                                        Gerar Nova Senha Provisória
                                                    </button>
                                                ) : (
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-mono text-sm animate-fade-in shadow-sm">
                                                            <span className="flex items-center gap-2 font-bold"><CheckCircle size={16}/> {newPassword}</span>
                                                            <button type="button" onClick={() => navigator.clipboard.writeText(newPassword)} className="text-emerald-600 hover:text-emerald-900 p-1 hover:bg-emerald-100 rounded"><Copy size={16} /></button>
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 text-center">Senha copiada para área de transferência</span>
                                                    </div>
                                                )}
                                            </div>
                                         )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Plans & Finance */}
                    <div className="w-full lg:w-80 space-y-6">
                        <div className="flex items-center gap-2 text-emerald-800 pb-2 border-b border-emerald-100">
                            <CreditCard size={18} />
                            <h3 className="text-sm font-bold uppercase tracking-wider">Plano e Tarifas</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-slate-700">Selecione o Plano</label>
                                <div className="space-y-2">
                                    {plansList.map((plan) => (
                                        <label key={plan.id} className={`flex items-start p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.plan === plan.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-emerald-200'}`}>
                                            <input 
                                                type="radio" 
                                                name="plan" 
                                                value={plan.id}
                                                checked={formData.plan === plan.id}
                                                onChange={() => setFormData({...formData, plan: plan.id})}
                                                className="mt-1 mr-3 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                                            />
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <span className="font-bold text-slate-800 text-sm">{plan.name}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {plan.productLimit === -1 ? 'Produtos Ilimitados' : `${plan.productLimit} produtos`}, {plan.userLimit} logins
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            
                             {/* Financial Summary Box */}
                             {selectedPlanConfig && (
                             <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-1"><CreditCard size={12}/> Resumo Financeiro</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-slate-600 items-center">
                                        <span>Taxa Suporte (Mês):</span>
                                        <span className="font-bold text-slate-800">R$ {selectedPlanConfig.supportFee.toFixed(2)}</span>
                                    </div>
                                    
                                    { !formData.id && (
                                        <div className="flex justify-between text-emerald-700 font-medium items-center py-2 border-t border-dashed border-slate-300">
                                            <span>Implantação (Única):</span>
                                            <span>R$ {selectedPlanConfig.implementationFee.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-slate-200 pt-3 mt-2 flex justify-between font-bold text-emerald-800 text-lg">
                                        <span>Recorrente:</span>
                                        <span>R$ {selectedPlanConfig.supportFee.toFixed(2)}</span>
                                    </div>
                                    <p className="text-[10px] text-center text-slate-400 mt-1">*Não há cobrança de mensalidade base, apenas suporte.</p>
                                </div>
                             </div>
                             )}

                             <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-slate-700">Status da Conta</label>
                                <select 
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-medium"
                                    value={formData.status} 
                                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                                >
                                    <option value="Active">Ativo</option>
                                    <option value="Pending">Pendente</option>
                                    <option value="Blocked">Bloqueado</option>
                                </select>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                    <button 
                        type="button" 
                        onClick={() => setIsModalOpen(false)} 
                        className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-semibold"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-900/20 hover:scale-[1.01] flex items-center gap-2 font-bold active:scale-[0.98] transition-all"
                    >
                        <CheckCircle size={20} /> 
                        {formData.id ? 'Salvar Alterações' : 'Cadastrar Empresa'}
                    </button>
                </div>
            </form>
          </div>
        </div>
       )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center transform transition-all scale-100 border border-slate-100">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-red-50/50">
                    <AlertCircle className="text-red-500" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Empresa?</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                    Você está prestes a excluir permanentemente esta empresa. Todos os dados de vendas e produtos serão perdidos.
                </p>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={handleDelete}
                        className="w-full px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <Trash2 size={18} /> Sim, Excluir Empresa
                    </button>
                    <button 
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default Tenants;