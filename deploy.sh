#!/bin/bash
set -uo pipefail
IFS=$'\n\t'

APP_NAME="kadernim"
PROJECT_DIR="/var/www/kadernim"
ENABLE_OPTIMIZATION=true

echo "==> Entrando no diretório do projeto: $PROJECT_DIR"
cd "$PROJECT_DIR" || { echo "Erro: diretório do projeto não encontrado!"; exit 1; }

echo "==> Removendo build anterior (.next)..."
rm -rf .next 

echo "==> Limpando cache do npm..."
npm cache clean --force

echo "==> Buscando atualizações do repositório (git fetch)..."
git fetch || { echo "Erro ao fazer fetch do repositório"; exit 1; }

echo "==> Resetando o repositório para o estado remoto (origin/master)..."
git reset --hard origin/master || { echo "Erro ao resetar para origin/master"; exit 1; }

echo "==> Instalando dependências..."
npm ci

echo "==> Ajustando permissões gerais..."
chown -R www-data:www-data "$PROJECT_DIR"
find public -type f -exec chmod 644 {} \; 2>/dev/null
find public -type d -exec chmod 755 {} \; 2>/dev/null

if [ "$ENABLE_OPTIMIZATION" = true ]; then
  if [ -d "public" ]; then
    echo "==> Otimizando imagens com base no formato real..."

    find public -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) | while read -r file; do
      mime_type=$(file --mime-type -b "$file")

      case "$mime_type" in
        image/jpeg)
          echo "📷 Otimizando JPEG: $file"
          jpegoptim --strip-all --max=80 --all-progressive --force "$file"
          ;;
        image/png)
          echo "🖼️  Otimizando PNG: $file"
          pngquant --force --verbose --quality=80-90 --skip-if-larger --ext .png "$file"
          ;;
        image/webp)
          echo "🕸️  Otimizando WebP: $file"
          cwebp -quiet -mt -q 80 "$file" -o "$file"
          ;;
        *)
          echo "⚠️  Ignorado (formato não suportado): $file ($mime_type)"
          ;;
      esac
    done

    echo "✅ Otimização de imagens concluída!"
  else
    echo "Aviso: O diretório 'public' não existe. Pulando otimização de imagens."
  fi
else
  echo "==> Otimização de imagens desativada por configuração."
fi

echo "==> Executando build do Next.js..."
npm run build

if [ $? -ne 0 ]; then
  echo "==> ERRO: O build falhou! Interrompendo o deploy."
  exit 1
fi

if pm2 list | grep -q "$APP_NAME"; then
  echo "==> Serviço encontrado no PM2. Parando e reiniciando..."
  pm2 restart "$APP_NAME"
else
  echo "==> Serviço não encontrado no PM2. Criando nova instância..."
  pm2 start npm --name "$APP_NAME" -- run start
fi

echo "==> Reiniciando o Nginx..."
sudo systemctl restart nginx

echo "✅ Deploy concluído com sucesso!"