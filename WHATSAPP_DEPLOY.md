# 📱 Guia de Deploy do WhatsApp

## ⚠️ Limitação Importante

O **WhatsApp Web.js** requer um servidor Node.js **persistente** que fica continuamente conectado. O Vercel é uma plataforma **serverless**, o que significa que:

- ❌ Não mantém processos rodando continuamente
- ❌ Cada requisição inicia e encerra um processo
- ❌ Não é possível manter a sessão do WhatsApp ativa

**Conclusão:** O servidor WhatsApp **NÃO pode** rodar diretamente no Vercel.

## 🏗️ Arquitetura Recomendada

### Opção 1: Frontend no Vercel + Backend em Servidor Separado (Recomendado)

```
┌─────────────────┐         ┌──────────────────┐
│  Frontend       │         │  Backend         │
│  (Vercel)       │ ◄─────► │  WhatsApp API    │
│  React App      │  HTTPS  │  (Railway/Render)│
└─────────────────┘         └──────────────────┘
```

**Vantagens:**
- ✅ Frontend estático e rápido no Vercel
- ✅ Backend persistente para WhatsApp
- ✅ Escalável e profissional
- ✅ Separação de responsabilidades

### Opção 2: Tudo Local (Desenvolvimento)

```
┌─────────────────────────────┐
│  Localhost                  │
│  - Frontend: :3003          │
│  - Backend WhatsApp: :3004  │
└─────────────────────────────┘
```

**Uso:** Apenas desenvolvimento local

---

## 🚀 Solução: Frontend Vercel + Backend Railway

### Parte 1: Deploy do Frontend no Vercel

1. **Remover servidor WhatsApp do build**

Edite `package.json` e adicione:
```json
{
  "scripts": {
    "build": "vite build",
    "build:full": "npm run build && npm run build:server"
  }
}
```

2. **Deploy no Vercel**
```bash
vercel
```

3. **Configurar variáveis de ambiente no Vercel**
- `VITE_GEMINI_API_KEY`: Sua chave do Gemini
- `VITE_WHATSAPP_API_URL`: URL do servidor WhatsApp (configurar após parte 2)

### Parte 2: Deploy do Backend WhatsApp no Railway

#### Passo 1: Criar conta no Railway

1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique em **"New Project"**

#### Passo 2: Preparar o código

1. **Criar arquivo `server.js` na raiz do projeto:**

```javascript
// server.js - Servidor standalone para Railway
import express from 'express';
import cors from 'cors';
import { whatsappService } from './server/services/whatsappService.js';

const app = express();
const PORT = process.env.PORT || 3004;

// CORS configurado para aceitar o frontend do Vercel
app.use(cors({
  origin: [
    'http://localhost:3003',
    process.env.FRONTEND_URL || 'https://seu-app.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'WhatsApp API' });
});

// Todas as rotas do WhatsApp
app.post('/api/whatsapp/init/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    await whatsappService.initializeClient(tenantId);
    res.json({ success: true, message: 'WhatsApp client initialized', status: 'qr_pending' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/whatsapp/status/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const status = whatsappService.getStatus(tenantId);
    res.json({ success: true, ...status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/whatsapp/qr/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const qrCode = whatsappService.getQRCode(tenantId);

    if (!qrCode) {
      return res.json({ success: false, error: 'QR Code not available' });
    }

    res.json({ success: true, qrCode });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/whatsapp/send/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ success: false, error: 'Missing to or message' });
    }

    const result = await whatsappService.sendMessage(tenantId, to, message);
    res.json({ success: true, messageId: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/whatsapp/disconnect/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    await whatsappService.disconnect(tenantId);
    res.json({ success: true, message: 'Disconnected successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/whatsapp/logout/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    await whatsappService.logout(tenantId);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 WhatsApp API Server running on port ${PORT}`);
  console.log(`📱 Health check: http://0.0.0.0:${PORT}/health`);
});
```

2. **Criar `package-server.json`:**

```json
{
  "name": "varejosmart-whatsapp-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^5.2.1",
    "cors": "^2.8.5",
    "whatsapp-web.js": "^1.34.2",
    "qrcode": "^1.5.4"
  }
}
```

#### Passo 3: Deploy no Railway

1. **Via GitHub (Recomendado):**
   - Crie um repositório separado para o backend
   - Faça push do código
   - No Railway, selecione **"Deploy from GitHub repo"**
   - Selecione o repositório do backend

2. **Ou via Railway CLI:**
```bash
# Instale o Railway CLI
npm i -g @railway/cli

