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

## 🐛 Troubleshooting

**Erro "API key must be set":**
- Configure `VITE_GEMINI_API_KEY` no arquivo `.env`

**Porta 3003 ou 3004 em uso:**
- Verifique processos: `netstat -ano | findstr :3003`
- Mate o processo: `taskkill //F //PID <pid>`

**WhatsApp não conecta:**
- Verifique se o servidor está rodando na porta 3004
- Limpe cache: delete `.wwebjs_auth/` e tente novamente

## 📄 Licença

Proprietary - VarejoSmart AI
