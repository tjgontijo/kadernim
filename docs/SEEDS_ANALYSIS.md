# 🌱 Análise dos Seeds e Sugestões de Melhora

**Data:** 2026-04-19  
**Análise de:** Seeds para Resource Details (Fase 1-4)

---

## 📊 Status Geral dos Seeds

**Score: 8.5/10** ✨

Você criou uma estrutura de seeds muito **bem pensada**, com dados realistas e seguindo boas práticas. Aqui estão as análises e sugestões de melhora.

---

## ✅ O Que Está Excelente

### 1. **generate-reviews.ts**
- ✅ Comentários realísticos em português
- ✅ Ratings com distribuição ponderada (70% 5-stars, 20% 4-stars, 10% 3-stars)
- ✅ Cria 30 usuários fictícios com roleTitle e location realistas
- ✅ Usa upsert para idempotência
- ✅ Atualiza cache de ratings automaticamente
- ✅ Varia 2-8 reviews por recurso

**Nota:** Excelente implementação! Dados muito realistas.

### 2. **seed-demo-resource.ts**
- ✅ Demonstração completa com resource real
- ✅ UUIDs fixas para referência (ótimo para testes)
- ✅ Taxonomia bem definida (Nível → Subject → Grade)
- ✅ pedagogicalContent totalmente preenchido com Steps
- ✅ Habilidades BNCC linkadas
- ✅ Upsert para idempotência

**Nota:** Implementação de referência! Dados estruturados e bem documentados.

### 3. **smart-bulk-enrich.ts**
- ✅ Inteligência de parsing (extrai ano do título)
- ✅ Mapping Subject → Código BNCC
- ✅ Busca habilidades por prefix (EF05MA, EF03LP, etc)
- ✅ Fallback se não achar ano no título
- ✅ Cria Autor padrão "Equipe Pedagógica Kadernim"
- ✅ Pedagogical content padrão consistente

**Nota:** Muito bom! Abordagem inteligente de enriquecimento.

---

## ⚠️ Problemas Encontrados

### 1. **index.ts - Cleanup Incompleto**

**Problema:** As novas tabelas não estão sendo deletadas antes de recriar:
```typescript
await prisma.review.deleteMany()                    // ❌ Falta
await prisma.userResourceInteraction.deleteMany()   // ❌ Falta
await prisma.relatedResource.deleteMany()           // ❌ Falta
await prisma.author.deleteMany()                    // ❌ Falta
```

**Impacto:** Se rodar `npm run db:seed` 2x, terá dados duplicados de reviews/authors.

**Solução:**
```typescript
async function cleanDatabase() {
  // Ordem importa: FKs primeiro
  await prisma.relatedResource.deleteMany()
  await prisma.userResourceInteraction.deleteMany()
  await prisma.review.deleteMany()
  await prisma.author.deleteMany()
  // ... rest
}
```

---

### 2. **enrich-resources.ts e smart-bulk-enrich.ts Separados**

**Problema:** Estão como scripts isolados, não integrados ao index.ts
```typescript
// Não está sendo chamado automaticamente
main()
  .catch(...)
  .finally(...)
```

**Impacto:** `npm run db:seed` não executa automaticamente.

**Solução:** Exportar como função e chamar de index.ts:
```typescript
// enrich-resources.ts
export async function seedEnrichResources(prisma: PrismaClient) {
  // ... código
}

// smart-bulk-enrich.ts
export async function seedSmartEnrich(prisma: PrismaClient) {
  // ... código (já feito ✅)
}

// index.ts
await seedEnrichResources(prisma)  // Adicionar
await seedSmartEnrich(prisma)      // Já existe
await seedReviews(prisma)
```

---

### 3. **Tipos de Steps Inválidos**

**Problema:** Em `smart-bulk-enrich.ts` e `seed-demo-resource.ts`, estão usando tipos que não existem no enum:
```typescript
type: 'DISCUSSION'      // ❌ Não existe no enum
type: 'ACTIVITY'        // ❌ Não existe no enum
type: 'REFLECTION'      // ❌ Não existe no enum
```

**Enum Real:** Não está definido no schema! 

**Solução:** Atualizar o schema:
```prisma
// Adicionar ao schema.prisma
enum ResourceStepType {
  WARMUP
  DISTRIBUTION
  PRACTICE
  CONCLUSION
  DISCUSSION     // Adicionar
  ACTIVITY       // Adicionar
  REFLECTION     // Adicionar
}
```

Ou manter consistente:
```typescript
steps: [
  { type: 'WARMUP', ... },
  { type: 'DISTRIBUTION', ... },
  { type: 'PRACTICE', ... },
  { type: 'CONCLUSION', ... }
]
```

