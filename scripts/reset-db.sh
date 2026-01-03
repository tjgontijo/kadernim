#!/bin/bash
set -euo pipefail

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
rm -rf .next .turbo node_modules/.cache prisma/generated public/sw.js public/manifest.webmanifest public/*.map public/*.js || true

print_box "🗑️ Limpando cache do npm..."
npm cache clean --force

print_box "📦 Instalando dependências..."
npm install

print_box "🧨 Resetando schema public e criando extensões ANTES do Prisma..."
npx prisma db execute --stdin <<'SQL'
DO $$
BEGIN
  EXECUTE 'DROP SCHEMA IF EXISTS public CASCADE';
  EXECUTE 'CREATE SCHEMA public';
  EXECUTE 'GRANT ALL ON SCHEMA public TO public';
END $$;

-- extensões
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS unaccent;
SQL

print_box "🔎 Verificando extensões..."
npx prisma db execute --stdin <<'SQL'
SELECT extname, extversion
FROM pg_extension
WHERE extname IN ('vector','unaccent')
ORDER BY extname;
SQL

print_box "📦 Aplicando schema Prisma..."
npx prisma db push

print_box "🔄 Gerando cliente do Prisma..."
npx prisma generate

print_box "🔧 Configurando FTS para bncc_skill (trigger + índice GIN)..."
npx prisma db execute --stdin <<'SQL'
CREATE OR REPLACE FUNCTION bncc_skill_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW."code", ''))), 'A') ||
    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW."description", ''))), 'A') ||
    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW."unitTheme", ''))), 'B') ||
    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW."knowledgeObject", ''))), 'B') ||
    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW."comments", ''))), 'C') ||
    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW."curriculumSuggestions", ''))), 'C');

  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bncc_skill_search_vector_trigger ON "bncc_skill";
CREATE TRIGGER bncc_skill_search_vector_trigger
BEFORE INSERT OR UPDATE ON "bncc_skill"
FOR EACH ROW EXECUTE FUNCTION bncc_skill_search_vector_update();

CREATE INDEX IF NOT EXISTS bncc_skill_search_gin
ON "bncc_skill"
USING GIN ("searchVector");
SQL

print_box "🌱 Executando seed..."
TRUNCATE_DB=1 npx prisma db seed

print_box "🔄 Backfill do searchVector (após seed)..."
npx prisma db execute --stdin <<'SQL'
UPDATE "bncc_skill"
SET "updatedAt" = now();
SQL

print_box "🎯 Criando índice IVFFlat para embeddings..."
npx prisma db execute --stdin <<'SQL'
CREATE INDEX IF NOT EXISTS bncc_skill_embedding_idx
ON "bncc_skill"
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Verificar índice criado
SELECT
  indexname,
  LEFT(indexdef, 80) || '...' as definition
FROM pg_indexes
WHERE tablename = 'bncc_skill' AND indexname LIKE '%embedding%';
SQL

print_box "🚀 Criando build da Aplicação..."
npm run build || { echo "❌ Erro ao gerar o build"; exit 1; }

# Pergunta sobre embeddings (opcional)
echo ""
read -t 30 -p "🧠 Deseja gerar embeddings para as habilidades BNCC? (s/N): " -n 1 answer || answer="n"
echo ""

if [[ "$answer" =~ ^[Ss]$ ]]; then
  print_box "🧠 Gerando embeddings..."
  npx tsx scripts/embed.ts
else
  echo "⏭️  Pulando geração de embeddings."
fi

print_box "✅ Reset concluído com sucesso!"
