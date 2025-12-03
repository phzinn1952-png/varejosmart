
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, FileText, Menu, X, BrainCircuit, LogOut, Building2, Wallet, Layers, Users, Truck, Calculator, MessageCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { logout, user, hasUnseenUpdates } = useAppContext();

  const isMaster = user?.role === UserRole.MASTER;
  const isManager = user?.role === UserRole.MANAGER;

  const retailNav: NavItem[] = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/pos', icon: <ShoppingCart size={20} />, label: 'PDV (Caixa)' },
    { to: '/products', icon: <Package size={20} />, label: 'Produtos' },
    { to: '/suppliers', icon: <Truck size={20} />, label: 'Fornecedores' },
    { to: '/calculator', icon: <Calculator size={20} />, label: 'Calculadora' },
    { to: '/whatsapp', icon: <MessageCircle size={20} />, label: 'WhatsApp' },
  ];

  if (isManager) {
      retailNav.push({ to: '/team', icon: <Users size={20} />, label: 'Equipe' });
  }

  // Common link - Renamed for Client with Badge Logic
  retailNav.push({ 
    to: '/spec', 
    icon: <FileText size={20} />, 
    label: 'Atualizações',
    badge: hasUnseenUpdates
  });

  const masterNav: NavItem[] = [
    { to: '/admin/tenants', icon: <Building2 size={20} />, label: 'Empresas / Clientes' },
    { to: '/admin/plans', icon: <Layers size={20} />, label: 'Planos & Tarifas' },
    { to: '/admin/financial', icon: <Wallet size={20} />, label: 'Financeiro SaaS' },
    { to: '/spec', icon: <FileText size={20} />, label: 'Documentação Técnica' },
  ];

  const navItems = isMaster ? masterNav : retailNav;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-emerald-950 text-white transition-transform duration-300 ease-in-out shadow-xl
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-emerald-900 border-b border-emerald-800">
          <div className="flex items-center space-x-2">
            <div className="bg-white p-1.5 rounded-lg">
                <BrainCircuit className="text-emerald-600" size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">VarejoSmart</span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-emerald-300 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {isMaster && (
             <div className="px-4 py-2 mb-4 text-xs font-semibold text-emerald-400 uppercase tracking-wider border-b border-emerald-800/50">
               Painel Administrativo
             </div>
          )}
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group relative
                ${isActive 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 translate-x-1' 
                  : 'text-emerald-100/70 hover:bg-emerald-900 hover:text-white hover:translate-x-1'}
              `}
            >
              <div className="flex items-center">
                  <span className={`transition-colors`}>
                    {item.icon}
                  </span>
                  <span className="ml-3 font-medium">{item.label}</span>
              </div>
              {item.badge && (
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-emerald-950"></span>
                  </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 m-4 rounded-xl bg-emerald-900/50 border border-emerald-800">
          <div className="flex items-center space-x-3 text-sm">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-emerald-400/30 ${isMaster ? 'bg-indigo-600' : 'bg-emerald-500'}`}>
              {user?.name.substring(0, 2).toUpperCase() || 'OP'}
            </div>
            <div className="overflow-hidden">
              <p className="text-white font-medium truncate">{user?.name || 'Operador'}</p>
              <div className="flex items-center text-emerald-300/80 text-xs">
                 <span className="w-2 h-2 rounded-full bg-green-400 mr-1.5 animate-pulse"></span>
                 {user?.role}
              </div>
            </div>
            <button 
                onClick={logout}
                className="ml-auto text-emerald-400 hover:text-white transition-colors p-1 rounded hover:bg-emerald-800"
                title="Sair"
            >
                <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shadow-sm z-10">
          <button onClick={toggleSidebar} className="lg:hidden text-slate-500 hover:text-emerald-600 transition-colors">
            <Menu size={24} />
          </button>
          
          <div className="flex items-center space-x-2 lg:hidden">
             <BrainCircuit className="text-emerald-600" size={24} />
             <span className="font-bold text-slate-700">VarejoSmart</span>
          </div>

          <div className="hidden lg:flex items-center space-x-4 ml-auto">
             <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${isMaster ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                {isMaster ? 'Modo Master Admin' : 'v1.0.4 AI Beta'}
             </div>
            <span className="text-sm text-slate-500 border-l border-slate-200 pl-4">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