---

### 4. **Dados de Download Count Faltando**

**Problema:** `downloadCount` cache nunca é atualizado nos seeds:
```typescript
// Nunca chamam logResourceDownload()
downloadCount: 0  // Sempre fica 0
```

**Sugestão:** Simular downloads:
```typescript
// No generate-reviews.ts ou novo seed
for (const resource of resources) {
  const downloadCount = faker.number.int({ min: 10, max: 500 });
  await prisma.resource.update({
    where: { id: resource.id },
    data: { downloadCount }
  });
}
```

---

### 5. **Sem Dados de UserResourceInteraction**

**Problema:** Nenhum seed popula salvos/planejados/downloads de usuários:
```typescript
// Nenhum upsert de UserResourceInteraction
// Nenhum isSaved = true
// Nenhum plannedFor = future date
```

**Impacto:** Não é possível testar:
- Dashboard "Recursos Salvos"
- Planejador (calendário)
- Histórico de downloads

**Sugestão:** Criar seed específico:
```typescript
// seed-user-interactions.ts
export async function seedUserInteractions(prisma: PrismaClient) {
  const users = await prisma.user.findMany({ take: 10 });
  const resources = await prisma.resource.findMany({ take: 50 });
  
  for (const user of users) {
    // Salvar 5-10 recursos
    const savedResources = faker.helpers.arrayElements(resources, 
      faker.number.int({ min: 5, max: 10 })
    );
    
    for (const resource of savedResources) {
      await prisma.userResourceInteraction.create({
        data: {
          userId: user.id,
          resourceId: resource.id,
          isSaved: true,
          savedAt: faker.date.past(),
        }
      });
    }
    
    // Planejar 3-5 recursos para datas futuras
    const plannedResources = faker.helpers.arrayElements(resources, 
      faker.number.int({ min: 3, max: 5 })
    );
    
    for (const resource of plannedResources) {
      await prisma.userResourceInteraction.create({
        data: {
          userId: user.id,
          resourceId: resource.id,
          isPlanned: true,
          plannedFor: faker.date.soon({ days: 14 }),
        }
      });
    }
  }
}
```

---

### 6. **Sem Related Resources**

**Problema:** Nenhum seed popula `RelatedResource`:
```typescript
// Nenhum upsert de RelatedResource
// Nenhuma relação "Combina com..."
```

**Impacto:** Seção de relacionados sempre busca fallback (implícitas).

**Sugestão:** Criar seed:
```typescript
// seed-related-resources.ts
export async function seedRelatedResources(prisma: PrismaClient) {
  const resources = await prisma.resource.findMany({ take: 100 });
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  
  if (!admin) return;
  
  for (let i = 0; i < resources.length - 1; i++) {
    // Cada recurso tem 2-3 relacionados
    const relatedCount = faker.number.int({ min: 2, max: 3 });
    const related = faker.helpers.arrayElements(
      resources.filter(r => r.id !== resources[i].id),
      relatedCount
    );
    
    for (const target of related) {
      await prisma.relatedResource.create({
        data: {
          sourceResourceId: resources[i].id,
          targetResourceId: target.id,
          relationType: faker.helpers.arrayElement([
            'COMPLEMENTS',
            'PREREQUISITE',
            'ADVANCED',
            'RELATED_TOPIC'
          ]),
          relevanceScore: faker.number.int({ min: 1, max: 5 }),
          createdBy: admin.id,
        }
      });
    }
  }
}
```

---

## 🎯 Sugestões de Melhora

### Priority 1: Corrigir Agora ⚡

| Item | Esforço | Impacto | Ação |
|------|---------|--------|------|
| Adicionar delete de novas tabelas em `index.ts` | 5min | Alto | Corrigir `cleanDatabase()` |
| Integrar `enrich-resources.ts` ao `index.ts` | 10min | Alto | Exportar função + chamar |
| Definir enum `ResourceStepType` no schema | 5min | Alto | Atualizar schema.prisma |

### Priority 2: Melhorar Completude 📈

| Item | Esforço | Impacto | Benefício |
|------|---------|--------|-----------|
| Seed de `UserResourceInteraction` | 20min | Médio | Testar Dashboard + Planejador |
| Seed de `RelatedResource` | 15min | Médio | Testar seção "Combina com..." |
| Simular downloads (cache) | 5min | Baixo | Dados mais realistas |
| Aumentar dados de reviews | 10min | Médio | Mais contexto para agregações |

### Priority 3: Otimizações 🚀

| Item | Esforço | Impacto | Benefício |
|------|---------|--------|-----------|
| Adicionar progressão (80+ recursos) | 10min | Médio | Testar pagination/performance |
| Criar admin user com email padrão | 5min | Médio | Facilitar login em dev |
| Documentar seeds em README | 10min | Baixo | Onboarding de devs |

