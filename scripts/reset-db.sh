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

# Criar schema e extensões
npx prisma db execute --stdin <<'EOF'
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS unaccent;
EOF

# Criar migration inicial (baseline)
print_box "📦 Criando migration inicial (init)..."
npx prisma migrate dev --name init

print_box "🔄 Gerando Prisma Client..."
npx prisma generate

# 5. Configurações Customizadas de SQL (Triggers e Índices GIN)
print_box "🔧 Aplicando Triggers e Índices Customizados..."
npx prisma db execute --stdin <<'EOF'
-- Função para atualização automática do searchVector (Full Text Search)
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

-- Garantir que o trigger seja recriado
DROP TRIGGER IF EXISTS bncc_skill_search_vector_trigger ON "bncc_skill";
CREATE TRIGGER bncc_skill_search_vector_trigger
BEFORE INSERT OR UPDATE ON "bncc_skill"
FOR EACH ROW EXECUTE FUNCTION bncc_skill_search_vector_update();

-- Índice GIN para busca textual
CREATE INDEX IF NOT EXISTS bncc_skill_search_gin ON "bncc_skill" USING GIN ("searchVector");

-- Índice Vetorial (IA)
CREATE INDEX IF NOT EXISTS bncc_skill_embedding_idx ON "bncc_skill" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
EOF

# 6. População de Dados (Seed)
print_box "🌱 Populando Banco de Dados (Seed)..."
TRUNCATE_DB=1 npx prisma db seed

# 7. Finalização (Build e Embeddings)
print_box "🔄 Atualizando vetores de busca..."
npx prisma db execute --stdin <<'EOF'
UPDATE "bncc_skill" SET "updatedAt" = now();
EOF

print_box "🚀 Gerando build da aplicação..."
npm run build

echo ""
read -t 30 -p "🧠 Deseja gerar embeddings para as habilidades BNCC agora? (s/N): " -n 1 embed_answer || embed_answer="n"
echo ""

if [[ "$embed_answer" =~ ^[Ss]$ ]]; then
  print_box "🧠 Gerando embeddings..."
  npx tsx scripts/embed.ts
fi

print_box "✅ Processo de Reset concluído com sucesso!"