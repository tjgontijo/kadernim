# PRD: Dashboard Loading UX Standardization (Skeleton-First)

**Data de Criação:** 2026-04-19  
**Versão:** 1.0  
**Status:** Draft  
**Prioridade:** Alta  

---

## 1. Visão Geral

Este PRD define um padrão único de carregamento para páginas do dashboard, eliminando spinners de tela inteira e adotando `skeleton-first` para carregamento inicial de rota e de seções.

Objetivo central: o usuário sempre vê uma estrutura previsível da página durante carregamento, sem flicker e sem layouts inconsistentes.

---

## 2. Problema

### 2.1 Situação Atual
- Existem páginas com comportamento diferente de loading (skeleton parcial, spinner full-page, render antecipada de conteúdo).
- Em algumas rotas, a UI final aparece parcialmente antes da primeira resposta de dados.
- `loading.tsx` não é aplicado de forma consistente no dashboard.

### 2.2 Impacto
- Percepção de lentidão e instabilidade visual.
- Experiência inconsistente entre páginas.
- Maior custo de manutenção (cada página implementa loading de forma diferente).

---

## 3. Objetivos

1. Padronizar carregamento inicial de rota no dashboard.
2. Substituir spinner full-page por skeleton de layout equivalente (1:1).
3. Definir regras claras para `isLoading`, `isFetching`, `isFetchingNextPage`, empty e error states.
4. Reduzir regressões com checklist e critérios de aceite por rota.

---

## 4. Princípios do Padrão

1. **Skeleton-first:** tela de loading deve espelhar o layout real.
2. **Sem bloqueio visual desnecessário:** manter dados já carregados em refetch.
3. **Sem spinner de página inteira:** spinner apenas em ação local (botão, upload, download).
4. **Consistência acima de variação:** mesmas regras para todas as rotas do dashboard.
5. **Acessibilidade:** suporte a `prefers-reduced-motion` e sem dependência de animação para entendimento.

---

## 5. Escopo

### 5.1 Em Escopo
- Rotas de dashboard em `src/app/(dashboard)/**`.
- Criação/uso de `loading.tsx` por rota.
- Skeletons compartilhados e específicos por domínio.
- Migração inicial das rotas:
  - `/resources`
  - `/resources/[id]`

### 5.2 Fora de Escopo (v1)
- Landing pages públicas fora do dashboard.
- Redesign visual completo de componentes (este PRD trata loading, não rebranding).
- Mudanças profundas de arquitetura de dados/API.

---

## 6. Solução Proposta

### 6.1 Regras de Renderização

1. **Initial load sem dados** (`isLoading && !data` ou equivalente):
- Renderizar skeleton completo da área/página.

2. **Refetch com dados existentes** (`isFetching && data`):
- Manter conteúdo na tela.
- Mostrar indicador sutil contextual (ex.: ícone no campo de busca, barra discreta, badge de atualização).

3. **Paginação infinita** (`isFetchingNextPage`):
- Manter cards atuais.
- Exibir skeletons adicionais no fim da lista.

4. **Erro**:
- Exibir error state estável com ação de retry.

5. **Vazio**:
- Exibir empty state explícito e consistente.

### 6.2 Estrutura Recomendada

- `src/app/(dashboard)/<rota>/loading.tsx` para loading de navegação inicial (Next.js).
- Componente de skeleton reutilizável em `src/components/dashboard/.../skeletons`.
- Página cliente (`page.tsx`) com `early return` para carga inicial de query quando necessário.

### 6.3 Contrato de UI

Para cada rota relevante, definir:
- `PageSkeleton` (header, controles, conteúdo).
- `SectionSkeleton` (subblocos de cards/listas/painéis).
- Estados suportados: `loading`, `ready`, `fetching`, `empty`, `error`.

---

## 7. Plano de Implementação

### Fase 0: Auditoria e Matriz de Estados (4-6h)
- Inventariar rotas do dashboard e mapear:
  - possui `loading.tsx`?
  - usa spinner full-page?
  - possui empty/error state?
- Criar matriz por rota com decisão de skeleton necessário.

### Fase 1: Fundação de Componentes (6-8h)
- Definir componentes base de skeleton (shell, header, controls, grid/list).
- Padronizar tokens de espaçamento/altura para refletir layout real.
- Definir guideline técnica em documento de referência.

### Fase 2: Piloto em Recursos (8-12h)
- Migrar `/resources` para skeleton completo de página.
- Adicionar `src/app/(dashboard)/resources/loading.tsx`.
- Migrar `/resources/[id]` removendo spinner full-page.
- Adicionar `src/app/(dashboard)/resources/[id]/loading.tsx`.
- Validar estados: loading, refetch, empty, error, next page.

### Fase 3: Rollout no Dashboard (12-20h)
- Aplicar o padrão nas rotas de maior tráfego.
- Padronizar comportamento de refetch em páginas com filtros e busca.
- Remover padrões legados de loading.

### Fase 4: Hardening e Qualidade (6-8h)
- Testes de regressão visual/responsivo.
- Ajustes de acessibilidade e performance.
- Checklist final de conformidade por rota.

---

## 8. Critérios de Aceitação

1. Toda rota crítica do dashboard possui `loading.tsx` funcional.
2. Não há spinner de página inteira nas rotas padronizadas.
3. Skeleton inicial reflete layout final (diferença apenas de conteúdo).
4. Refetch não remove conteúdo previamente carregado.
5. Paginação infinita mantém conteúdo + skeleton incremental.
6. Empty e error states estão presentes e consistentes.

---

## 9. Métricas de Sucesso

### 9.1 Produto/UX
- Redução de reclamações sobre "tela piscando" / "carregamento estranho".
- Consistência visual percebida entre páginas.

### 9.2 Técnica
- `% de rotas do dashboard com loading padronizado`.
- `% de rotas sem spinner full-page`.
- Tempo médio para implementar loading em nova rota (deve cair após padronização).

---

## 10. Riscos e Mitigações

1. **Risco:** Skeleton não reflete layout e gera salto visual.  
**Mitigação:** revisão 1:1 comparando screenshot de loading vs estado final.

2. **Risco:** Regressão de UX em mobile por alturas fixas.  
**Mitigação:** validação responsiva obrigatória (`sm`, `md`, `lg`).

3. **Risco:** Implementação heterogênea por rota/time.  
**Mitigação:** checklist único + componentes compartilhados.

4. **Risco:** Overhead de manutenção de muitos skeletons.  
**Mitigação:** componentes base reutilizáveis + variantes por página.

---

## 11. Checklist de Execução (v1)

- [ ] Criar matriz de rotas e estados atuais do dashboard.
- [ ] Definir componentes base de skeleton compartilhados.
- [ ] Implementar padrão em `/resources`.
- [ ] Implementar padrão em `/resources/[id]`.
- [ ] Remover spinner full-page dessas rotas.
- [ ] Validar desktop/mobile.
- [ ] Validar estados empty/error/refetch/next-page.
- [ ] Publicar guideline curta para novas páginas.

---

## 12. Definition of Done

Este PRD será considerado concluído quando:
1. Piloto de `resources` e `resources/[id]` estiver em produção interna sem spinner full-page.
2. Checklist da seção 11 estiver completo.
3. Time adotar o padrão como default para novas rotas de dashboard.