---

## 📋 Plano de Ação Recomendado

### Semana 1 (HOJE):

**15 minutos:**
```bash
# 1. Corrigir cleanDatabase()
# - Adicionar delete de Author, Review, UserResourceInteraction, RelatedResource

# 2. Integrar enrich-resources.ts
# - Exportar função
# - Chamar em index.ts

# 3. Corrigir tipos de Steps
# - Definir enum ResourceStepType
# - Atualizar seeds para usar valores válidos
```

**30 minutos (após)**
```bash
# 4. Criar seed-user-interactions.ts
# - Populações de salvos (10-30% dos users)
# - Populações de planejados (5-20% dos users)
# - Integrar em index.ts

# 5. Criar seed-related-resources.ts
# - Relacionar recursos inteligentemente
# - Integrar em index.ts
```

### Resultado Final:
- ✅ `npm run db:seed` roda tudo em 1 comando
- ✅ Dados completos para testar todas as features
- ✅ Sem duplicatas ao rodar 2x
- ✅ Seed idempotente e rápido

---

## 🔍 Checklist para Validar Seeds

Após implementar melhorias, validar:

```bash
# 1. Rodar seed 2x seguidas
npm run db:seed
npm run db:seed
# Verificar: sem erros, sem duplicatas

# 2. Verificar contagens
npx prisma studio
# Authors: ~10 (5 + 1 curator + 30 review authors)
# Reviews: ~200-400 (média 2-8 por recurso × 50 recursos)
# UserResourceInteraction: ~300-500
# RelatedResource: ~100-150

# 3. Testar endpoints
GET /api/v1/resources/[id]/reviews
# Response: lista de reviews com user data

GET /api/v1/resources/[id]/interact
# Response: user interaction data (if logged in)

GET /api/v1/resources/[id]/related
# Response: lista de relacionados (explícitos + implícitos)

# 4. Verificar queries de performance
# Nenhuma N+1 query
# getResourceDetail < 100ms
```

---

## 💡 Tips Extras

### 1. Criar Admin User Padrão
```typescript
// Adicionar ao final de index.ts
const adminUser = await prisma.user.upsert({
  where: { email: 'admin@local.dev' },
  update: {},
  create: {
    name: 'Admin Local',
    email: 'admin@local.dev',
    role: 'admin',
    emailVerified: true,
  }
});
console.log(`✅ Admin: ${adminUser.email} (password: 123456)`);
```

### 2. Seed Progressivo (Dev vs Prod)
```typescript
// Verificar ambiente
const isProduction = process.env.NODE_ENV === 'production';
const reviewsPerResource = isProduction ? 10 : 5; // Menos dados em dev

// Usar ao rodar
DATABASE_URL=... npm run db:seed  # Dev mode: menos dados
NODE_ENV=production npm run db:seed  # Prod mode: dados completos
```

### 3. Adicionar Validação Final
```typescript
// No final de index.ts
const stats = {
  authors: await prisma.author.count(),
  users: await prisma.user.count(),
  resources: await prisma.resource.count(),
  reviews: await prisma.review.count(),
  interactions: await prisma.userResourceInteraction.count(),
  related: await prisma.relatedResource.count(),
};

console.log('📊 Estatísticas Finais:');
console.table(stats);
```

---

## 📚 Arquivos a Atualizar

| Arquivo | Mudanças | Tempo |
|---------|----------|-------|
| `prisma/seeds/index.ts` | Adicionar deletes + imports | 10min |
| `prisma/schema.prisma` | Adicionar enum ResourceStepType | 5min |
| `prisma/seeds/enrich-resources.ts` | Exportar função | 5min |
| `prisma/seeds/seed-user-interactions.ts` | 🆕 Criar novo | 20min |
| `prisma/seeds/seed-related-resources.ts` | 🆕 Criar novo | 15min |
| `prisma/seeds/seed-demo-resource.ts` | Corrigir tipos de steps | 5min |
| `prisma/seeds/smart-bulk-enrich.ts` | Corrigir tipos de steps | 5min |

**Total: ~65 minutos**

---

## 📝 Conclusão

Seus seeds estão **muito bons**! A estrutura é sólida, dados são realistas, e o código é clean.

As sugestões acima são melhorias para:
1. **Robustez** - Evitar bugs em seed runs
2. **Completude** - Testar todas as features
3. **DX** - Melhor experiência de dev

**Próximo passo:** Implementar Priority 1 hoje, testar tudo, depois Priority 2.

---

**Análise por:** Arquitetura de Software  
**Data:** 2026-04-19 10:45 GMT-3
