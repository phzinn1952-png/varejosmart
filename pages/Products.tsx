
import React, { useState, useRef, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Product, ProductStatus, UnitOfMeasure, InvoiceImportData } from '../types';
import { Plus, Edit, Trash2, Sparkles, Loader2, Image as ImageIcon, Box, Tag, DollarSign, Archive, X, CheckCircle, AlertTriangle, Upload, Wand2, ChevronDown, Check, TrendingUp, TrendingDown, AlertCircle, Package, Layers, FileSpreadsheet } from 'lucide-react';
import { getBusinessInsight } from '../services/geminiService';
import DataBackup from '../components/DataBackup';

const Products: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, sales, processInvoiceImport, exportData, importData } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // XML Import State
  const [isXmlModalOpen, setIsXmlModalOpen] = useState(false);
  const [xmlData, setXmlData] = useState<InvoiceImportData | null>(null);
  const [xmlError, setXmlError] = useState<string | null>(null);
  const xmlInputRef = useRef<HTMLInputElement>(null);
  
  // Estado para controlar modo do código (Auto vs Manual)
  const [isAutoCode, setIsAutoCode] = useState(true);
  
  // Estado para o dropdown de categorias
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Derivar categorias existentes
  const existingCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return Array.from(cats).sort();
  }, [products]);

  const [formData, setFormData] = useState<Partial<Product>>({
    status: ProductStatus.ACTIVE,
    unit: UnitOfMeasure.UN,
    category: 'Geral'
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setFormData(product);
      setIsAutoCode(false); // Se está editando, assume manual para não mudar o código sem querer
    } else {
      const randomCode = `PROD${Math.floor(Math.random() * 100000)}`;
      setFormData({
        code: randomCode,
        status: ProductStatus.ACTIVE,
        unit: UnitOfMeasure.UN,
        stock: 0,
        minStock: 5,
        category: 'Geral',
        salePrice: 0,
        costPrice: 0,
        image: ''
      });
      setIsAutoCode(true);
    }
    setIsModalOpen(true);
  };

  const confirmDelete = (id: string) => {
      setProductToDelete(id);
      setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
      if (productToDelete) {
          deleteProduct(productToDelete);
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
      }
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) return;
    setLoadingAi(true);
    const desc = await getBusinessInsight(sales, products, 'PRODUCT_DESCRIPTION', formData.name);
    setFormData(prev => ({ ...prev, description: desc }));
    setLoadingAi(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateRandomCode = () => {
      const randomCode = `PROD${Math.floor(Math.random() * 100000)}`;
      setFormData(prev => ({ ...prev, code: randomCode }));
  };

  const toggleAutoCode = () => {
      const newState = !isAutoCode;
      setIsAutoCode(newState);
      if (newState) {
          generateRandomCode();
      } else {
          setFormData(prev => ({ ...prev, code: '' }));
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.salePrice === undefined || !formData.code) return;

    const product: Product = {
      ...formData as Product,
      id: formData.id || crypto.randomUUID(),
      createdAt: formData.createdAt || new Date().toISOString()
    };

    if (formData.id) {
      updateProduct(product);
    } else {
      addProduct(product);
    }
    setIsModalOpen(false);
  };

  // --- XML Import Logic ---

  const handleXmlUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setXmlError(null);
    setXmlData(null);

    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result as string;
                parseNfe(text);
            } catch (err) {
                setXmlError("Erro ao ler arquivo XML. Certifique-se que é uma NFe válida.");
            }
        };
        reader.readAsText(file);
    }
  };

  const parseNfe = (xmlText: string) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        throw new Error("Invalid XML");
    }

    const emit = xmlDoc.getElementsByTagName("emit")[0];
    if (!emit) throw new Error("Emitente não encontrado na NFe");

    const xNome = emit.getElementsByTagName("xNome")[0]?.textContent || "Desconhecido";
    const cnpj = emit.getElementsByTagName("CNPJ")[0]?.textContent || "";

    const dets = xmlDoc.getElementsByTagName("det");
    const items = [];

    for (let i = 0; i < dets.length; i++) {
        const prod = dets[i].getElementsByTagName("prod")[0];
        if (prod) {
            const cProd = prod.getElementsByTagName("cProd")[0]?.textContent || "";
            const xProd = prod.getElementsByTagName("xProd")[0]?.textContent || "";
            const qCom = parseFloat(prod.getElementsByTagName("qCom")[0]?.textContent || "0");
            const vUnCom = parseFloat(prod.getElementsByTagName("vUnCom")[0]?.textContent || "0");
            const uCom = prod.getElementsByTagName("uCom")[0]?.textContent || "UN";

            items.push({
                code: cProd,
                name: xProd,
                quantity: qCom,
                unitPrice: vUnCom,
                unit: uCom
            });
        }
    }

    setXmlData({
        supplier: { name: xNome, document: cnpj },
        items
    });
  };

  const confirmXmlImport = () => {
    if (xmlData) {
        processInvoiceImport(xmlData);
        setIsXmlModalOpen(false);
        setXmlData(null);
        alert("Importação realizada com sucesso! Produtos atualizados e fornecedor verificado.");
    }
  };

  // Cálculo de Margem em Tempo Real
  const marginInfo = useMemo(() => {
      const cost = formData.costPrice || 0;
      const sale = formData.salePrice || 0;
      
      if (sale === 0) return { profit: 0, margin: 0, isPositive: true };

      const profit = sale - cost;
      const margin = (profit / sale) * 100;
      
      return {
          profit,
          margin,
          isPositive: profit >= 0
      };
  }, [formData.costPrice, formData.salePrice]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Gerenciar Produtos</h1>
            <p className="text-slate-500 text-sm">Cadastre e atualize seu inventário</p>
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={() => setIsXmlModalOpen(true)}
                className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-all shadow-md active:scale-95 text-sm font-medium"
            >
                <FileSpreadsheet size={18} />
                Importar XML
            </button>
            <button 
            onClick={() => handleOpenModal()}
            className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 flex items-center gap-2 transition-all shadow-md active:scale-95 text-sm font-medium"
            >
            <Plus size={20} />
            Novo Produto
            </button>
        </div>
      </div>

      <DataBackup
        onExport={exportData}
        onImport={(file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const data = JSON.parse(e.target?.result as string);
              importData(data);
            } catch (error) {
              alert('Erro ao ler arquivo. Verifique se é um backup válido.');
            }
          };
          reader.readAsText(file);
        }}
      />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-semibold">Nome do Produto</th>
                <th className="p-4 font-semibold">Categoria</th>
                <th className="p-4 font-semibold text-right">Preço Venda</th>
                <th className="p-4 font-semibold text-center">Estoque</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const isLowStock = product.stock <= product.minStock;

                return (
                <tr key={product.id} className="border-b border-slate-100 hover:bg-emerald-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200">
                            {product.image ? (
                                <img src={product.image} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <Box size={20} />
                            )}
                        </div>
                        <div>
                            <div className="font-medium text-slate-900 group-hover:text-emerald-700 transition-colors">{product.name}</div>
                            <div className="text-xs text-slate-500 font-mono">{product.code}</div>
                        </div>
                    </div>
                  </td>
                  <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                          {product.category}
                      </span>
                  </td>
                  <td className="p-4 text-right font-bold text-slate-700">
                    R$ {product.salePrice.toFixed(2)}
                  </td>
                  <td className="p-4 text-center">
                    <div className={`
                       inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
                       ${isLowStock 
                         ? 'bg-red-50 text-red-600 border-red-200 shadow-sm animate-pulse' 
                         : 'bg-emerald-50 text-emerald-600 border-emerald-100'}
                    `}>
                      {isLowStock && <AlertTriangle size={12} className="text-red-500 animate-bounce" />}
                      {product.stock} {product.unit}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === ProductStatus.ACTIVE 
                        ? 'text-emerald-700 bg-emerald-50' 
                        : 'text-slate-600 bg-slate-100'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                             product.status === ProductStatus.ACTIVE ? 'bg-emerald-500' : 'bg-slate-400'
                        }`} />
                        {product.status}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1">
                        <button 
                        onClick={() => handleOpenModal(product)}
                        className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-all"
                        >
                        <Edit size={18} />
                        </button>
                        <button 
                        onClick={() => confirmDelete(product.id)}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                        >
                        <Trash2 size={18} />
                        </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 bg-emerald-600 text-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                    {formData.id ? <Edit size={20} /> : <Plus size={20} />}
                 </div>
                 <div>
                    <h2 className="text-xl font-bold">{formData.id ? 'Editar Produto' : 'Cadastrar Novo Produto'}</h2>
                    <p className="text-emerald-100 text-sm opacity-90">Preencha as informações abaixo</p>
                 </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              
              <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left Column: Image & Basic Info */}
                  <div className="flex-1 space-y-6">
                     
                     <div className="flex gap-6">
                        {/* Image Upload Area */}
                        <div className="shrink-0">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleImageUpload} 
                                accept="image/*"
                                className="hidden"
                            />
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-32 h-32 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-500 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                {formData.image ? (
                                    <>
                                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Edit className="text-white" size={24} />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={28} className="mb-2 group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-bold text-center px-2">Trocar Foto</span>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex-1 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                    <Tag size={16} className="text-emerald-500"/> Nome do Produto *
                                </label>
                                <input 
                                    required
                                    type="text" 
                                    placeholder="Ex: Coca-Cola 2L"
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-emerald-500 outline-none transition-all text-slate-900"
                                    value={formData.name || ''}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                             
                             <div className="grid grid-cols-2 gap-4">
                                {/* Categoria com Autocomplete */}
                                <div className="space-y-1.5 relative">
                                    <label className="text-sm font-medium text-slate-900">Categoria</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="Selecionar ou criar..."
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
                                            value={formData.category || ''}
                                            onChange={e => {
                                                setFormData({...formData, category: e.target.value});
                                                setShowCategoryDropdown(true);
                                            }}
                                            onFocus={() => setShowCategoryDropdown(true)}
                                            onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)} // Delay for click
                                        />
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                    {showCategoryDropdown && existingCategories.length > 0 && (
                                        <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                                            {existingCategories
                                                .filter(c => c.toLowerCase().includes((formData.category || '').toLowerCase()))
                                                .map(cat => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-sm text-slate-700"
                                                    onClick={() => setFormData({...formData, category: cat})}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                            {existingCategories.length > 0 && (
                                                <div className="px-4 py-2 text-xs text-slate-400 border-t border-slate-100 bg-slate-50">
                                                    Digite para criar nova categoria
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Código com Toggle Auto/Manual */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-slate-900">Código</label>
                                        <button 
                                            type="button" 
                                            onClick={toggleAutoCode}
                                            className="text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 text-emerald-600 hover:text-emerald-700"
                                        >
                                            {isAutoCode ? 'Automático' : 'Manual'}
                                            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isAutoCode ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                                <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${isAutoCode ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </div>
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input 
                                            required
                                            type="text" 
                                            disabled={isAutoCode}
                                            className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm transition-colors ${isAutoCode ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-900 border-slate-200'}`}
                                            value={formData.code || ''}
                                            onChange={e => setFormData({...formData, code: e.target.value})}
                                            placeholder="Ex: 789..."
                                        />
                                        {isAutoCode && (
                                            <Wand2 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        )}
                                    </div>
                                </div>
                             </div>
                        </div>
                     </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-900 flex justify-between items-center">
                            <span>Descrição</span> 
                            <button 
                            type="button" 
                            onClick={handleGenerateDescription}
                            disabled={!formData.name || loadingAi}
                            className="text-xs px-2 py-1 bg-violet-100 text-violet-700 rounded-md flex items-center gap-1 hover:bg-violet-200 transition-colors disabled:opacity-50"
                            >
                            {loadingAi ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                            Gerar com IA
                            </button>
                        </label>
                        <textarea 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none h-24 text-sm resize-none text-slate-900"
                            value={formData.description || ''}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            placeholder="Descrição técnica ou comercial do produto..."
                        />
                    </div>
                  </div>

                  {/* Right Column: Pricing & Inventory */}
                  <div className="w-full lg:w-72 space-y-6 flex flex-col">
                      
                      {/* Pricing Section */}
                      <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-4">
                          <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2 border-b border-emerald-200/50 pb-2">
                              <DollarSign size={16} /> Precificação
                          </h3>
                          <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-900">Preço de Custo (R$)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                        <DollarSign size={14} />
                                    </span>
                                    <input 
                                        type="number" step="0.01"
                                        className="w-full pl-8 p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-right font-bold text-slate-700 text-lg bg-white shadow-sm transition-colors focus:border-emerald-300"
                                        value={formData.costPrice || ''}
                                        onChange={e => setFormData({...formData, costPrice: parseFloat(e.target.value)})}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-900">Preço de Venda (R$) *</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 text-sm">
                                        <DollarSign size={14} />
                                    </span>
                                    <input 
                                        required
                                        type="number" step="0.01"
                                        className="w-full pl-8 p-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-right font-bold text-emerald-700 text-lg bg-white shadow-sm"
                                        value={formData.salePrice || ''}
                                        onChange={e => setFormData({...formData, salePrice: parseFloat(e.target.value)})}
                                    />
                                </div>
                            </div>

                            {/* Margem de Lucro Indicator */}
                            {(formData.salePrice || 0) > 0 && (
                                <div className={`p-3 rounded-lg flex flex-col items-center justify-center text-center transition-colors ${marginInfo.isPositive ? 'bg-emerald-100/50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                                    <div className={`text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1 ${marginInfo.isPositive ? 'text-emerald-700' : 'text-red-700'}`}>
                                        {marginInfo.isPositive ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                                        {marginInfo.isPositive ? 'Lucro' : 'Prejuízo'}
                                    </div>
                                    <div className={`font-bold text-sm ${marginInfo.isPositive ? 'text-emerald-800' : 'text-red-800'}`}>
                                        R$ {marginInfo.profit.toFixed(2)} ({marginInfo.margin.toFixed(1)}%)
                                    </div>
                                </div>
                            )}
                          </div>
                      </div>

                      {/* Inventory Section */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-2">
                              <Archive size={16} /> Estoque
                          </h3>
                           <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Atual</label>
                                    <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Package size={14} />
                                        </span>
                                        <input 
                                            type="number" 
                                            className="w-full pl-6 pr-2 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-center font-bold text-slate-700 text-lg bg-white shadow-sm"
                                            value={formData.stock || 0}
                                            onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Mínimo</label>
                                    <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
                                            <AlertCircle size={14} />
                                        </span>
                                        <input 
                                            type="number" 
                                            className="w-full pl-6 pr-2 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-center font-bold text-slate-700 text-lg bg-white shadow-sm"
                                            value={formData.minStock || 0}
                                            onChange={e => setFormData({...formData, minStock: parseInt(e.target.value)})}
                                        />
                                    </div>
                                </div>
                           </div>
                           
                           <div className="space-y-2 pt-2">
                                <label className="text-xs font-medium text-slate-600">Unidade de Medida</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {Object.values(UnitOfMeasure).map(u => (
                                        <button
                                            key={u}
                                            type="button"
                                            onClick={() => setFormData({...formData, unit: u})}
                                            className={`
                                                flex items-center justify-center py-2 rounded-lg text-xs font-bold transition-all border
                                                ${formData.unit === u 
                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105' 
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'}
                                            `}
                                        >
                                            {u}
                                        </button>
                                    ))}
                                </div>
                           </div>
                      </div>

                  </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/30 active:scale-95 transition-all flex items-center gap-2"
                >
                  <CheckCircle size={18} className="text-emerald-200"/>
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-all scale-100">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="text-red-600" size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Produto?</h3>
                <p className="text-slate-500 text-sm mb-6">
                    Tem certeza que deseja remover este produto? Esta ação não pode ser desfeita e afetará o histórico de estoque.
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 shadow-lg shadow-red-900/20 transition-all active:scale-95"
                    >
                        Sim, Excluir
                    </button>
                </div>
             </div>
        </div>
      )}

      {/* XML Import Modal */}
      {isXmlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="p-6 bg-indigo-600 text-white flex justify-between items-center shrink-0 sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet size={24} />
                        <div>
                            <h2 className="text-lg font-bold">Importar NFe (XML)</h2>
                            <p className="text-indigo-100 text-xs">Atualize estoque automaticamente</p>
                        </div>
                    </div>
                    <button onClick={() => { setIsXmlModalOpen(false); setXmlData(null); }} className="hover:bg-white/20 p-1.5 rounded-full"><X size={20}/></button>
                </div>

                <div className="p-8 space-y-6">
                    {/* Upload Area */}
                    {!xmlData && (
                        <div 
                            onClick={() => xmlInputRef.current?.click()}
                            className="border-2 border-dashed border-indigo-200 bg-indigo-50 rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-100 hover:border-indigo-300 transition-all group"
                        >
                            <input type="file" ref={xmlInputRef} onChange={handleXmlUpload} accept=".xml" className="hidden" />
                            <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="text-indigo-600" size={32} />
                            </div>
                            <p className="text-indigo-900 font-bold">Clique para selecionar o XML</p>
                            <p className="text-indigo-500 text-sm">Suporta NFe versão 4.00</p>
                            {xmlError && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><AlertCircle size={14}/> {xmlError}</p>}
                        </div>
                    )}

                    {/* Preview Area */}
                    {xmlData && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Dados do Fornecedor</h3>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-lg text-slate-800">{xmlData.supplier.name}</p>
                                        <p className="font-mono text-sm text-slate-500">{xmlData.supplier.document}</p>
                                    </div>
                                    <div className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                        <CheckCircle size={12} /> Detectado
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                    <Package size={14} /> Itens da Nota ({xmlData.items.length})
                                </h3>
                                <div className="border border-slate-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                            <tr>
                                                <th className="p-3">Produto</th>
                                                <th className="p-3 text-center">Qtd</th>
                                                <th className="p-3 text-right">Valor Un.</th>
                                                <th className="p-3 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {xmlData.items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="p-3">
                                                        <div className="font-medium text-slate-800">{item.name}</div>
                                                        <div className="text-xs text-slate-400 font-mono">{item.code}</div>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span className="font-bold text-slate-700">{item.quantity}</span> {item.unit}
                                                    </td>
                                                    <td className="p-3 text-right text-slate-600">R$ {item.unitPrice.toFixed(2)}</td>
                                                    <td className="p-3 text-right font-bold text-emerald-600">
                                                        R$ {(item.quantity * item.unitPrice).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setXmlData(null)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl">
                                    Cancelar
                                </button>
                                <button onClick={confirmXmlImport} className="flex-[2] py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-900/20 active:scale-95 transition-all">
                                    Confirmar Entrada no Estoque
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Products;
