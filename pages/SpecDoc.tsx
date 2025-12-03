
import React, { useState, useEffect } from 'react';
import { Database, Shield, Layers, GitCommit, Plus, Calendar } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';

const SpecDoc: React.FC = () => {
  const { user, systemUpdates, addSystemUpdate, markUpdatesAsSeen } = useAppContext();
  const isMaster = user?.role === UserRole.MASTER;

  const [updateForm, setUpdateForm] = useState({
      version: '',
      title: '',
      description: '',
      type: 'Feature' as 'Feature' | 'Fix' | 'Improvement'
  });

  // Mark updates as seen when visiting this page
  useEffect(() => {
     if (systemUpdates.length > 0) {
         markUpdatesAsSeen();
     }
  }, [systemUpdates, markUpdatesAsSeen]);

  const handlePostUpdate = (e: React.FormEvent) => {
      e.preventDefault();
      addSystemUpdate({
          id: crypto.randomUUID(),
          version: updateForm.version,
          title: updateForm.title,
          description: updateForm.description,
          type: updateForm.type,
          date: new Date().toISOString()
      });
      setUpdateForm({ version: '', title: '', description: '', type: 'Feature' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold text-slate-800">
            {isMaster ? 'Especificação Técnica' : 'Atualizações'}
        </h1>
        <p className="text-slate-500 mt-2">
            {isMaster ? 'VarejoSmart AI - Sistema de Gestão Comercial' : 'Fique por dentro das novidades e melhorias do seu sistema.'}
        </p>
      </div>

      {/* Changelog Section - Visible to Everyone */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-600">
                <GitCommit size={24} />
                <h2 className="text-xl font-bold">Linha do Tempo</h2>
            </div>
        </div>
        
        {isMaster && (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Plus size={16}/> Publicar Nova Atualização</h3>
                <form onSubmit={handlePostUpdate} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <input 
                            required
                            type="text" 
                            placeholder="Versão (Ex: v1.2.0)"
                            className="p-2 border rounded-lg text-sm"
                            value={updateForm.version}
                            onChange={e => setUpdateForm({...updateForm, version: e.target.value})}
                        />
                        <select 
                            className="p-2 border rounded-lg text-sm"
                            value={updateForm.type}
                            onChange={e => setUpdateForm({...updateForm, type: e.target.value as any})}
                        >
                            <option value="Feature">Nova Funcionalidade</option>
                            <option value="Fix">Correção de Bug</option>
                            <option value="Improvement">Melhoria</option>
                        </select>
                        <input 
                            required
                            type="text" 
                            placeholder="Título Curto"
                            className="p-2 border rounded-lg text-sm"
                            value={updateForm.title}
                            onChange={e => setUpdateForm({...updateForm, title: e.target.value})}
                        />
                    </div>
                    <textarea 
                        required
                        placeholder="Descrição detalhada das mudanças..."
                        className="w-full p-2 border rounded-lg text-sm h-20"
                        value={updateForm.description}
                        onChange={e => setUpdateForm({...updateForm, description: e.target.value})}
                    />
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold">Publicar</button>
                </form>
            </div>
        )}

        <div className="space-y-6 relative border-l-2 border-slate-200 ml-3 pl-8 py-2">
            {systemUpdates.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center text-slate-400">
                    <p>Nenhuma atualização registrada ainda.</p>
                </div>
            ) : (
                systemUpdates.map(update => (
                    <div key={update.id} className="relative bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                        <div className={`absolute -left-[41px] top-5 w-5 h-5 rounded-full border-4 border-white ${
                            update.type === 'Feature' ? 'bg-emerald-500' : update.type === 'Fix' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full mr-2 ${
                                    update.type === 'Feature' ? 'bg-emerald-100 text-emerald-700' : update.type === 'Fix' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                    {update.type === 'Feature' ? 'Nova Funcionalidade' : update.type === 'Fix' ? 'Correção' : 'Melhoria'}
                                </span>
                                <span className="font-mono text-xs text-slate-400">{update.version}</span>
                            </div>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Calendar size={12}/> {new Date(update.date).toLocaleDateString()}
                            </span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg mb-1">{update.title}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">{update.description}</p>
                    </div>
                ))
            )}
        </div>
      </section>

      {/* Technical Sections - Only Visible to Master Admin */}
      {isMaster && (
        <div className="space-y-12 pt-8 border-t border-slate-200">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 text-indigo-800 text-sm font-semibold text-center">
                Área Técnica (Visível apenas para Master Admin)
            </div>

            <section className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600">
                <Database size={24} />
                <h2 className="text-xl font-bold">1. Modelagem de Dados</h2>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm prose prose-slate max-w-none">
                <h3>Entidades Principais</h3>
                <ul>
                    <li><strong>Produtos:</strong> ID, Código, Código de Barras (Index), Nome, Custo, Preço, Estoque, Mínimo.</li>
                    <li><strong>Clientes:</strong> ID, Documento (Index Unique), Nome, Contato, Limite de Crédito.</li>
                    <li><strong>Vendas:</strong> ID (UUID), Timestamp, ClienteID, Total, Método Pagamento, Itens (JSON/Relacional).</li>
                    <li><strong>Movimentações:</strong> ID, ProdutoID, Tipo (Entrada/Saída), Quantidade, Data, Motivo.</li>
                </ul>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-2 text-teal-600">
                <Layers size={24} />
                <h2 className="text-xl font-bold">2. Regras de Negócio</h2>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="border-l-4 border-teal-500 pl-4 py-1">
                    <h4 className="font-bold text-slate-800">Controle de Estoque</h4>
                    <p className="text-slate-600 text-sm">A saída de produtos no PDV deve decrementar o estoque imediatamente ("Optimistic UI" com consistência eventual no backend). Alertas são gerados quando <code>Estoque &le; Minimo</code>.</p>
                </div>
                <div className="border-l-4 border-teal-500 pl-4 py-1">
                    <h4 className="font-bold text-slate-800">Venda Fiado</h4>
                    <p className="text-slate-600 text-sm">Só permitida para clientes cadastrados e ativos. O sistema deve validar se <code>SaldoDevedor + NovaCompra &le; LimiteCredito</code>.</p>
                </div>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                <Shield size={24} />
                <h2 className="text-xl font-bold">3. Stack Tecnológica</h2>
                </div>
                <div className="bg-emerald-900 text-emerald-100 p-6 rounded-xl shadow-lg font-mono text-sm">
                <p><span className="text-emerald-400">Frontend:</span> React 18 + TypeScript</p>
                <p><span className="text-emerald-400">Estilização:</span> Tailwind CSS</p>
                <p><span className="text-emerald-400">State:</span> React Context + Hooks (Simulando Redux)</p>
                <p><span className="text-emerald-400">Charts:</span> Recharts</p>
                <p><span className="text-emerald-400">AI:</span> Google Gemini SDK (gemini-2.5-flash)</p>
                <p><span className="text-emerald-400">Icons:</span> Lucide React</p>
                </div>
            </section>
        </div>
      )}
    </div>
  );
};

export default SpecDoc;
