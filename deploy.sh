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

print_box "🔄 Atualizando código do repositório..."
git pull

print_box "🗑️ Limpando cache..."
rm -rf .next node_modules/.cache || true
npm cache clean --force

print_box "📦 Instalando dependências..."
npm ci --only=production

print_box "📌 Aplicando migrações do Prisma..."
npx prisma migrate deploy

print_box "⚙️ Gerando cliente do Prisma..."
npx prisma generate

print_box "🌱 Populando banco de dados..."
npx prisma db seed

print_box "🚀 Criando build da aplicação..."
npm run build

print_box "✅ Deploy concluído com sucesso!"
echo ""
echo "🚀 Reinicie o servidor: pm2 restart kadernim"
