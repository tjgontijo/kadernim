#!/bin/bash
set -euo pipefail

# Função para imprimir mensagens em caixas
print_box() {
  local message="$1"
  local length=${#message}
  local padding=3
  local border_length=$((length + padding * 2))

  echo ""
  printf '┌%*s┐\n' "$border_length" | tr ' ' '-'
  printf '│ %*s │\n' "$((length + padding))" "$message"
  printf '└%*s┘\n' "$border_length" | tr ' ' '-'
}

# 1. Limpeza Inicial do Cloudinary (Obrigatória/Opcional conforme desejo do usuário)
print_box "🧹 Preparação: Limpeza do Cloudinary"
echo ""
read -t 30 -p "❓ Deseja apagar TODOS os arquivos do Cloudinary ante de prosseguir? (s/N): " -n 1 cloud_answer || cloud_answer="n"
echo ""

if [[ "$cloud_answer" =~ ^[Ss]$ ]]; then
  print_box "🧹 Removendo arquivos do Cloudinary..."
  npx tsx scripts/clear-cloudinary.ts
fi

# 1.1 Limpeza do Cloudflare R2
print_box "🧹 Preparação: Limpeza do Cloudflare R2"
echo ""
read -t 30 -p "❓ Deseja apagar TODOS os arquivos do R2 (PDFs) antes de prosseguir? (s/N): " -n 1 r2_answer || r2_answer="n"
echo ""

if [[ "$r2_answer" =~ ^[Ss]$ ]]; then
  print_box "🧹 Removendo arquivos do R2..."
  npx tsx scripts/clear-r2.ts
fi

# 2. Limpeza de arquivos locais e cache
print_box "� Limpando arquivos locais e cache..."
rm -rf .next .turbo node_modules/.cache prisma/generated public/sw.js public/manifest.webmanifest public/*.map public/*.js || true
npm cache clean --force

# 3. Instalação de dependências
print_box "📦 Verificando dependências..."
npm install

# 4. Reset do Banco de Dados e Migrations
print_box "🗑️ Resetando Banco de Dados e Migrations..."
rm -rf prisma/migrations || true

# Criar schema
npx prisma db execute --stdin <<'EOF'
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;
EOF

# Criar migration inicial (baseline)
print_box "📦 Criando migration inicial (init)..."
npx prisma migrate dev --name init

print_box "🔄 Gerando Prisma Client..."
npx prisma generate

# 5. População de Dados (Seed)
print_box "🌱 Populando Banco de Dados (Seed)..."
TRUNCATE_DB=1 npx prisma db seed

# 6. Finalização (Build)
print_box "🚀 Gerando build da aplicação..."
npm run build

print_box "✅ Processo de Reset concluído com sucesso!"
