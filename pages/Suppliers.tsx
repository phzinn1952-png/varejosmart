
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Supplier } from '../types';
import { Truck, Plus, Trash2, AlertCircle, X, Search, MoreHorizontal, Edit, User, Phone, Mail, FileText, Check } from 'lucide-react';

const Suppliers: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // States for Actions and Delete
  const [actionMenu, setActionMenu] = useState<{ id: string; top: number; right: number } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);

  // Manual Form State
  const [formData, setFormData] = useState<Partial<Supplier>>({});

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.document.includes(searchTerm)
  );

  // Close menu on click outside or scroll
  useEffect(() => {
    const closeMenu = () => setActionMenu(null);
    if (actionMenu) {
        window.addEventListener('scroll', closeMenu, true);
        window.addEventListener('resize', closeMenu);
    }
    return () => {
        window.removeEventListener('scroll', closeMenu, true);
        window.removeEventListener('resize', closeMenu);
    };
  }, [actionMenu]);

  const handleActionClick = (e: React.MouseEvent<HTMLButtonElement>, supplierId: string) => {
      e.stopPropagation();
      e.preventDefault();
      if (actionMenu?.id === supplierId) {
          setActionMenu(null);
      } else {
          const rect = e.currentTarget.getBoundingClientRect();
          setActionMenu({
              id: supplierId,
              top: rect.bottom + 5,
              right: window.innerWidth - rect.right
          });
      }
  };

  const handleOpenModal = (supplier?: Supplier) => {
      setActionMenu(null);
      if (supplier) {
          setFormData(supplier);
      } else {
          setFormData({});
      }
      setIsModalOpen(true);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.document) return;

    if (formData.id) {
        updateSupplier(formData as Supplier);
    } else {
        addSupplier({
            id: crypto.randomUUID(),
            name: formData.name,
            document: formData.document,
            email: formData.email,
            phone: formData.phone,
            contactName: formData.contactName,
            createdAt: new Date().toISOString()
        });
    }
    setFormData({});
    setIsModalOpen(false);
  };

  const confirmDelete = (id: string) => {
      setActionMenu(null);
      setSupplierToDelete(id);
      setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
      if (supplierToDelete) {
          deleteSupplier(supplierToDelete);
          setIsDeleteModalOpen(false);
          setSupplierToDelete(null);
      }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Fornecedores</h1>
            <p className="text-slate-500 text-sm">Gestão de parceiros comerciais</p>
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={() => handleOpenModal()}
                className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-700 flex items-center gap-2 transition-all shadow-md active:scale-95 text-sm font-medium"
            >
                <Plus size={18} />
                Novo Fornecedor
            </button>
        </div>
      </div>

      {/* Supplier List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
         <div className="p-4 border-b border-slate-200 bg-emerald-50/30">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500" size={18} />
            <input
              type="text"
              placeholder="Buscar fornecedor..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {suppliers.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
                <Truck size={48} className="mx-auto mb-3 opacity-20" />
                <p>Nenhum fornecedor cadastrado.</p>
                <p className="text-xs">Cadastre manualmente seus fornecedores.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="p-4">Razão Social</th>
                            <th className="p-4">CNPJ</th>
                            <th className="p-4">Contato</th>
                            <th className="p-4 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredSuppliers.map(supplier => (
                            <tr key={supplier.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-medium text-slate-800">{supplier.name}</td>
                                <td className="p-4 text-slate-600 font-mono text-sm">{supplier.document}</td>
                                <td className="p-4 text-slate-600 text-sm">
                                    {supplier.contactName && <div className="font-medium">{supplier.contactName}</div>}
                                    <div className="text-xs">{supplier.email}</div>
                                    <div className="text-xs">{supplier.phone}</div>
                                </td>
                                <td className="p-4 text-center relative">
                                    <button 
                                        onClick={(e) => handleActionClick(e, supplier.id)}
                                        className={`p-2 rounded-lg transition-colors ${actionMenu?.id === supplier.id ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                    >
                                        <MoreHorizontal size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

       {/* Floating Action Menu */}
       {actionMenu && (
        <>
            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setActionMenu(null)} />
            <div 
                className="fixed z-50 bg-white shadow-xl rounded-xl border border-slate-100 w-48 py-1 animate-fade-in"
                style={{ top: actionMenu.top, right: actionMenu.right }}
            >
                 <button 
                    onClick={() => handleOpenModal(suppliers.find(s => s.id === actionMenu.id))}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
                >
                    <Edit size={16} /> Editar
                </button>
                <div className="my-1 border-t border-slate-100"></div>
                <button 
                    onClick={() => confirmDelete(actionMenu.id)}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                    <Trash2 size={16} /> Excluir
                </button>
            </div>
        </>
       )}

      {/* Manual Registration/Edit Modal (Redesigned) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 bg-emerald-600 text-white flex justify-between items-center sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                            <Truck size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{formData.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>
                            <p className="text-emerald-100 text-sm opacity-90">Cadastro de parceiro comercial</p>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors"><X size={20}/></button>
                </div>
                
                <form onSubmit={handleManualSubmit} className="p-8 space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Razão Social *</label>
                            <div className="relative">
                                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input required type="text" placeholder="Ex: Distribuidora Silva"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 focus:bg-white transition-colors" 
                                    value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">CNPJ *</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input required type="text" placeholder="00.000.000/0000-00"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 focus:bg-white transition-colors" 
                                    value={formData.document || ''} onChange={e => setFormData({...formData, document: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                            <User size={14}/> Contato
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Nome do Contato</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input type="text" placeholder="Ex: Marcos"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 focus:bg-white transition-colors" 
                                        value={formData.contactName || ''} onChange={e => setFormData({...formData, contactName: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Telefone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input type="text" placeholder="(00) 00000-0000"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 focus:bg-white transition-colors" 
                                        value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                </div>
                            </div>
                             <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-slate-700">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input type="email" placeholder="contato@fornecedor.com"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 focus:bg-white transition-colors" 
                                        value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100 justify-end">
                         <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 active:scale-95 transition-all flex items-center gap-2">
                            <Check size={18} />
                            {formData.id ? 'Salvar Alterações' : 'Cadastrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center border border-slate-100">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-red-50/50">
                    <AlertCircle className="text-red-500" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Fornecedor?</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                    Tem certeza que deseja remover este fornecedor? O cadastro será removido permanentemente.
                </p>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={handleDelete}
                        className="w-full px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <Trash2 size={18} /> Sim, Excluir
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

export default Suppliers;
