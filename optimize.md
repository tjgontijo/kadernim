# 🎯 Plano de Otimização - Sistema Kadernim

## 📊 Situação Atual

### Problemas Identificados
- **Tempo de resposta crítico**: 1.5+ segundos para carregar um único recurso
- **Queries N+1 severas**: 8-10 queries por requisição individual
- **Cache inadequado**: Better Auth com apenas 5 minutos de cache de sessão
- **Múltiplas transações desnecessárias**: Cada query em transação separada
- **Queries repetitivas**: Dados de assinatura consultados múltiplas vezes

### Impacto para 500+ Cursos
- **Tempo total estimado**: 12+ minutos de carregamento
- **Sobrecarga do banco**: Insustentável
- **Experiência do usuário**: Inaceitável

---

## 🚀 FASE 1: CORREÇÕES CRÍTICAS
**Prioridade: MÁXIMA | Tempo: 2-3 dias**

### 1.1 Corrigir Query N+1 na Página Individual de Recursos
**Problema**: `/resources/[id]` fazendo múltiplas queries separadas
**Arquivo**: `src/app/(dashboard)/resources/[id]/page.tsx`
**Solução**: Implementar eager loading com Promise.all para buscar recurso e assinatura em paralelo
**Impacto**: Redução de 80% no tempo de resposta

### 1.2 Implementar Cache Agressivo de Sessão
**Problema**: Better Auth revalida sessão a cada 5 minutos
**Arquivo**: `src/lib/auth/auth.ts`
**Solução**: Aumentar cache de sessão para 30 minutos
**Impacto**: Redução de 70% nas queries de autenticação

### 1.3 Adicionar Cache HTTP na API de Recursos
**Problema**: API `/resources` sem cache (no-store)
**Arquivo**: `src/app/api/v1/resources/route.ts`
**Solução**: Implementar cache público com stale-while-revalidate
**Impacto**: Melhoria significativa no carregamento de listas

---

## 📈 FASE 2: OTIMIZAÇÕES DE CACHE
**Prioridade: ALTA | Tempo: 2-3 dias**

### 2.1 Cache de Overlay de Usuário
**Problema**: Dados de assinatura consultados repetidamente
**Arquivo**: `src/domain/resources/list-resources.service.ts`
**Solução**: Implementar cache de 15 minutos para dados de assinatura do usuário
**Impacto**: Redução de 60% nas queries de subscription

### 2.2 Otimizar Cache do Serviço de Recursos
**Problema**: Cache de apenas 5 minutos é muito baixo
**Arquivo**: `src/domain/resources/list-resources.service.ts`
**Solução**: Aumentar cache para 10 minutos
**Impacto**: Melhor aproveitamento do cache entre requisições

### 2.3 Implementar Batch Loading de Acessos
**Problema**: Query individual para cada recurso
**Solução**: Carregar todos os acessos do usuário de uma vez
**Impacto**: Eliminação de queries N+1 para verificação de acesso

---

## 🎨 FASE 3: OTIMIZAÇÕES DE FRONTEND
**Prioridade: MÉDIA | Tempo: 1-2 dias**

### 3.1 Otimizar Carregamento de Metadados
**Problema**: Carregamento sequencial de subjects e education-levels
**Arquivo**: `src/components/resources/ResourcesClient.tsx`
**Solução**: Carregamento paralelo com Promise.all
**Impacto**: Redução no tempo de inicialização da página

### 3.2 Implementar Preload Inteligente
**Problema**: Preload pode estar sobrecarregando
**Arquivo**: `src/components/resources/resource-grid.tsx`
**Solução**: Limitar preload aos primeiros 4 recursos visíveis
**Impacto**: Redução na carga desnecessária de recursos

### 3.3 Otimizar Scroll Infinito
**Solução**: Implementar debounce no intersection observer
**Impacto**: Melhor controle de carregamento de páginas

---

## ⚙️ FASE 4: CONFIGURAÇÕES AVANÇADAS
**Prioridade: BAIXA | Tempo: 1-2 dias**

### 4.1 Configurar Next.js para Cache Otimizado
**Arquivo**: `next.config.ts`
**Solução**: Implementar staleTimes experimentais
**Impacto**: Cache mais eficiente no nível do framework

