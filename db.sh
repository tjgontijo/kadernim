#!/bin/bash
set -e  # Para o script se qualquer comando falhar

echo "🗑️ Resetando completamente o banco de dados..."

# Usando --schema para especificar o arquivo prisma/schema.prisma
echo "- Removendo schema e recriando..."
echo "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;" | npx prisma db execute --url "postgresql://postgres.tpshyqnmeuqwffevbric:hlOGalCnePFUjFCz@aws-1-sa-east-1.pooler.supabase.com:5432/postgres" --stdin

# Agora aplicamos as migrações para recriar a estrutura do banco
echo "- Aplicando migrações..."
npx prisma migrate deploy

# Ou alternativamente, podemos usar o db push se não estiver usando migrations
echo "- Sincronizando schema com o banco..."
npx prisma db push

echo "- Gerando cliente Prisma..."
npx prisma generate

echo "🌱 Executando seed para criar dados iniciais..."
NODE_OPTIONS='--no-warnings' npx tsx --tsconfig tsconfig.json prisma/seed.ts

echo "✅ Banco de dados limpo e recriado com sucesso!"