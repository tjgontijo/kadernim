#!/bin/bash

set -e  # Parar o script em caso de erro

echo "🚀 Iniciando a instalação do servidor Next.js..."

# Atualizar pacotes
echo "🔄 Atualizando pacotes do sistema..."
sudo apt update && sudo apt upgrade -y

echo "📦 Instalando dependências essenciais..."
sudo apt install -y curl git unzip nginx certbot python3-certbot-nginx

# Clonar o repositório
echo "📥 Clonando o repositório do projeto..."
cd /var/www
sudo git clone https://github.com/tjgontijo/kadernim.git kadernim
cd kadernim

# Instalar dependências
echo "📦 Instalando dependências do projeto..."
npm install

# Criar build do Next.js
echo "⚙️ Criando build do Next.js..."
npm run build

# Iniciar aplicação com PM2
echo "🚀 Iniciando aplicação com PM2..."
pm2 start npm --name "kadernim" -- start
pm2 save
pm2 startup

# Configurar Nginx
echo "⚙️ Configurando Nginx..."
sudo bash -c 'cat > /etc/nginx/sites-available/kadernim <<EOF
server {
    listen 80;
    server_name app.kadernim.com.br;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_set_header Host "$host";
        proxy_set_header X-Real-IP "$remote_addr";
        proxy_set_header X-Forwarded-For "$proxy_add_x_forwarded_for";
        proxy_set_header X-Forwarded-Proto "$scheme";
        proxy_http_version 1.1;
        proxy_set_header Upgrade "$http_upgrade";
        proxy_set_header Connection "upgrade";
    }

    location /_next/static/ {
        root /var/www/kadernim/.next/;
        access_log off;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    error_log /var/log/nginx/kadernim.error.log;
    access_log /var/log/nginx/kadernim.access.log;
}
EOF'

# Ativar configuração do Nginx
echo "🔄 Ativando configuração do Nginx..."
sudo ln -s /etc/nginx/sites-available/kadernim /etc/nginx/sites-enabled/

# Testar a configuração antes de reiniciar
echo "✅ Testando a configuração do Nginx..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "🔄 Reiniciando Nginx..."
    sudo systemctl restart nginx
else
    echo "❌ Erro na configuração do Nginx! Verifique o arquivo em /etc/nginx/sites-available/kadernim"
    exit 1
fi

# Configurar HTTPS com Certbot
echo "🔒 Configurando HTTPS com Let's Encrypt..."
sudo certbot --nginx -d app.kadernim.com.br --non-interactive --agree-tos --redirect -m tjgontijo@gmail.com

# Finalização
echo "🔄 Reiniciando serviços..."
pm2 restart all
sudo systemctl restart nginx

echo "✅ Instalação concluída com sucesso! O site deve estar rodando em https://app.kadernim.com.br"