# Faça login
railway login

# Crie um novo projeto
railway init

# Deploy
railway up
```

#### Passo 4: Configurar Variáveis de Ambiente no Railway

No painel do Railway, adicione:
- `PORT`: 3004 (ou deixe vazio, Railway define automaticamente)
- `FRONTEND_URL`: URL do seu frontend no Vercel (ex: `https://seu-app.vercel.app`)

#### Passo 5: Conectar Frontend ao Backend

1. Copie a URL do Railway (ex: `https://seu-backend.railway.app`)
2. No Vercel, adicione a variável:
   - `VITE_WHATSAPP_API_URL`: `https://seu-backend.railway.app`
3. Faça redeploy no Vercel

### Parte 3: Atualizar Frontend para Usar URL Dinâmica

Edite `pages/WhatsAppConfig.tsx`:

```typescript
// Trocar:
const WHATSAPP_API_URL = 'http://localhost:3004/api/whatsapp';

// Por:
const WHATSAPP_API_URL = import.meta.env.VITE_WHATSAPP_API_URL
  ? `${import.meta.env.VITE_WHATSAPP_API_URL}/api/whatsapp`
  : 'http://localhost:3004/api/whatsapp';
```

---

## 🆓 Alternativas Gratuitas para Backend

### 1. **Railway** (Recomendado)
- ✅ $5 de crédito gratuito/mês
- ✅ Deploy automático do GitHub
- ✅ SSL grátis
- ✅ Fácil de usar
- 🔗 [railway.app](https://railway.app)

### 2. **Render**
- ✅ 750 horas gratuitas/mês
- ✅ Deploy do GitHub
- ✅ SSL grátis
- ⚠️ Pode dormir após inatividade
- 🔗 [render.com](https://render.com)

### 3. **Fly.io**
- ✅ Nível gratuito generoso
- ✅ Múltiplas regiões
- ⚠️ Requer cartão de crédito
- 🔗 [fly.io](https://fly.io)

### 4. **Heroku**
- ⚠️ Não tem mais tier gratuito
- 💰 $7/mês
- 🔗 [heroku.com](https://heroku.com)

---

## 🧪 Testando a Integração

Após configurar tudo:

1. **Teste o backend:**
```bash
curl https://seu-backend.railway.app/health
```

Deve retornar:
```json
{"status":"ok","service":"WhatsApp API"}
```

2. **Teste o frontend:**
   - Acesse seu app no Vercel
   - Vá para a página WhatsApp
   - Clique em "Gerar QR Code"
   - Verifique se o QR Code aparece

---

## 📊 Custos Estimados

| Serviço | Frontend | Backend WhatsApp | Total/mês |
|---------|----------|------------------|-----------|
| Vercel + Railway | Grátis | $5 créditos | **Grátis** |
| Vercel + Render | Grátis | Grátis* | **Grátis** |
| Vercel + Fly.io | Grátis | Grátis** | **Grátis** |

*Render pode dormir após inatividade
**Fly.io requer cartão de crédito

---

## 🆘 Troubleshooting

### WhatsApp não conecta
```bash
# Verificar logs no Railway
railway logs

# Verificar se o backend está online
curl https://seu-backend.railway.app/health
```

### CORS Error
- Verifique se `FRONTEND_URL` está configurado corretamente no Railway
- Adicione a URL do Vercel na lista de origens permitidas

### QR Code não aparece
- Verifique console do navegador (F12)
- Verifique se `VITE_WHATSAPP_API_URL` está configurado no Vercel
- Teste a rota diretamente: `https://seu-backend.railway.app/api/whatsapp/status/tenant_joao`

---

**💡 Dica:** Para produção, considere usar um VPS (DigitalOcean, Linode) que custa ~$5/mês e roda tudo no mesmo servidor.
