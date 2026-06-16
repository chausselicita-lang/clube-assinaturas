# 🚀 Deployment Setup - Clube+ Assinaturas

Este guia configura o deploy automático no Vercel via GitHub Actions.

## ⚡ Quick Start (Fully Automated)

### Opção 1: PowerShell (Windows)

```powershell
# 1. Obtenha um token de acesso pessoal do GitHub
#    https://github.com/settings/tokens/new?scopes=repo,write:packages

# 2. Obtenha um token do Vercel
#    https://vercel.com/account/tokens

# 3. Execute o script de setup
$env:GITHUB_TOKEN = "your-github-token"
$env:VERCEL_TOKEN = "your-vercel-token"
.\scripts\auto-setup.ps1
```

### Opção 2: Bash (macOS/Linux)

```bash
# 1. Configure os tokens
export GITHUB_TOKEN="your-github-token"
export VERCEL_TOKEN="your-vercel-token"

# 2. Execute o script
bash ./scripts/setup-vercel-github.sh
```

## 📋 Manual Setup (if script fails)

### Pré-requisitos

```bash
# Instalar ferramentas
brew install gh vercel  # macOS
# ou usando chocolatey no Windows
choco install gh vercel

# Autenticar
gh auth login
vercel login
```

### Passo 1: Linking ao Vercel

```bash
cd clube-assinaturas
vercel link
# Selecione "Create a new project"
# Nome: clube-assinaturas
```

### Passo 2: Extrair Credenciais Vercel

```bash
# Após linkar, verifique o arquivo .vercel/project.json
cat .vercel/project.json
# Copie: projectId e orgId
```

### Passo 3: Gerar Token Vercel

Visite: https://vercel.com/account/tokens e crie um novo token

### Passo 4: Adicionar Secrets no GitHub

```bash
# Adicione os secrets
gh secret set VERCEL_TOKEN --repo chausselicita-lang/clube-assinaturas
# Cole o token quando solicitado

gh secret set VERCEL_ORG_ID --repo chausselicita-lang/clube-assinaturas
# Cole o orgId

gh secret set VERCEL_PROJECT_ID --repo chausselicita-lang/clube-assinaturas
# Cole o projectId

# Adicione também os secrets do Supabase
gh secret set NEXT_PUBLIC_SUPABASE_URL --repo chausselicita-lang/clube-assinaturas
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --repo chausselicita-lang/clube-assinaturas
```

### Passo 5: Verificar Secrets

```bash
# Liste os secrets configurados
gh secret list --repo chausselicita-lang/clube-assinaturas
```

## ✅ Verificar Setup

1. **GitHub Actions Workflow**
   - Visite: https://github.com/chausselicita-lang/clube-assinaturas/actions
   - Você deve ver a workflow "Deploy to Vercel"

2. **Secrets Configurados**
   - Visite: https://github.com/chausselicita-lang/clube-assinaturas/settings/secrets/actions
   - Você deve ver:
     - `VERCEL_TOKEN`
     - `VERCEL_ORG_ID`
     - `VERCEL_PROJECT_ID`
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Projeto Vercel**
   - Visite: https://vercel.com/dashboard
   - Você deve ver o projeto "clube-assinaturas"

## 🚀 Deploying

### Automático (Recomendado)

```bash
# Qualquer push para master dispara o deploy
git push origin master
```

O workflow:
1. ✅ Instala dependências (`npm ci`)
2. ✅ Roda linter (`npm run lint`)
3. ✅ Compila (`npm run build`)
4. ✅ Deploy no Vercel (automático)

### Manual

```bash
# Deploy direto via Vercel CLI
vercel --prod
```

## 📊 Monitorar Deployment

### GitHub Actions
```
https://github.com/chausselicita-lang/clube-assinaturas/actions
```

Clique no workflow "Deploy to Vercel" para ver logs detalhados.

### Vercel Dashboard
```
https://vercel.com/dashboard
```

Veja histórico de deployments e logs de build.

## 🔧 Troubleshooting

### Build falha no GitHub Actions

1. **Verifique os logs:**
   - GitHub → Actions → Último workflow → Clique no job

2. **Erros comuns:**
   - `NEXT_PUBLIC_SUPABASE_URL not set` → Configure os secrets
   - `npm ERR! 404` → Alguma dependência está quebrada
   - `TypeScript error` → Execute `npm run lint` localmente

### Deploy falha no Vercel

1. **Verifique a função `get_empresa_id()`:**
   - Certifique-se de que a RLS do Supabase está configurada
   - Veja `supabase/migrations/002_rls.sql`

2. **Problemas de runtime:**
   - Verifique as environment variables no Vercel Dashboard
   - Veja os logs do deployment em Vercel → Project → Deployments

### Secrets não estão sendo lidos

1. Verifique a ortografia (case-sensitive)
2. Regenere os secrets se os valores mudaram
3. Push novamente para o GitHub

## 📝 Estrutura de Arquivos

```
clube-assinaturas/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── .vercel/
│   └── project.json            # Credentials do projeto
├── scripts/
│   ├── auto-setup.ps1          # Setup automático (PowerShell)
│   ├── setup-vercel-github.ps1 # Setup assistido (PowerShell)
│   └── setup-vercel-github.sh  # Setup assistido (Bash)
├── vercel.json                 # Configuração do Vercel
└── DEPLOYMENT.md               # Este arquivo
```

## 🔐 Segurança

- **Nunca commite secrets** em arquivo `.env.local` ou `.env`
- Use apenas **GitHub Secrets** para dados sensíveis
- Tokens são **encriptados** no GitHub
- Verifique regularmente a validade dos tokens

## 📚 Referências

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel Integration](https://vercel.com/docs/git-integrations)
- [Vercel API Reference](https://vercel.com/docs/api)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

**Última atualização:** 2026-06-16
**Mantido por:** Claude Code
