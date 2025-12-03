import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Product, CartItem, PaymentMethod } from '../types';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, User, CheckCircle, ShoppingBag } from 'lucide-react';

const POS: React.FC = () => {
  const { products, recordSale, customers } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('c1');
  const [isFinishing, setIsFinishing] = useState(false);
  const [discount, setDiscount] = useState(0);

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
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.salePrice }
            : item
        );
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
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, total: newQty * item.salePrice };
      }
      return item;
    }));
  };

  const handleFinishSale = () => {
    if (cart.length === 0) return;
    
    setIsFinishing(true);
    
    // Simulate API delay
    setTimeout(() => {
      recordSale(cart, finalTotal, selectedPayment, discount, selectedCustomer);
      setCart([]);
      setDiscount(0);
      setSearchTerm('');
      setIsFinishing(false);
      alert('Venda finalizada com sucesso!');
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
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className={`
                  group flex flex-col items-start text-left p-4 rounded-xl border transition-all duration-200
                  ${product.stock <= 0 
                    ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed' 
                    : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-900/5 hover:-translate-y-1'}
                `}
              >
                <div className="w-full aspect-square bg-slate-100 rounded-lg mb-3 overflow-hidden relative group-hover:ring-2 group-hover:ring-emerald-100 transition-all">
                    {product.image && <img src={product.image} alt={product.name} className="w-full h-full object-cover" />}
                    {product.stock <= product.minStock && product.stock > 0 && (
                        <span className="absolute top-1 right-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                            BAIXO
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
            cart.map(item => (
              <div key={item.id} className="flex gap-3 items-center bg-white p-2 rounded-lg border border-slate-100 hover:border-emerald-200 transition-colors shadow-sm">
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
                    className="p-1 hover:bg-white hover:text-emerald-600 rounded shadow-sm transition-all text-emerald-500"
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
            ))
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
    </div>
  );
};

export default POS;