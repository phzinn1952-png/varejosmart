
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';
import { Users, Plus, Trash2, Mail, Lock, User, CheckCircle, Shield } from 'lucide-react';

const Team: React.FC = () => {
  const { user, tenantUsers, addTenantUser, deleteTenantUser } = useAppContext();
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: ''
  });

  // Filter users that belong to this tenant
  const myEmployees = tenantUsers.filter(u => u.tenantId === user?.tenantId);

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!user?.tenantId) return;

      addTenantUser({
          id: crypto.randomUUID(),
          tenantId: user.tenantId,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: UserRole.OPERATOR,
          active: true
      });

      setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
         <h1 className="text-2xl font-bold text-slate-800">Gerenciar Equipe</h1>
         <p className="text-slate-500 text-sm">Cadastre funcionários para operar o sistema (PDV)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create User Form */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Plus className="text-emerald-600" size={20} /> Novo Funcionário
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Completo</label>
                      <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            required
                            type="text"
                            placeholder="Ex: Maria Oliveira"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                          />
                      </div>
                  </div>
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Email de Acesso</label>
                      <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            required
                            type="email"
                            placeholder="maria@loja.com"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                          />
                      </div>
                  </div>
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Senha</label>
                      <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            required
                            type="text"
                            placeholder="Senha de acesso"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                          />
                      </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2 mt-4"
                  >
                      <CheckCircle size={18} /> Cadastrar
                  </button>
              </form>
          </div>

          {/* User List */}
          <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Users className="text-emerald-600" size={20} /> Funcionários Ativos ({myEmployees.length})
              </h3>
              
              {myEmployees.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
                      <Users size={48} className="mx-auto mb-3 opacity-20" />
                      <p>Nenhum funcionário cadastrado.</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myEmployees.map(emp => (
                          <div key={emp.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-colors">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                                      {emp.name.charAt(0)}
                                  </div>
                                  <div>
                                      <p className="font-bold text-slate-800">{emp.name}</p>
                                      <p className="text-xs text-slate-500 flex items-center gap-1">
                                          <Shield size={10} /> Operador
                                      </p>
                                      <p className="text-xs text-slate-400 mt-0.5">{emp.email}</p>
                                  </div>
                              </div>
                              <button 
                                onClick={() => deleteTenantUser(emp.id)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remover acesso"
                              >
                                  <Trash2 size={18} />
                              </button>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default Team;
