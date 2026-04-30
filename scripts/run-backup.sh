#!/bin/bash

# Caminho do projeto
PROJECT_DIR="/Users/thiago/www/kadernim"
cd "$PROJECT_DIR"

# Adicionar caminhos do Homebrew e libpq ao PATH para o cron encontrar o node, npm e pg_dump
export PATH="/opt/homebrew/bin:/opt/homebrew/opt/libpq/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

# Log de início
echo "$(date): Iniciando backup agendado..." >> "$PROJECT_DIR/scratch/backup.log"

# Executar o comando de backup
/opt/homebrew/bin/npm run backup:db >> "$PROJECT_DIR/scratch/backup.log" 2>&1

# Log de fim
echo "$(date): Processo finalizado." >> "$PROJECT_DIR/scratch/backup.log"
echo "------------------------------------" >> "$PROJECT_DIR/scratch/backup.log"
