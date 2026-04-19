# ⚡ Seeds - Quick Fixes (15-20 minutos)

## 🔧 Fixar Agora

### 1. **index.ts - Adicionar Deletes Faltantes** (5min)

```diff
async function cleanDatabase() {
  try {
+   await prisma.relatedResource.deleteMany()
+   await prisma.userResourceInteraction.deleteMany()
+   await prisma.review.deleteMany()
+   await prisma.author.deleteMany()
    await prisma.resourceFile.deleteMany()
    await prisma.resourceBnccSkill.deleteMany()
    await prisma.bnccSkill.deleteMany()
    await prisma.resource.deleteMany()
    await prisma.billingAuditLog.deleteMany()
```

**Porquê:** Evita duplicatas ao rodar seed 2x

---

### 2. **schema.prisma - Adicionar Enum de Steps** (5min)

```diff
+ enum ResourceStepType {
+   WARMUP
+   DISTRIBUTION
+   PRACTICE
+   CONCLUSION
+   DISCUSSION
+   ACTIVITY
+   REFLECTION
+ }

  enum ResourceType {
    PRINTABLE_ACTIVITY
    ...
  }
```

**Porquê:** Seeds estão usando tipos inválidos (DISCUSSION, ACTIVITY, REFLECTION)

---

### 3. **Integrar enrich-resources.ts** (5min)

**Em `enrich-resources.ts`**, mude final:
```diff
- async function main() {
+ export async function seedEnrichResources(prisma: PrismaClient) {
    console.log('🌟 Iniciando Enriquecimento...');
    
    const authors = [];
    // ... rest do código
  }

- main()
-   .catch(e => {
-     console.error(e);
-     process.exit(1);
-   })
-   .finally(async () => {
-     await prisma.$disconnect();
-   });
```

**Em `index.ts`**, adicione:
```diff
  import { seedSmartEnrich } from './smart-bulk-enrich';
  import { seedReviews } from './generate-reviews';
+ import { seedEnrichResources } from './enrich-resources';

  async function createInitialData() {
    // ...
    await seedSmartEnrich(prisma);
+   await seedEnrichResources(prisma);
    await seedReviews(prisma);
  }
```

**Porquê:** `npm run db:seed` executa tudo em 1 comando

---

### 4. **Corrigir Tipos de Steps** (5min)

**Em `seed-demo-resource.ts`**, linha ~104:
```diff
  {
    id: 'step1',
    order: 1,
-   type: 'DISCUSSION',
+   type: 'WARMUP',
    title: 'Aquecimento coletivo',
    ...
  },
  {
    id: 'step2',
    order: 2,
-   type: 'ACTIVITY',
+   type: 'DISTRIBUTION',
    ...
  },
  {
    id: 'step3',
    order: 3,
-   type: 'ACTIVITY',
+   type: 'PRACTICE',
    ...
  }
```

**Em `smart-bulk-enrich.ts`**, linha ~92:
```diff
  steps: [
    { id: 's1', order: 1, type: 'DISCUSSION', ... },
+   { id: 's1', order: 1, type: 'WARMUP', ... },
-   { id: 's2', order: 2, type: 'ACTIVITY', ... },
+   { id: 's2', order: 2, type: 'DISTRIBUTION', ... },
-   { id: 's3', order: 3, type: 'REFLECTION', ... }
+   { id: 's3', order: 3, type: 'CONCLUSION', ... }
  ]
```

**Em `enrich-resources.ts`**, linha ~92:
```diff
  steps: [
-   { id: 's1', order: 1, type: 'DISCUSSION', ... },
-   { id: 's2', order: 2, type: 'ACTIVITY', ... },
-   { id: 's3', order: 3, type: 'REFLECTION', ... }
+   { id: 's1', order: 1, type: 'WARMUP', ... },
+   { id: 's2', order: 2, type: 'DISTRIBUTION', ... },
+   { id: 's3', order: 3, type: 'CONCLUSION', ... }
  ]
```

**Porquê:** Validação no schema vai falhar com tipos inválidos

---

## ✅ Testar Depois dos Fixes

```bash
# 1. Rodar migrations
npx prisma migrate dev

# 2. Rodar seeds (2x para validar idempotência)
npm run db:seed
npm run db:seed

# 3. Verificar em Prisma Studio
npx prisma studio

# 4. Testar um endpoint
curl http://localhost:3000/api/v1/resources/b2222222-2222-2222-2222-222222222222/reviews
```

---

## 📊 Tempo Total

| Tarefa | Tempo |
|--------|-------|
| Fixar index.ts | 5min |
| Adicionar enum | 5min |
| Integrar enrich-resources | 5min |
| Corrigir tipos | 5min |
| Rodar testes | 5min |
| **TOTAL** | **~25min** |

---

## 🎯 Depois (Opcional)

Se sobrar tempo, adicionar seeds extras:

### seed-user-interactions.ts (20min)
```typescript
export async function seedUserInteractions(prisma: PrismaClient) {
  const users = await prisma.user.findMany({ take: 10 });
  const resources = await prisma.resource.findMany({ take: 50 });
  
  for (const user of users) {
    // Salvar alguns recursos
    const saved = faker.helpers.arrayElements(resources, faker.number.int({ min: 5, max: 10 }));
    for (const res of saved) {
      await prisma.userResourceInteraction.upsert({
        where: { userId_resourceId: { userId: user.id, resourceId: res.id } },
        update: {},
        create: {
          userId: user.id,
          resourceId: res.id,
          isSaved: true,
          savedAt: faker.date.past(),
        }
      });
    }
  }
}
```

### seed-related-resources.ts (15min)
```typescript
export async function seedRelatedResources(prisma: PrismaClient) {
  const resources = await prisma.resource.findMany({ take: 50 });
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  
  if (!admin) return;
  
  for (let i = 0; i < Math.min(resources.length - 1, 20); i++) {
    const related = faker.helpers.arrayElements(
      resources.filter(r => r.id !== resources[i].id),
      faker.number.int({ min: 2, max: 3 })
    );
    
    for (const target of related) {
      await prisma.relatedResource.create({
        data: {
          sourceResourceId: resources[i].id,
          targetResourceId: target.id,
          relationType: faker.helpers.arrayElement(['COMPLEMENTS', 'PREREQUISITE', 'ADVANCED']),
          relevanceScore: faker.number.int({ min: 3, max: 5 }),
          createdBy: admin.id,
        }
      });
    }
  }
}
```

---

**Checklist:** [ ] Fix 1 [ ] Fix 2 [ ] Fix 3 [ ] Fix 4 [ ] Testar
