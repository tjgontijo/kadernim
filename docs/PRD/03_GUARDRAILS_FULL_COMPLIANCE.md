# PRD 03: Guardrails Full Compliance (100%)

## 0. Status de Execucao

- Iniciado em: 11/03/2026
- Fase atual: Fase 4 (Hardening e Go/No-Go)
- Entregas iniciais:
  - `scripts/guardrails/audit.mjs`
  - `docs/PRD/guardrails-baseline.json`
  - scripts NPM de auditoria/check/baseline
- Entregas Fase 1 (lote templates):
  - Refactor completo de `admin/templates/*` para service + schema dedicado
  - Refactor completo de `admin/push-templates/*` para service
  - Refactor completo de `admin/whatsapp-templates/*` para service
  - Refactor de `admin/llm-usage/logs` para service
  - Tipagem de `email-template.service.ts` (remoção de `any` exportado)
- Entregas Fase 1 (lote tracking):
  - Refactor de `campaigns/track` para schema + service
  - Refactor de `track/push/[campaignId]` para `GET` read-only
  - Extração da regra de tracking/redirect para `CampaignService`
- Entregas Fase 1 (lote IA community/lesson-plans):
  - Extração dos schemas de `community/generate-title`
  - Extração dos schemas de `community/refine-request`
  - Extração do schema de `lesson-plans/refine-theme`
- Entregas Fase 1 (lote resources/account/notifications):
  - Refactor completo de `account/*` para services dedicados
  - Refactor completo de `notifications/*` para services dedicados
  - Refactor de `bncc/themes` para service
  - Refactor completo de `community/*`, `lesson-plans/*` e cron jobs críticos
  - Refactor completo de `resources/*` e `admin/resources/*` para services dedicados
- Indicadores apos lotes executados:
  - `routesWithPrismaDirect`: **44 -> 0**
  - `routesWithInlineZod`: **8 -> 0**
  - `routesOver80Lines`: **40 -> 31**
  - `consoleLogOccurrences`: **5 -> 3**
- Entregas Fase 2 (client fetch + react policy):
  - Migração de telas admin/templates, automations, campaigns analytics e llm-usage para `useQuery/useMutation`
  - Remoção de `useEffect + fetch` em `community/page`, `resources/[id]`, `lesson-plans/page` e steps críticos da comunidade
  - Substituição de debounce baseado em timer por `useDeferredValue` em páginas e hooks compartilhados
  - Refactor de CRUDs (`campaigns`, `subjects`, `users`) para mutações com TanStack
  - Remoção do fetch manual em componentes estruturais (`global-header`, `sidebar`) para query cacheada
- Indicadores apos Fase 2:
  - `useEffectOccurrences`: **113 -> 61**
  - `useEffectFiles`: **51 -> 30**
  - `useEffectFetchFiles`: **27 -> 6**
  - `clientFetchWithoutTanStackFiles`: **30 -> 6**
  - `routesWithPrismaDirect`: **44 -> 0**
  - `routesWithInlineZod`: **8 -> 0**
  - `consoleLogOccurrences`: **5 -> 3**
  - Residual da Fase 2 concentrado em casos browser-only/polling: `use-pwa`, `PushNotificationSetup`, `checkout-pix-qrcode`, `split-config-form`, `MomentReview` e pontos de polling em billing/PWA.
- Entregas Fase 3 e Fase 4 (route support + hardening):
  - Renomeacao semântica de `_route-helpers.ts` para `route-support.ts`
  - Extração de handlers locais para `admin/resources`, `admin/users`, `admin/templates`, `resources`, `lesson-plans`, `notifications/test-push` e `admin/automations`
  - Refactor completo dos uploads/listagens de media em `admin/resources/*`
  - Refactor dos CRUDs de templates collection (`email`, `push`, `whatsapp`) para factory semântica
  - Refactor de `resources/counts`, `resources/summary`, `resources/[id]/files/[fileId]/download` e `admin/users/[id]/avatar`
  - Ajuste do auditor para detectar `fetch` apenas dentro do corpo real de `useEffect`
