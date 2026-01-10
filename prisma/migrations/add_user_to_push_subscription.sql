-- Migration: Add userId to PushSubscription
-- Descrição: Vincula push subscriptions ao usuário autenticado

-- 1. Adicionar coluna userId (nullable temporariamente)
ALTER TABLE "push_subscription" ADD COLUMN "userId" TEXT;

-- 2. Deletar subscriptions sem vínculo de usuário (se houver)
DELETE FROM "push_subscription" WHERE "userId" IS NULL;

-- 3. Tornar userId obrigatório
ALTER TABLE "push_subscription" ALTER COLUMN "userId" SET NOT NULL;

-- 4. Adicionar foreign key
ALTER TABLE "push_subscription"
ADD CONSTRAINT "push_subscription_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- 5. Criar índice para userId
CREATE INDEX "push_subscription_userId_idx" ON "push_subscription"("userId");
