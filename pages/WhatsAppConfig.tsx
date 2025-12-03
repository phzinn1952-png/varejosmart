import React, { useState, useEffect } from 'react';
import { MessageCircle, QrCode, Smartphone, CheckCircle, XCircle, Loader2, RefreshCw, LogOut, Send } from 'lucide-react';

interface WhatsAppStatus {
  status: 'disconnected' | 'connecting' | 'qr_pending' | 'authenticating' | 'connected';
  connected: boolean;
  phoneNumber?: string;
  qrCode?: string;
  lastActivity?: string;
  authMethod?: 'qr' | 'phone';
}

const WHATSAPP_API_URL = 'http://localhost:3004/api/whatsapp';

const WhatsAppConfig: React.FC = () => {
  const [status, setStatus] = useState<WhatsAppStatus>({
    status: 'disconnected',
    connected: false,
  });
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'qr' | 'phone'>('qr');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [testMessage, setTestMessage] = useState({
    to: '',
    message: '',
  });

  const tenantId = 'tenant_joao'; // TODO: Get from context

  // Polling for status updates
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${WHATSAPP_API_URL}/status/${tenantId}`);
        const data = await response.json();

        if (data.success) {
          setStatus(data);

          // If QR pending, get QR code
          if (data.status === 'qr_pending' && !qrCode) {
            fetchQRCode();
          }

          // Clear QR code if connected
          if (data.status === 'connected') {
            setQrCode(null);
          }
        }
      } catch (error) {
        console.error('Error checking status:', error);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 3000);

    return () => clearInterval(interval);
  }, [tenantId, qrCode]);

  const fetchQRCode = async () => {
    try {
      const response = await fetch(`${WHATSAPP_API_URL}/qr/${tenantId}`);
      const data = await response.json();

      if (data.success && data.qrCode) {
        setQrCode(data.qrCode);
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
    }
  };

  const handleConnectQR = async () => {
    setLoading(true);
    setQrCode(null);

    try {
      const response = await fetch(`${WHATSAPP_API_URL}/init/${tenantId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        // Wait for QR code
        setTimeout(fetchQRCode, 2000);
      } else {
        alert('Erro ao inicializar WhatsApp: ' + data.error);
      }
    } catch (error: any) {
      console.error('Error connecting:', error);
      alert('Erro ao conectar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectPhone = async () => {
    if (!phoneNumber) {
      alert('Digite um número de telefone');
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement phone auth
      alert('Autenticação por telefone em desenvolvimento. Use QR Code por enquanto.');
    } catch (error: any) {
      console.error('Error connecting with phone:', error);
      alert('Erro ao conectar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Deseja desconectar o WhatsApp?')) return;

    setLoading(true);

    try {
      const response = await fetch(`${WHATSAPP_API_URL}/disconnect/${tenantId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setQrCode(null);
        alert('WhatsApp desconectado com sucesso!');
      } else {
        alert('Erro ao desconectar: ' + data.error);
      }
    } catch (error: any) {
      console.error('Error disconnecting:', error);
      alert('Erro ao desconectar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm('Deseja fazer logout e remover os dados da sessão?')) return;

    setLoading(true);

    try {
      const response = await fetch(`${WHATSAPP_API_URL}/logout/${tenantId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setQrCode(null);
        alert('Logout realizado com sucesso!');
      } else {
        alert('Erro ao fazer logout: ' + data.error);
      }
    } catch (error: any) {
      console.error('Error logging out:', error);
      alert('Erro ao fazer logout: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testMessage.to || !testMessage.message) {
      alert('Preencha o número e a mensagem');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${WHATSAPP_API_URL}/send/${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testMessage),
      });

      const data = await response.json();

      if (data.success) {
        alert('Mensagem enviada com sucesso!');
        setTestMessage({ to: '', message: '' });
      } else {
        alert('Erro ao enviar: ' + data.error);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert('Erro ao enviar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'connected':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'connecting':
      case 'qr_pending':
      case 'authenticating':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'connected':
        return 'Conectado';
      case 'connecting':
        return 'Conectando...';
      case 'qr_pending':
        return 'Aguardando QR Code';
      case 'authenticating':
        return 'Autenticando...';
      default:
        return 'Desconectado';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <MessageCircle className="text-green-600" size={32} />
            Configuração do WhatsApp
          </h1>
          <p className="text-slate-600 mt-2">
            Conecte seu WhatsApp para enviar mensagens automáticas aos clientes
          </p>
        </div>

        <div className={`px-4 py-2 rounded-lg border ${getStatusColor()} flex items-center gap-2 font-medium`}>
          {status.connected ? (
            <CheckCircle size={20} />
          ) : (
            <XCircle size={20} />
          )}
          {getStatusText()}
        </div>
      </div>

      {/* Status Card */}
      {status.connected && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-green-900 text-lg mb-2">WhatsApp Conectado</h3>
              <div className="space-y-1 text-green-700">
                <p>📱 Número: +{status.phoneNumber}</p>
                <p>🔐 Método: {status.authMethod === 'qr' ? 'QR Code' : 'Telefone'}</p>
                {status.lastActivity && (
                  <p className="text-sm">
                    Última atividade: {new Date(status.lastActivity).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Desconectar
              </button>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Methods */}
      {!status.connected && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200">
            <div className="flex">
              <button
                onClick={() => setAuthMethod('qr')}
                className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
                  authMethod === 'qr'
                    ? 'bg-white text-green-600 border-b-2 border-green-600'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <QrCode size={20} />
                QR Code
              </button>
              <button
                onClick={() => setAuthMethod('phone')}
                className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
                  authMethod === 'phone'
                    ? 'bg-white text-green-600 border-b-2 border-green-600'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Smartphone size={20} />
                Número + Código
              </button>
            </div>
          </div>

          <div className="p-6">
            {authMethod === 'qr' ? (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-bold text-slate-800 text-lg mb-2">
                    Conectar via QR Code
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Escaneie o QR Code com o WhatsApp do seu telefone
                  </p>

                  {qrCode ? (
                    <div className="inline-block p-4 bg-white border border-slate-200 rounded-xl">
                      <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                      <p className="text-sm text-slate-600 mt-4">
                        Abra o WhatsApp → Dispositivos Conectados → Conectar Dispositivo
                      </p>
                    </div>
                  ) : (
                    <div className="inline-block p-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl">
                      <QrCode size={64} className="mx-auto text-slate-400 mb-4" />
                      <p className="text-slate-600">QR Code será exibido aqui</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleConnectQR}
                  disabled={loading || status.status === 'qr_pending'}
                  className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <QrCode size={20} />
                      {qrCode ? 'Gerar Novo QR Code' : 'Gerar QR Code'}
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg mb-2">
                    Conectar via Número + Código
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Digite seu número e confirme com o código SMS
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Número de Telefone
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Código de Verificação
                      </label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="000-000"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <p className="text-sm text-slate-500 mt-2">
                        Será enviado um código SMS para confirmar
                      </p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        ⚠️ <strong>Funcionalidade em desenvolvimento</strong><br />
                        Por enquanto, use a autenticação via QR Code
                      </p>
                    </div>

                    <button
                      onClick={handleConnectPhone}
                      disabled={true}
                      className="w-full py-3 bg-slate-400 text-white font-medium rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Smartphone size={20} />
                      Conectar (Em Breve)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Message */}
      {status.connected && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
            <Send size={20} className="text-green-600" />
            Enviar Mensagem de Teste
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Número do Destinatário
              </label>
              <input
                type="tel"
                value={testMessage.to}
                onChange={(e) => setTestMessage({ ...testMessage, to: e.target.value })}
                placeholder="(11) 99999-9999"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mensagem
              </label>
              <textarea
                value={testMessage.message}
                onChange={(e) => setTestMessage({ ...testMessage, message: e.target.value })}
                placeholder="Digite sua mensagem..."
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            <button
              onClick={handleSendTestMessage}
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Enviar Mensagem
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppConfig;
