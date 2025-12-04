import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Product, CartItem, PaymentMethod } from '../types';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, User, CheckCircle, ShoppingBag, AlertTriangle, PackagePlus, X } from 'lucide-react';

const POS: React.FC = () => {
  const { products, recordSale, customers, updateProduct } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('c1');
  const [isFinishing, setIsFinishing] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [stockWarning, setStockWarning] = useState<string | null>(null);
  const [showQuickRestock, setShowQuickRestock] = useState(false);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQuantity, setRestockQuantity] = useState(0);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.status === 'ATIVO' && (
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.includes(searchTerm)
      )
    );
  }, [products, searchTerm]);

  // Cart calculations
  const cartTotal = cart.reduce((acc, item) => acc + item.total, 0);
  const finalTotal = Math.max(0, cartTotal - discount);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);

      if (existing) {
        // Verificar se há estoque para incrementar
        if (existing.quantity >= product.stock) {
          setStockWarning(`Estoque insuficiente: ${product.name} (disponível: ${product.stock})`);
          setTimeout(() => setStockWarning(null), 3000);
          return prev;
        }
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.salePrice }
            : item
        );
      }

      // Verificar estoque ao adicionar novo item
      if (product.stock <= 0) {
        setStockWarning(`Produto sem estoque: ${product.name}`);
        setTimeout(() => setStockWarning(null), 3000);
        return prev;
      }

      return [...prev, { ...product, quantity: 1, total: product.salePrice }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        // Encontrar o produto original para verificar estoque
        const product = products.find(p => p.id === productId);
        if (!product) return item;

        const newQty = item.quantity + delta;

        // Validações: quantidade mínima: 1, quantidade máxima: estoque do produto
        const validQty = Math.max(1, Math.min(newQty, product.stock));

        // Se tentou incrementar além do estoque, mostrar aviso
        if (delta > 0 && newQty > product.stock) {
          setStockWarning(`Estoque insuficiente: ${product.name} (disponível: ${product.stock})`);
          setTimeout(() => setStockWarning(null), 3000);
        }

        return { ...item, quantity: validQty, total: validQty * item.salePrice };
      }
      return item;
    }));
  };

  const handleQuickRestock = (product: Product) => {
    setRestockProduct(product);
    setRestockQuantity(product.minStock - product.stock);
    setShowQuickRestock(true);
  };

  const confirmRestock = () => {
    if (!restockProduct || restockQuantity <= 0) return;

    const updatedProduct = {
      ...restockProduct,
      stock: restockProduct.stock + restockQuantity
    };

    updateProduct(updatedProduct);

    setShowQuickRestock(false);
    setRestockProduct(null);
    setRestockQuantity(0);

    // Mostrar mensagem de sucesso
    setStockWarning(`✅ ${restockProduct.name} reabastecido: +${restockQuantity} un`);
    setTimeout(() => setStockWarning(null), 3000);
  };

  const handleFinishSale = () => {
    if (cart.length === 0) return;

    // Validar se há estoque suficiente antes de finalizar
    const insufficientStock = cart.find(item => {
      const product = products.find(p => p.id === item.id);
      return product && item.quantity > product.stock;
    });

    if (insufficientStock) {
      const product = products.find(p => p.id === insufficientStock.id);
      setStockWarning(`Estoque insuficiente para ${insufficientStock.name}. Disponível: ${product?.stock || 0} un`);
      setTimeout(() => setStockWarning(null), 4000);
      return;
    }

    setIsFinishing(true);

    // Simulate API delay
    setTimeout(() => {
      recordSale(cart, finalTotal, selectedPayment, discount, selectedCustomer);
      setCart([]);
      setDiscount(0);
      setSearchTerm('');
      setIsFinishing(false);

      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }, 800);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6">
      {/* Left Side - Product Catalog */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500" size={20} />
            <input
              type="text"
              placeholder="Buscar produto por nome, código ou barras..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className={`
                  group flex flex-col items-start text-left p-4 rounded-xl border transition-all duration-200 relative
                  ${product.stock <= 0
                    ? 'bg-slate-100 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-900/5'}
                `}
              >
                {/* Botão de reposição rápida */}
                {product.stock <= product.minStock && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickRestock(product);
                    }}
                    className="absolute top-2 right-2 z-10 p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-all opacity-0 group-hover:opacity-100"
                    title="Repor Estoque"
                  >
                    <PackagePlus size={16} />
                  </button>
                )}

                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0}
                  className="w-full flex flex-col items-start text-left"
                >
                  <div className="w-full aspect-square bg-slate-100 rounded-lg mb-3 overflow-hidden relative group-hover:ring-2 group-hover:ring-emerald-100 transition-all">
                      {product.image && <img src={product.image} alt={product.name} className="w-full h-full object-cover" />}
                      {product.stock <= product.minStock && product.stock > 0 && (
                          <span className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                              BAIXO
                          </span>
                      )}
                      {product.stock === 0 && (
                          <span className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                              SEM ESTOQUE
                          </span>
                      )}
                  </div>
                  <h3 className="font-semibold text-slate-800 line-clamp-2 text-sm h-10 group-hover:text-emerald-700">{product.name}</h3>
                  <div className="mt-2 w-full flex items-end justify-between">
                    <span className="text-lg font-bold text-emerald-600">
                      R$ {product.salePrice.toFixed(2)}
                    </span>
                    <span className={`text-xs ${product.stock === 0 ? 'text-red-500' : 'text-slate-500'}`}>
                      {product.stock} un
                    </span>
                  </div>
                </button>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
                <Search size={48} className="mb-4 opacity-20" />
                <p>Nenhum produto encontrado</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Cart & Checkout */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-xl shadow-lg border border-slate-200 h-full">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 bg-emerald-50 rounded-t-xl">
          <h2 className="font-bold text-emerald-900 flex items-center gap-2">
            <ShoppingBag size={20} className="text-emerald-600" />
            Carrinho de Compras
          </h2>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
              <ShoppingBag size={48} className="opacity-20 text-emerald-500" />
              <p>O carrinho está vazio</p>
              <p className="text-xs text-center px-8">Selecione produtos ao lado para iniciar uma venda</p>
            </div>
          ) : (
            cart.map(item => {
              const product = products.find(p => p.id === item.id);
              const isMaxStock = product && item.quantity >= product.stock;

              return (
                <div key={item.id} className="flex flex-col bg-white p-2 rounded-lg border border-slate-100 hover:border-emerald-200 transition-colors shadow-sm">
                  <div className="flex gap-3 items-center">
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 text-sm line-clamp-1">{item.name}</p>
                      <p className="text-emerald-600 font-semibold text-sm">
                        {item.quantity} x R$ {item.salePrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1 border border-slate-100">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-white hover:text-red-500 rounded shadow-sm transition-all text-slate-400"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-medium text-slate-700">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        disabled={isMaxStock}
                        className={`p-1 rounded shadow-sm transition-all ${
                          isMaxStock
                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                            : 'hover:bg-white hover:text-emerald-600 text-emerald-500'
                        }`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {isMaxStock && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 font-medium">
                      <AlertTriangle size={12} />
                      <span>Estoque máximo atingido</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Checkout Area */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl space-y-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          
          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-slate-500 text-sm">
              <span>Subtotal</span>
              <span>R$ {cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-sm items-center">
              <span>Desconto</span>
              <input 
                type="number" 
                value={discount} 
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-20 text-right bg-white border border-slate-300 rounded px-1 py-0.5 text-sm focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="flex justify-between text-emerald-900 font-bold text-xl pt-2 border-t border-slate-200">
              <span>Total</span>
              <span>R$ {finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 gap-2">
            <select 
              className="col-span-2 p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-slate-700"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            
            <button 
              onClick={() => setSelectedPayment(PaymentMethod.CASH)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition-all ${selectedPayment === PaymentMethod.CASH ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <Banknote size={16} className="mb-1" />
              Dinheiro
            </button>
            <button 
              onClick={() => setSelectedPayment(PaymentMethod.CREDIT_CARD)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition-all ${selectedPayment === PaymentMethod.CREDIT_CARD ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <CreditCard size={16} className="mb-1" />
              Cartão
            </button>
             <button 
              onClick={() => setSelectedPayment(PaymentMethod.PIX)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition-all ${selectedPayment === PaymentMethod.PIX ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <Smartphone size={16} className="mb-1" />
              Pix
            </button>
             <button 
              onClick={() => setSelectedPayment(PaymentMethod.CREDIT)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition-all ${selectedPayment === PaymentMethod.CREDIT ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <User size={16} className="mb-1" />
              Fiado
            </button>
          </div>

          <button
            onClick={handleFinishSale}
            disabled={cart.length === 0 || isFinishing}
            className={`
              w-full py-3.5 rounded-xl font-bold text-lg text-white shadow-lg transition-all flex items-center justify-center gap-2
              ${cart.length === 0 || isFinishing ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-900/30 active:scale-[0.98]'}
            `}
          >
            {isFinishing ? (
                <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    Processando...
                </>
            ) : (
                <>
                    <CheckCircle size={20} />
                    Finalizar Venda
                </>
            )}
          </button>
        </div>
      </div>

      {/* Success Toast Message */}
      {showSuccessMessage && (
        <div className="fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-[slideIn_0.3s_ease-out] z-50">
          <CheckCircle size={24} className="flex-shrink-0" />
          <div>
            <p className="font-semibold">Venda concluída</p>
            <p className="text-sm text-emerald-100">Registro salvo com sucesso</p>
          </div>
        </div>
      )}

      {/* Stock Warning Toast */}
      {stockWarning && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-[slideIn_0.3s_ease-out] z-50 ${
          stockWarning.startsWith('✅') ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
        }`}>
          {stockWarning.startsWith('✅') ? (
            <CheckCircle size={24} className="flex-shrink-0" />
          ) : (
            <AlertTriangle size={24} className="flex-shrink-0" />
          )}
          <div>
            <p className="font-semibold">{stockWarning.startsWith('✅') ? 'Sucesso' : 'Aviso'}</p>
            <p className={stockWarning.startsWith('✅') ? 'text-sm text-emerald-100' : 'text-sm text-amber-100'}>
              {stockWarning}
            </p>
          </div>
        </div>
      )}

      {/* Quick Restock Modal */}
      {showQuickRestock && restockProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowQuickRestock(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 bg-blue-50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                  <PackagePlus size={24} />
                  Repor Estoque
                </h3>
                <button onClick={() => setShowQuickRestock(false)} className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
                  <X size={20} className="text-slate-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">{restockProduct.name}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Estoque Atual</p>
                    <p className="font-bold text-red-600">{restockProduct.stock} un</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Estoque Mínimo</p>
                    <p className="font-bold text-slate-600">{restockProduct.minStock} un</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quantidade a Adicionar
                </label>
                <input
                  type="number"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-2">
                  Novo estoque: {restockProduct.stock + restockQuantity} un
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowQuickRestock(false)}
                  className="flex-1 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmRestock}
                  disabled={restockQuantity <= 0}
                  className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar Reposição
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;