### 4.2 Otimizar Índices do Banco
**Solução**: Criar índices compostos para queries frequentes
- `idx_resource_composite` para busca de recursos
- `idx_user_resource_access_composite` para verificação de acesso
- `idx_subscription_user_active` para dados de assinatura
**Impacto**: Queries mais rápidas no banco de dados

### 4.3 Implementar Monitoramento
**Solução**: Adicionar logging de performance e métricas de cache
**Impacto**: Visibilidade sobre performance em produção

---

## 📅 Cronograma de Execução

| Fase | Duração | Impacto Esperado | Prioridade |
|------|---------|------------------|------------|
| **Fase 1** | 2-3 dias | 🔥 80% redução no tempo de resposta | CRÍTICA |
| **Fase 2** | 2-3 dias | 📊 60% redução nas queries de DB | ALTA |
| **Fase 3** | 1-2 dias | 🎨 40% melhoria na UX | MÉDIA |
| **Fase 4** | 1-2 dias | ⚙️ 20% otimização adicional | BAIXA |

**Tempo Total Estimado**: 6-10 dias

---

## 📊 Métricas de Sucesso

### Estado Atual
- ⏱️ **Tempo de resposta**: 1.5+ segundos
- 🗄️ **Queries por requisição**: 8-10 queries
- 💾 **Cache hit rate**: ~30%
- 🔄 **Transações desnecessárias**: Múltiplas por requisição

### Metas Após Otimização
- ⏱️ **Tempo de resposta**: < 300ms
- 🗄️ **Queries por requisição**: 2-3 queries
- 💾 **Cache hit rate**: > 80%
- 🔄 **Transações otimizadas**: Batch queries quando possível

---

## 🎯 Próximos Passos Imediatos

### Semana 1
1. **Dia 1-2**: Implementar correção da query N+1 na página individual
2. **Dia 3**: Ajustar cache de sessão do Better Auth
3. **Dia 4-5**: Adicionar cache HTTP na API de recursos

### Semana 2
1. **Dia 1-2**: Implementar cache de overlay de usuário
2. **Dia 3**: Otimizar cache do serviço de recursos
3. **Dia 4-5**: Implementar batch loading de acessos

### Validação
- Testes de carga com dados simulados de 500+ recursos
- Monitoramento de métricas antes e depois
- Validação da experiência do usuário

---

## 🔍 Considerações Técnicas

### Arquivos Principais a Modificar
- `src/app/(dashboard)/resources/[id]/page.tsx`
- `src/lib/auth/auth.ts`
- `src/app/api/v1/resources/route.ts`
- `src/domain/resources/list-resources.service.ts`
- `src/components/resources/ResourcesClient.tsx`
- `next.config.ts`

### Dependências
- Nenhuma nova dependência necessária
- Utilização de recursos nativos do Next.js e Prisma
- Aproveitamento do sistema de cache existente

### Riscos e Mitigações
- **Risco**: Cache muito agressivo pode mostrar dados desatualizados
- **Mitigação**: Implementar tags de revalidação adequadas
- **Risco**: Mudanças podem afetar funcionalidades existentes
- **Mitigação**: Testes incrementais e rollback preparado

---

## 🏆 Resultado Esperado

Após a implementação completa, o sistema estará preparado para:
- ✅ Suportar 500+ cursos com performance aceitável
- ✅ Tempo de carregamento inferior a 300ms por recurso
- ✅ Redução significativa na carga do banco de dados
- ✅ Experiência do usuário otimizada
- ✅ Escalabilidade para crescimento futuro

---

## 📝 Notas de Implementação

### Logs de Performance Analisados
- Requisição individual: `GET /resources/cmgr037vr005typzgud2l3liv 200 in 1568ms`
- Múltiplas queries N+1 identificadas no terminal.log
- Padrão de transações BEGIN/COMMIT excessivas

### Arquitetura Atual
- Next.js 14 com App Router
- Prisma ORM com PostgreSQL
- Better Auth para autenticação
- Sistema de cache com unstable_cache

### Ferramentas de Monitoramento
- Logs do Prisma habilitados
- Console.time para medição de performance
- Cache hit/miss tracking
- Métricas de tempo de resposta HTTP