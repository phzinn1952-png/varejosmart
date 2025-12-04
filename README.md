# VarejoSmart AI 🛒

Sistema de gestão para varejo com IA integrada e WhatsApp.

## 🚀 Início Rápido

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Banco de Dados

```bash
npm run db:setup
```

### 3. Configurar Variáveis de Ambiente

Edite o arquivo `.env` e adicione sua chave do Google Gemini AI:

```env
VITE_GEMINI_API_KEY=sua_chave_aqui
```

**Obter chave do Gemini:** https://makersuite.google.com/app/apikey

### 4. Iniciar Servidores

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - WhatsApp API:**
```bash
npm run whatsapp
```

## 📱 Acessar o Sistema

- **Frontend:** http://localhost:3003
- **WhatsApp API:** http://localhost:3004

### Login Padrão

**Gerente:**
- Email: `joao@mercado.com`
- Senha: `123456`

**Operador:**
- Email: `maria@mercado.com`
- Senha: `123456`

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run whatsapp     # Inicia servidor WhatsApp API

# Banco de Dados
npm run db:setup     # Cria e inicializa o banco
npm run db:migrate   # Executa migrations
npm run db:rollback  # Reverte última migration
npm run db:test      # Testa conexão do banco
```

## 🎯 Funcionalidades

### ✅ Implementado

- **Dashboard** - Visão geral de vendas e métricas
- **PDV (Ponto de Venda)** - Sistema de caixa completo
- **Gestão de Produtos** - CRUD completo com estoque
- **Fornecedores** - Cadastro de fornecedores
- **Calculadora de Preços** - Calcula margem e markup
- **Equipe** - Gestão de usuários (apenas gerente)
- **WhatsApp** - Integração com autenticação via QR Code
- **IA Gemini** - Insights de vendas e descrições de produtos
- **Banco SQLite** - Persistência segura com bcrypt

### 🔧 Tecnologias

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS
- **Backend:** Express.js (WhatsApp API)
- **Banco:** SQLite com better-sqlite3
- **Segurança:** bcrypt para senhas
- **IA:** Google Gemini AI
- **WhatsApp:** whatsapp-web.js

## 📦 Estrutura do Projeto

```
VS/
├── components/       # Componentes React
├── pages/           # Páginas da aplicação
├── services/        # Serviços (Gemini, Auth)
├── server/          # Servidor WhatsApp API
│   ├── services/    # WhatsApp Service
│   └── whatsappServer.ts
├── db/              # Banco de dados
│   ├── migrations/  # Migrations SQL
│   ├── repositories/# Camada de dados
│   └── database.ts  # Conexão SQLite
├── context/         # React Context
├── types.ts         # TypeScript types
└── constants.ts     # Constantes
```

## 🔐 Segurança

- Senhas criptografadas com bcrypt (10 rounds)
- Sessões WhatsApp isoladas por tenant
- CORS configurado para origins específicos
- Validação de dados no backend
- SQL Injection protegido com prepared statements

## 📝 Notas

- O WhatsApp requer scan do QR Code na primeira vez
- A API do Gemini é opcional (sistema funciona sem ela)
- Sessões WhatsApp ficam em `.wwebjs_auth/` (não commitadas)
- Banco de dados SQLite em `db/varejosmart.db`

## ☁️ Deploy no Vercel

### 1. Fazer Deploy

```bash
# Instale o Vercel CLI (se ainda não tiver)
npm i -g vercel

# Faça login no Vercel
vercel login

# Deploy do projeto
vercel
```

### 2. Configurar Variáveis de Ambiente no Vercel

**IMPORTANTE:** Após o deploy, configure a API Key do Gemini:

1. Acesse seu projeto no [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá em **Settings** → **Environment Variables**
3. Adicione a variável:
   - **Name:** `VITE_GEMINI_API_KEY`
   - **Value:** Sua chave da API Gemini
   - **Environments:** Production, Preview, Development

4. Faça um novo deploy para aplicar as mudanças:
   ```bash
   vercel --prod
   ```

**Obter chave do Gemini:** https://makersuite.google.com/app/apikey

### 3. Persistência de Dados

- **Desenvolvimento Local:** Usa localStorage do navegador
- **Produção (Vercel):** Usa localStorage do navegador
- **Backup/Restore:** Use a função de exportar/importar dados na página de Produtos

⚠️ **Importante:** Os dados ficam salvos no navegador do cliente. Para backup, exporte os dados regularmente.

## 🐛 Troubleshooting

**IA não funciona no Vercel:**
- Verifique se a variável `VITE_GEMINI_API_KEY` está configurada no Vercel
- Faça um novo deploy após adicionar a variável
- Verifique os logs do Vercel: `vercel logs`

**Erro "API key must be set":**
- **Local:** Configure `VITE_GEMINI_API_KEY` no arquivo `.env`
- **Vercel:** Configure nas Environment Variables do projeto

**Porta 3003 ou 3004 em uso:**
- Verifique processos: `netstat -ano | findstr :3003`
- Mate o processo: `taskkill //F //PID <pid>`

**WhatsApp não conecta:**
- **Local:** Verifique se o servidor está rodando na porta 3004
- **Local:** Limpe cache: delete `.wwebjs_auth/` e tente novamente
- **Vercel:** WhatsApp requer servidor separado - veja [WHATSAPP_DEPLOY.md](WHATSAPP_DEPLOY.md)

**Dados sumiram após deploy:**
- Os dados ficam no localStorage do navegador
- Faça backup regularmente usando a função de exportar
- Cada navegador/dispositivo tem seus próprios dados

## 📱 WhatsApp em Produção

⚠️ **IMPORTANTE:** O WhatsApp Web.js **não funciona diretamente no Vercel** porque requer um servidor Node.js persistente.

### Soluções:

1. **Frontend no Vercel + Backend Separado** (Recomendado)
   - Frontend React no Vercel (grátis)
   - Backend WhatsApp no Railway/Render (grátis ou ~$5/mês)
   - Guia completo: [WHATSAPP_DEPLOY.md](WHATSAPP_DEPLOY.md)

2. **Desenvolvimento Local**
   - Rode tudo localmente: `npm run dev` + `npm run whatsapp`
   - Ideal para testes e desenvolvimento

3. **VPS Único**
   - Deploy completo em VPS (DigitalOcean, Linode)
   - Custo: ~$5-10/mês
   - Melhor para produção séria

📖 **Documentação completa:** [WHATSAPP_DEPLOY.md](WHATSAPP_DEPLOY.md)

## 📄 Licença

Proprietary - VarejoSmart AI