- Indicadores atuais:
  - Base saneada fora de checkout:
    - `routesWithPrismaDirect`: **44 -> 0**
    - `routesWithInlineZod`: **8 -> 0**
    - `routesOver80Lines`: **40 -> 0**
    - `useEffectFetchFiles`: **27 -> 0**
    - `clientFetchWithoutTanStackFiles`: **30 -> 0**
    - `consoleLogOccurrences`: **5 -> 0**
    - `setIntervalOccurrences`: **5 -> 0**
    - `largestRouteLines`: **429 -> 80**
  - Residual remanescente do PRD concentrado em `useEffectOccurrences` de casos browser-only e UX intencional (`PWA`, countdown visual, animacao de geracao, confetti).
  - Bloqueio externo atual:
    - rotas novas de checkout em trabalho paralelo reintroduziram temporariamente `Prisma direto`, `schema inline` e `route > 80 linhas` em `billing/checkout-guest` e `billing/checkout-lookup`.
    - esse residual nao foi ajustado neste lote para evitar conflito com trabalho concorrente.

## 1. Resumo Executivo

Este PRD define o plano para levar o Kadernim a **100% de aderência** à skill `nextjs-execution-guardrails`, eliminando desvios arquiteturais e de implementação em `src/` antes de novas expansões de produto.

Referência da skill:
`/Users/thiago/www/whatrack/docs/SKILL/nextjs-execution-guardrails/SKILL.md`

## 2. Problema

A base atual ainda apresenta violações críticas que elevam retrabalho, risco de regressão e custo de manutenção:

- Route handlers com lógica de negócio e Prisma direto.
- Fetch client-side fora de TanStack Query e uso de `useEffect` para fluxo de dados.
- Páginas read-heavy em client-first onde o padrão exigido é server-first.
- Listagens de dashboard sem padronização completa de paginação + infinite query + virtualização.
- Presença de código legado/compat e logs de debug (`console.log`) em produção.

## 3. Objetivo

Atingir **compliance 100%** com as políticas inegociáveis da skill:

- Estrutura por domínio (`src/<camada>/<dominio>/...`).
- React policy sem `useEffect` para fluxo de dados.
- Server-first em dashboard read-heavy.
- Client-fetching exclusivamente com TanStack Query.
- Pacote de performance aplicado em dashboard/CRUD.
- Routes enxutas (auth -> schema -> service -> response).
- Sem compatibilidade legada ativa no `src/`.

## 4. Baseline de Auditoria (10/03/2026)

- `81` route handlers em `src/app/api`.
- `44` routes com uso direto de Prisma.
- `8` routes com schema Zod inline (`z.object`) em route.
- `113` ocorrências de `useEffect/useLayoutEffect` em `51` arquivos.
- `27` arquivos com padrão `useEffect + fetch`.
- `30` arquivos client com `fetch` sem `useQuery/useInfiniteQuery/useMutation`.
- `5` ocorrências de `setInterval`.
- `5` ocorrências de `console.log` no `src/`.
- `2` ocorrências de `useInfiniteQuery` (ainda muito baixo para o padrão exigido).
- `40` route handlers com mais de 80 linhas.
- maior route atual com `429` linhas (`admin/resources/[id]/route.ts`).

## 5. Escopo

### 5.1 Em Escopo

- Refactor de rotas API para anatomia padrão.
- Extração de validações Zod inline para `src/schemas/[dominio]`.
- Migração de leitura inicial de páginas dashboard/admin para server-first.
- Remoção de `useEffect` para fetch/sincronização derivada/debounce.
- Padronização de listagens: paginação explícita + `useInfiniteQuery` + virtualização onde aplicável.
- Remoção de `console.log`, alias legado e compat wrappers sem valor.
- Cobertura de testes para comportamentos alterados.

