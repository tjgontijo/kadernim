#!/bin/bash
set -e  # Para o script se qualquer comando falhar

print_box() {
    local message="$1"
    local length=${#message}
    local padding=3
    local border_length=$((length + padding * 2))
    
    printf '┌%*s┐\n' "$border_length" | tr ' ' '-'
    printf '│ %*s │\n' "$((length + padding))" "$message"
    printf '└%*s┘\n' "$border_length" | tr ' ' '-'
}

# Carregar variáveis de ambiente
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

print_box "🔄 Removendo diretórios e arquivos de desenvolvimento..."
rm -rf .next node_modules/@prisma/client node_modules/.cache node_modules/.prisma/client prisma/migrations package-lock.json || true

print_box "🗑️ Limpando cache do npm..."
npm cache clean --force

print_box "📦 Instalando dependências..."
npm install

print_box "🗑️ Resetando banco de dados..."

# Drop e recriar schema
echo "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;" | \
  DATABASE_URL="$DIRECT_URL" npx prisma db execute --schema prisma/schema.prisma --stdin || \
  { echo "❌ Erro ao resetar schema"; exit 1; }

print_box "📌 Sincronizando schema com banco..."
DATABASE_URL="$DIRECT_URL" npx prisma db push --accept-data-loss || \
  { echo "❌ Erro ao sincronizar schema"; exit 1; }

print_box "⚙️ Gerando Prisma Client..."
npx prisma generate || { echo "❌ Erro ao gerar Prisma Client"; exit 1; }

print_box "🌱 Populando banco de dados (seed)..."
NODE_OPTIONS='--no-warnings' npx tsx --tsconfig tsconfig.json prisma/seed.ts || \
  { echo "❌ Erro ao executar seed"; exit 1; }

print_box "✅ Banco de dados resetado e populado com sucesso!"
echo ""
echo "🚀 Agora você pode iniciar o servidor com: npm run dev"
