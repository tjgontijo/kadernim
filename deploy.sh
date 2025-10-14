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
git fetch origin
git reset --hard origin/main
git clean -fd

print_box "🗑️ Limpando cache e dependências..."
rm -rf .next node_modules/.cache package-lock.json || true
npm cache clean --force

print_box "📦 Instalando dependências (fresh install)..."
npm install

print_box "🔄 Sincronizando schema com o banco..."
npx prisma db push --skip-generate

print_box "⚙️ Gerando cliente do Prisma..."
npx prisma generate

print_box "🔄 Atualizando versão do Service Worker..."
node scripts/update-sw-version.js

print_box "🚀 Criando build da aplicação..."
npm run build

print_box "Reiniciando servidor..."
pm2 restart kadernim

print_box "Restaurando nginx"
systemctl restart nginx

print_box "✅ Deploy concluído com sucesso!"