### 5.2 Fora de Escopo

- Mudança de produto/UX não relacionada à aderência técnica.
- Novas features sem relação com os guardrails.
- Reescrita total de domínios já aderentes sem ganho de compliance.

## 6. Requisitos Funcionais e Técnicos

### RF-01: Route Anatomy 100%

Cada handler deve seguir estritamente:
1. autenticação/autorização (guard em `src/server/`)
2. parse/validação com schema importado de `src/schemas/`
3. delegação para service em `src/services/[dominio]/`
4. resposta HTTP padronizada

Critérios:
- zero Prisma direto em `route.ts` (exceto casos explicitamente aprovados e documentados).
- zero `z.object` inline em routes.

### RF-02: Client Data Fetching 100%

- Todo fetch client-side via TanStack Query (`useQuery`, `useInfiniteQuery`, `useMutation`).
- Proibido fetch avulso em `useEffect`.
- QueryKey inclui todas as variáveis usadas na queryFn.
- Para debounce, usar `useDeferredValue`.
- Para polling, usar `refetchInterval`.

### RF-03: Dashboard Server-First

- Páginas read-heavy (`admin/*`, `account`, `billing`, `settings` e equivalentes) iniciam por Server Component.
- Dados do primeiro paint vêm do servidor.
- `loading.tsx` para rotas com espera perceptível.

### RF-04: Performance Package (Dashboard/CRUD)

- GET de listagem com paginação explícita (`page/pageSize` ou `cursor/limit`).
- Client de listagem com `useInfiniteQuery`.
- Virtualização para listas de volume (`react-virtuoso` onde aplicável).
- Busca textual com `useDeferredValue` + threshold mínimo `3`.

### RF-05: Higiene e Anti-Legado

- Remover alias/wrapper legado no `src/`.
- Remover `console.log` de produção.
- Remover arquivos obsoletos, código morto e diretórios vazios pós-refactor.

### RF-06: Testes e Validação

- Toda mudança estrutural deve incluir teste novo/atualizado.
- Executar obrigatoriamente os testes criados/atualizados.
- Rodar validações proporcionais de lint/typecheck/build.

## 7. Workstreams

### WS-A: API Refactor (Routes -> Services -> Schemas)

Prioridade alta (ordem sugerida):
1. `admin/templates/*`
2. `admin/push-templates/*`
3. `admin/whatsapp-templates/*`
4. `admin/llm-usage/logs`
5. `community/requests` e `lesson-plans/refine-theme`
6. `track/push/[campaignId]` (eliminar escrita em GET)

Entregáveis:
- routes finas
- schemas centralizados
- serviços por domínio

### WS-B: React/TanStack Compliance

Prioridade alta:
- Migrar páginas client com fetch avulso para hooks TanStack adequados.
- Eliminar `useEffect` de debounce/sync de form.
- Trocar timers de polling por `refetchInterval`.

Alvos iniciais:
- `src/app/admin/templates/*/page.tsx`
- `src/app/admin/llm-usage/page.tsx`
- `src/components/dashboard/automations/automations-page-client.tsx`
- `src/app/(client)/community/page.tsx`

### WS-C: Server-First Dashboard

Prioridade média/alta:
- Converter páginas read-heavy para Server Component com componentes client locais para interação.
- Adicionar `loading.tsx` nas rotas críticas.

### WS-D: Performance Sweep

Prioridade média:
- Garantir paginação em todos os GET de listagem dashboard/CRUD.
- Padronizar `useInfiniteQuery` nas listagens relevantes.
- Confirmar virtualização onde há risco de volume.

### WS-E: Cleanup e Governança

Prioridade média:
- Remover `console.log`, alias legado (`useIsMobile`) e wrappers de compat sem valor.
- Adicionar/ajustar guardrails automatizados (lint/checks de arquitetura).

## 8. Plano de Entrega (Fases)

### Fase 0: Baseline e Travas (1 dia)

