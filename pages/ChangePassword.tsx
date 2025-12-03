import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, BrainCircuit } from 'lucide-react';

const ChangePassword: React.FC = () => {
  const { changePassword, user } = useAppContext();
  const navigate = useNavigate();
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
        alert("As senhas não coincidem.");
        return;
    }
    if (newPass.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres.");
        return;
    }

    setLoading(true);
    await changePassword(newPass);
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-emerald-50 rounded-xl mb-4">
               <BrainCircuit className="text-emerald-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Troca de Senha Obrigatória</h2>
            <p className="text-slate-500 mt-2 text-sm">Olá, {user?.name}. Por segurança, você deve redefinir sua senha no primeiro acesso.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nova Senha</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="password" 
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
                        placeholder="••••••••"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Confirmar Senha</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="password" 
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
                        placeholder="••••••••"
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2"
            >
                {loading ? 'Atualizando...' : <><CheckCircle size={18} /> Atualizar Senha</>}
            </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;