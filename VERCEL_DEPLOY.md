# 🚀 Guia de Deploy no Vercel

Este guia explica como fazer deploy do VarejoSmart AI no Vercel e configurar a IA Gemini.

## 📋 Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. Chave da API do Google Gemini ([obter aqui](https://makersuite.google.com/app/apikey))
3. Vercel CLI instalado (opcional, mas recomendado)

## 🔧 Passo a Passo

### Opção 1: Deploy via CLI (Recomendado)

```bash
# 1. Instale o Vercel CLI globalmente
npm i -g vercel

# 2. Faça login no Vercel
vercel login

# 3. Deploy do projeto
vercel

# Siga as instruções:
# - Set up and deploy? Yes
# - Which scope? Selecione sua conta
# - Link to existing project? No
# - What's your project's name? varejosmart-ai (ou outro nome)
# - In which directory is your code located? ./
# - Want to override the settings? No

# 4. Após o deploy, configure as variáveis de ambiente (veja seção abaixo)
```

### Opção 2: Deploy via GitHub

1. Faça push do código para um repositório GitHub
2. Acesse [vercel.com/new](https://vercel.com/new)
3. Selecione o repositório
4. Configure as variáveis de ambiente (veja seção abaixo)
5. Clique em "Deploy"

## ⚙️ Configurar Variáveis de Ambiente

**CRUCIAL:** A IA só funcionará após configurar a API Key:

1. Acesse o [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione a seguinte variável:

   | Name | Value | Environments |
   |------|-------|--------------|
   | `VITE_GEMINI_API_KEY` | Sua chave da API Gemini | ✅ Production<br>✅ Preview<br>✅ Development |

5. Clique em **Save**
6. **Importante:** Faça um novo deploy para aplicar:
   ```bash
   vercel --prod
   ```
   Ou pelo dashboard: **Deployments** → **⋯** → **Redeploy**

## ✅ Verificar se Funcionou

Após o deploy e configuração:

1. Acesse seu site no Vercel
2. Faça login com as credenciais padrão
3. Vá para o **Dashboard**
4. Clique em **"Obter Insights com IA"**
5. Se aparecer a mensagem de API Key não configurada, refaça o deploy

## 🔍 Troubleshooting

### IA não funciona (mensagem de API Key não configurada)

**Solução:**
1. Verifique se a variável `VITE_GEMINI_API_KEY` está no Vercel
2. Certifique-se de que marcou "Production" ao adicionar
3. Faça um novo deploy (redeploy)
4. Limpe o cache do navegador (Ctrl+Shift+Delete)

### Erro de build no Vercel

**Solução:**
```bash
# Teste o build localmente primeiro
npm run build

# Se funcionar local mas falhar no Vercel, verifique:
# 1. node_modules está no .gitignore
# 2. package-lock.json está commitado
# 3. Versão do Node.js no Vercel (Settings → General → Node.js Version)
```

### Dados sumiram após deploy

**Explicação:**
- Os dados ficam no `localStorage` do navegador do cliente
- Cada usuário/navegador tem seus próprios dados
- Deploy não afeta dados existentes

**Solução:**
- Use a função de backup/restore na página de Produtos
- Exporte os dados regularmente
- Compartilhe o arquivo JSON exportado entre dispositivos

### WhatsApp não funciona no Vercel

**Explicação:**
- O servidor WhatsApp (Node.js Express) não pode rodar no Vercel
- WhatsApp funciona apenas em ambiente local

**Soluções:**
1. **Para produção:** Use um servidor separado (Heroku, Railway, VPS)
2. **Híbrido:** Frontend no Vercel + Backend WhatsApp em outro servidor
3. **Desenvolvimento:** Continue usando localmente

## 📊 Monitoramento

### Ver logs do Vercel

```bash
# Via CLI
vercel logs

# Via Dashboard
Acesse: Deployments → Selecione um deploy → Runtime Logs
```

### Métricas de uso

- **Dashboard Vercel:** Analytics, Web Vitals
- **Gemini API:** [Console do Google](https://console.cloud.google.com)

## 🔐 Segurança

- ✅ Nunca commite o arquivo `.env` com a API Key
- ✅ Use Environment Variables do Vercel
- ✅ A API Key fica oculta no build (não exposta no frontend)
- ✅ Limites de rate da API Gemini são por conta

## 🆘 Suporte

- **Vercel:** https://vercel.com/support
- **Gemini API:** https://ai.google.dev/docs
- **Issues do Projeto:** https://github.com/seu-repo/issues

---

**Criado com ❤️ para VarejoSmart AI**