- Congelar baseline de não conformidades.
- Definir checklist de PR obrigatório.
- Inserir validações automáticas para bloquear regressão.

### Fase 1: Rotas Críticas (3-4 dias)

- Refatorar domains de templates + tracking + community/lesson plans críticos.
- Garantir zero Prisma direto nesses domínios.

### Fase 2: Client Fetch + Server-First (4-6 dias)

- Migrar páginas/admin prioritárias para server-first.
- Remover `useEffect + fetch` em lotes por domínio.

### Fase 3: Performance + Cleanup Final (2-3 dias)

- Completar pacote de performance em listagens pendentes.
- Limpeza final de legado/logs/código morto.

### Fase 4: Hardening e Go/No-Go (1-2 dias)

- Testes finais, validação de risco, relatório de compliance.

## 9. Critérios de Aceite (Definition of Done)

- `0` routes com Prisma direto.
- `0` schemas Zod inline em routes.
- `0` ocorrências de `useEffect` para fluxo de dados/fetch/debounce.
- `0` `console.log` em produção.
- `100%` listagens dashboard/CRUD com paginação explícita.
- `100%` listagens client prioritárias com TanStack (`useInfiniteQuery` quando aplicável).
- ausência de compatibilidade legada ativa no `src/`.
- testes novos/atualizados executados e reportados.

### 9.1 Interpretação Final do Gate de React

Para efeito de compliance final deste PRD, o gate técnico confiável passou a ser:

- `useEffectFetchFiles = 0`
- `clientFetchWithoutTanStackFiles = 0`
- `setIntervalOccurrences = 0`

O contador bruto de `useEffectOccurrences` permanece como métrica observacional, não como bloqueio automático, porque ainda agrega casos permitidos pela própria skill:

- integração com browser APIs (`serviceWorker`, `Notification`, `matchMedia`)
- timers de UX local (`setTimeout` para feedback visual)
- efeitos imperativos de UI (`focus`, carrossel, observers, splash/animation)

## 10. Métricas de Sucesso

- Compliance score interno: `100%` nos itens inegociáveis.
- Redução de tempo médio de review técnico.
- Redução de regressões em rotas/admin após release.
- Melhor estabilidade de TTFR em telas de dashboard principais.

## 11. Riscos e Mitigações

- Risco: refactor amplo causar regressão funcional.
  - Mitigação: entrega por domínio, testes direcionados e feature flags quando necessário.
- Risco: escopo crescer com melhorias oportunistas.
  - Mitigação: policy de “diff mínimo” e backlog separado para otimizações não críticas.
- Risco: desalinhamento entre squads sobre padrão route/service.
  - Mitigação: checklist único e exemplos canônicos por domínio.

## 12. Dependências

- Disponibilidade de mantenedores por domínio (resources, users, templates, community, billing).
- Janela de estabilização para refactors sem entrada de features conflitantes.
- Acordo de time sobre regra anti-legado inegociável.

## 13. Plano de Testes

- Unit tests de services alterados.
- Testes de schema Zod (inputs válidos/inválidos, limites).
- Testes de integração de rotas críticas.
- Smoke E2E dos fluxos: recursos, usuários, templates, community, billing/account.

Comandos mínimos por lote:
- `npm run lint`
- `npm run build`
- execução dos testes alterados no lote

## 14. Checklist Operacional por PR

- [ ] Route sem Prisma direto
- [ ] Schema fora da route
- [ ] Service em `src/services/[dominio]`
- [ ] Sem `useEffect` para dados/fluxo
- [ ] TanStack Query aplicado corretamente
- [ ] Paginação explícita em listagens
- [ ] Sem `console.log`
- [ ] Teste criado/atualizado e executado
- [ ] Sem arquivos obsoletos/diretórios vazios

## 15. Próximos Passos Imediatos

1. Aprovar este PRD.
2. Quebrar em issues por WS e fase.
3. Iniciar Fase 0 com baseline automatizada e bloqueios de regressão.
