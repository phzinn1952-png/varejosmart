import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { BrainCircuit, ArrowRight, Lock, Mail, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [adjectiveIndex, setAdjectiveIndex] = useState(0);
  const [isAnimatingText, setIsAnimatingText] = useState(false);

  const adjectives = [
    "Moderno",
    "Prático",
    "Inteligente",
    "Seguro",
    "Eficiente"
  ];

  // Rotating text effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimatingText(true);
      setTimeout(() => {
        setAdjectiveIndex((prev) => (prev + 1) % adjectives.length);
        setIsAnimatingText(false);
      }, 500); // Half of the transition time
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await login(email, password);
    // No need to set loading false here as the component will unmount/redirect
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      
      {/* Left Side: Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12 animate-fade-in relative z-10 bg-white">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center md:text-left">
            <div className="inline-flex md:hidden items-center justify-center p-3 bg-emerald-50 rounded-xl mb-6">
               <BrainCircuit className="text-emerald-600" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Bem-vindo</h2>
            <p className="text-slate-500 mt-2">Acesse sua conta para gerenciar seu negócio.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3.5 border border-slate-300 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm sm:text-sm focus:bg-white"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Senha</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full pl-10 pr-10 py-3.5 border border-slate-300 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm sm:text-sm focus:bg-white"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember_me" className="ml-2 block text-sm text-slate-600 cursor-pointer select-none">
                  Lembrar de mim
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`
                group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white 
                bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 
                transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-900/20 active:scale-[0.98]
                ${isLoading ? 'cursor-not-allowed opacity-80' : ''}
              `}
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <span className="flex items-center">
                  Entrar
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-slate-400">
            &copy; 2025 VarejoSmart AI. Todos os direitos reservados.
          </div>
        </div>
      </div>

      {/* Right Side: Branding */}
      <div className="hidden md:flex md:w-1/2 bg-emerald-950 relative overflow-hidden items-center justify-center p-12">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-20 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Diagonal Divider Line */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent opacity-5 skew-x-[-12deg] -ml-12 pointer-events-none"></div>

        <div className="relative z-10 text-center text-white max-w-lg">
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl">
              <BrainCircuit size={64} className="text-emerald-400" />
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Gestão Inteligente
          </h1>
          
          <div className="h-20 flex items-center justify-center">
            <p className="text-2xl lg:text-3xl text-emerald-100 font-light flex flex-col items-center">
              <span>Seu sistema</span>
              <span 
                className={`
                  font-bold text-white mt-1 relative inline-block transition-all duration-500 ease-in-out transform
                  ${isAnimatingText ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'}
                `}
              >
                {adjectives[adjectiveIndex]}
                <span className="absolute -right-6 top-0 text-emerald-400 text-sm">
                   <CheckCircle size={16} fill="currentColor" className="text-emerald-400" />
                </span>
              </span>
            </p>
          </div>

          <p className="mt-8 text-emerald-200/80 text-sm leading-relaxed max-w-sm mx-auto">
            Utilize o poder da Inteligência Artificial para otimizar suas vendas, controlar seu estoque e impulsionar seus lucros.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;