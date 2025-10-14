#!/bin/bash

set -e  # Para o script imediatamente se qualquer comando falhar

print_box() {
    local message="$1"
    local length=${#message}
    local padding=3
    local border_length=$((length + padding * 2))
    
    printf '┌%*s┐\n' "$border_length" | tr ' ' '-'
    printf '│ %*s │\n' "$((length + padding))" "$message"
    printf '└%*s┘\n' "$border_length" | tr ' ' '-'
}

print_box "🔄 Removendo diretórios e arquivos de desenvolvimento..."
rm -rf .next node_modules/@prisma/client node_modules/.cache node_modules/.prisma/client prisma/migrations || true

print_box "🗑️ Limpando cache do npm..."
npm cache clean --force

print_box "📦 Instalando dependências..."
npm install

print_box "🗄️ Dropando todas as tabelas do banco (NeonDB)..."
# Temporariamente remover prisma.config.ts para permitir carregamento do .env
if [ -f "prisma.config.ts" ]; then
  mv prisma.config.ts prisma.config.ts.tmp
fi

# Drop schema - Método NeonDB
npx prisma db execute --schema prisma/schema.prisma --stdin <<SQL
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;
SQL

print_box "📌 Criando migration inicial..."
npx prisma migrate dev --name init --skip-seed

print_box "⚙️ Gerando cliente do Prisma..."
npx prisma generate

# Restaurar prisma.config.ts
if [ -f "prisma.config.ts.tmp" ]; then
  mv prisma.config.ts.tmp prisma.config.ts
fi

print_box "🌱 Populando banco de dados..."
npx prisma db seed

print_box "✅ Migration e seed concluídos!"

print_box "🚀 Criando build da Aplicação..."
npm run build || { echo "❌ Erro ao gerar o build"; exit 1; }

print_box "✅ Processo de reset para desenvolvimento concluído!"