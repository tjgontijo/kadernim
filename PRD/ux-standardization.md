# PRD: Padronização de UX nas Páginas Cliente

**Versão:** 1.0  
**Data:** 04/01/2026  
**Autor:** Frontend Architecture Team  
**Status:** Em Revisão

---

## 1. Contexto e Problema

Após uma auditoria técnica das páginas em `src/app/(client)`, identificamos **inconsistências críticas** que degradam a experiência do usuário e dificultam a manutenção do código:

| Problema | Impacto |
|----------|---------|
| Animações de página duplicadas | Jank visual, sensação de lentidão |
| Padrões de loading inconsistentes | Experiência fragmentada entre páginas |
| PWA sem bloqueio de gestos nativos | Swipe-back acidental no iOS |
| Ausência de um "Design System" de motion | Desenvolvedores aplicam animações ad-hoc |

---

## 2. Objetivos

### 2.1 Metas Primárias

1. **Single Source of Truth para Transições**: Todas as páginas devem herdar animações do layout, não definir suas próprias.
2. **Loading Skeleton Consistente**: Adotar um padrão único de skeleton para todas as listas e grids.
3. **PWA com Comportamento Nativo**: Bloquear gestos de navegação do browser no modo standalone.
4. **Motion Design Token**: Criar tokens reutilizáveis para animações em todo o app.

### 2.2 Métricas de Sucesso

- Zero duplicação de animações de entrada.
- 100% das páginas com skeleton padronizado.
- Testes PWA aprovados no Lighthouse (modo standalone).
- Tempo de First Contentful Paint inalterado ou melhorado.

---

## 3. Especificação Técnica

### 3.1 Transições de Página

#### Estado Atual
```
DashboardClientLayout (Framer Motion) 
  + page.tsx (CSS animate-in) 
  = Dupla animação
```

#### Estado Proposto
```
DashboardClientLayout (Framer Motion)
  └── page.tsx (nenhuma animação de entrada)
        └── Componentes internos (micro-interações opcionais)
```

#### Ação Requerida

| Arquivo | Ação |
|---------|------|
| `account/page.tsx` | Remover `animate-in fade-in slide-in-from-bottom-4 duration-700` |
| `lesson-plans/page.tsx` | Remover `animate-in fade-in slide-in-from-bottom-4 duration-500` do grid |
| `DashboardClientLayout.tsx` | Manter como fonte única de transição; ajustar timing se necessário |

#### Configuração Recomendada para Layout

```tsx
// DashboardClientLayout.tsx - Animação SUTIL
const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15, ease: 'easeOut' } // 150ms, apenas fade
}
```

> **Filosofia**: Apenas `opacity` — sem movimento vertical (`y`). Mais rápido, mais leve, menos "forçado".

---

### 3.2 Loading & Skeleton Strategy

#### Conceitos: `loading.tsx` vs Skeleton

| Conceito | O que é | Quando usar |
|----------|---------|-------------|
| **`loading.tsx`** | Arquivo Next.js que renderiza enquanto o Server Component carrega | Páginas SSR puras, sem `'use client'` |
| **Skeleton** | Componente de UI que imita a estrutura do conteúdo | Páginas client-side enquanto dados são fetched |

> **Decisão**: Como todas as páginas em `/app/(client)` são `'use client'`, o `loading.tsx` é praticamente inútil. Vamos padronizar em **Skeletons inline** dentro de cada página.

---

#### Problema Atual

Os skeletons atuais são **retângulos genéricos** que não refletem a estrutura real do conteúdo:

| Página | Skeleton Atual | Conteúdo Real | Match? |
|--------|---------------|---------------|--------|
| `/account` | Spinner central | Profile card + subscription card | ❌ |
| `/community` | 8x retângulos (`h-[320px]`) | Header + Highlight + Controls + Grid | ❌ |
| `/lesson-plans` | 6x retângulos (`h-56`) | Header + Highlight + Controls + Grid | ⚠️ Parcial |
| `/resources` | Via ResourceGrid | Header + Highlight + Controls + Grid | ❌ Nenhum |

---

#### Full Page Skeleton: Estrutura Base

Cada página segue o padrão `PageScaffold`:

```
┌─────────────────────────────────────┐
│ HEADER: Título + Botão de Ação      │
├─────────────────────────────────────┤
│ HIGHLIGHT: Banner / Tabs / Progress │
├─────────────────────────────────────┤
│ CONTROLS: Busca + Filtro            │
├─────────────────────────────────────┤
│ CONTENT: Grid de Cards              │
└─────────────────────────────────────┘
```

```tsx
// Skeleton base para qualquer página que use PageScaffold
function PageScaffoldSkeleton({ 
  showHighlight = true,
  CardSkeleton,
  cardCount = 6 
}: {
  showHighlight?: boolean;
  CardSkeleton: React.ComponentType;
  cardCount?: number;
}) {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" /> {/* Título */}
        <Skeleton className="h-12 w-32 rounded-2xl" /> {/* Botão */}
      </div>

      {/* HIGHLIGHT */}
      {showHighlight && (
        <Skeleton className="h-20 w-full rounded-2xl" />
      )}

      {/* CONTROLS */}
      <div className="flex gap-3">
        <Skeleton className="h-12 flex-1 rounded-2xl" /> {/* Search */}
        <Skeleton className="h-12 w-12 rounded-2xl" /> {/* Filter */}
      </div>

      {/* GRID */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cardCount }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
```

---

#### Especificações de Skeleton por Página

##### `/account` - Profile Skeleton

```tsx
// Estrutura esperada:
// 1. Avatar circular grande
// 2. Nome + badges
// 3. 3x linhas de info (email, phone, date)
// 4. Card de assinatura

function AccountSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      {/* Profile Card */}
      <Card className="pt-12">
        <div className="flex flex-col items-center mb-12">
          <Skeleton className="h-40 w-40 rounded-full" /> {/* Avatar */}
          <Skeleton className="h-8 w-48 mt-6" /> {/* Name */}
          <Skeleton className="h-6 w-24 mt-2 rounded-full" /> {/* Badge */}
        </div>
        <div className="space-y-6 px-8 pb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-2xl" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>
          ))}
        </div>
      </Card>
      {/* Subscription Card */}
      <Card>
        <Skeleton className="h-24 w-full" />
      </Card>
    </div>
  );
}
```

##### `/community` - RequestCard Skeleton

```tsx
// Estrutura RequestCard:
// Header: Badge subject + date
// Body: Badge grade + title (2 lines) + description (3 lines)
// Footer: Avatar + name | Vote count + button

function RequestCardSkeleton() {
  return (
    <Card className="rounded-[32px] overflow-hidden flex flex-col h-[320px]">
      {/* Header */}
      <div className="p-5 flex justify-between border-b border-border/40 bg-muted/5">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-4 w-12" />
      </div>
      {/* Body */}
      <div className="p-6 pb-4 space-y-3 flex-grow">
        <Skeleton className="h-5 w-20 rounded-lg" /> {/* Grade badge */}
        <Skeleton className="h-6 w-full" /> {/* Title line 1 */}
        <Skeleton className="h-6 w-3/4" /> {/* Title line 2 */}
        <div className="space-y-2 mt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      {/* Footer */}
      <div className="p-6 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-10 w-10 rounded-2xl" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-12" />
          <Skeleton className="h-14 w-14 rounded-[20px]" />
        </div>
      </div>
    </Card>
  );
}
```

##### `/lesson-plans` - PlanCard Skeleton

```tsx
// Estrutura PlanCard:
// Title (2 lines) + 3x meta lines + divider + badges + date

function PlanCardSkeleton() {
  return (
    <Card className="rounded-2xl p-6 h-56 flex flex-col justify-between">
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4" /> {/* Title line 1 */}
        <Skeleton className="h-6 w-1/2" /> {/* Title line 2 */}
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-3.5 rounded" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>
      </div>
      <div className="pt-4 border-t border-border/40 flex justify-between">
        <div className="flex gap-1.5">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-20" />
      </div>
    </Card>
  );
}
```

##### `/resources` - ResourceCard Skeleton

```tsx
// Estrutura ResourceCard:
// Image 1:1 + Badge overlay + Title + Description + Badges footer

function ResourceCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Image area - 1:1 aspect ratio */}
      <div className="aspect-square bg-muted animate-pulse relative">
        <Skeleton className="absolute left-2 top-2 h-6 w-16 rounded-full" />
      </div>
      {/* Content */}
      <div className="p-6 min-h-[160px] flex flex-col">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4 mt-1" />
        <div className="my-2 h-px bg-border/50" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full mt-1" />
        <Skeleton className="h-4 w-2/3 mt-1" />
        <div className="mt-auto flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </Card>
  );
}
```

---

#### Implementação: Componentes Unificados

Criar componentes de skeleton reutilizáveis em `src/components/client/shared/skeletons/`:

| Arquivo | Uso |
|---------|-----|
| `profile-skeleton.tsx` | `/account` |
| `request-card-skeleton.tsx` | `/community` grid |
| `plan-card-skeleton.tsx` | `/lesson-plans` grid |
| `resource-card-skeleton.tsx` | `/resources` grid |
| `page-grid-skeleton.tsx` | Wrapper genérico com grid responsivo |

```tsx
// page-grid-skeleton.tsx
interface PageGridSkeletonProps {
  count?: number;
  CardSkeleton: React.ComponentType;
  columns?: { sm?: number; md?: number; lg?: number; xl?: number };
}

export function PageGridSkeleton({ 
  count = 6, 
  CardSkeleton,
  columns = { sm: 1, md: 2, lg: 3 }
}: PageGridSkeletonProps) {
  return (
    <div className={cn(
      "grid gap-6",
      `grid-cols-1`,
      columns.md && `md:grid-cols-${columns.md}`,
      columns.lg && `lg:grid-cols-${columns.lg}`,
      columns.xl && `xl:grid-cols-${columns.xl}`
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
```

---

#### Responsividade: Mobile vs Desktop

| Página | Mobile (1 col) | Tablet (2 col) | Desktop (3+ col) |
|--------|---------------|----------------|------------------|
| `/community` | 4 skeletons | 6 skeletons | 8 skeletons |
| `/lesson-plans` | 3 skeletons | 4 skeletons | 6 skeletons |
| `/resources` | 4 skeletons | 6 skeletons | 8 skeletons |
| `/account` | 1 profile skeleton | 1 profile skeleton | 1 profile skeleton |

---

### 3.3 PWA Native-App Behaviors

#### Filosofia: Gestos Nativos Habilitados

**Decisão de Design**: Permitir gestos nativos (swipe-back, pull-to-refresh) para manter a experiência familiar de apps iOS/Android. Bloquear gestos apenas em contextos críticos onde a saída acidental seria prejudicial.

#### Estado Atual

- ✅ `display: standalone` no manifest
- ✅ Utility classes para `overscroll-behavior`
- ✅ Gestos nativos funcionando (swipe-back, etc.)

#### Abordagem Híbrida

| Contexto | Gestos | Justificativa |
|----------|--------|---------------|
| Navegação geral | ✅ Permitidos | UX nativa e familiar |
| Listas e grids | ✅ Permitidos | Exploração natural |
| Wizards (CreatePlanDrawer) | ❌ Bloqueados | Evitar perda de progresso |
| Modais de confirmação | ❌ Bloqueados | Forçar decisão explícita |
| Players de mídia | ❌ Bloqueados | Evitar saída acidental |

#### Implementação Seletiva

Aplicar bloqueio **apenas nos componentes críticos**, não globalmente:

```tsx
// Exemplo: Drawer de criação de plano
<DrawerContent 
  className="touch-none" // Bloqueia gestos de swipe
  onPointerDownOutside={(e) => e.preventDefault()} // Evita fechar por toque fora
>
  {/* Wizard content */}
</DrawerContent>
```

```css
/* Utility class para contextos críticos */
.gesture-lock {
  touch-action: none;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: auto;
}
```

#### Melhorias Opcionais

1. **Pull-to-refresh customizado**: Implementar refresh via API em vez do nativo.
2. **Haptic feedback**: Usar `navigator.vibrate()` para feedback tátil em ações.
3. **Smooth scroll**: Garantir `-webkit-overflow-scrolling: touch` em listas longas.

#### Verificação

- Testar no Safari iOS em modo Add to Home Screen.
- Verificar que swipe lateral não navega para trás.
- Confirmar que pull-to-refresh não recarrega a página.

---

### 3.4 Motion Design Tokens

> **Filosofia**: Animações devem ser **imperceptíveis conscientemente** — o usuário sente fluidez, mas não "vê" a animação. Nada forçado.

Criar um arquivo central para tokens de animação:

```ts
// lib/motion/tokens.ts
export const MOTION = {
  // Durations (em segundos) - todas curtas
  duration: {
    instant: 0.1,   // Feedback imediato (botões)
    fast: 0.15,     // Transições de página
    normal: 0.2,    // Modais, drawers
  },

  // Easings simples
  ease: {
    default: 'easeOut',
    smooth: 'easeInOut',
  },

  // Page transitions - APENAS OPACITY
  page: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  // Card hover - sutil
  cardHover: {
    whileHover: { scale: 1.01 },  // Quase imperceptível
    whileTap: { scale: 0.99 },
  },

  // Fade in simples
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.15 },
  },
} as const;
```

#### Regras de Animação

| ✅ Permitido | ❌ Evitar |
|-------------|----------|
| `opacity` | `y`, `x` grandes (>4px) |
| `scale` sutil (0.99-1.02) | `rotate` |
| `duration` ≤200ms | `duration` >300ms |
| `easeOut` | `spring` com bounce |

---

### 3.5 Navigation Performance

#### Objetivo: Navegação Instantânea

O usuário deve perceber **redirecionamento imediato** ao clicar. Qualquer delay >100ms é percebido como lentidão.

#### Estratégias de Performance

| Técnica | O que faz | Quando ativa |
|---------|----------|--------------|
| **Prefetch on Viewport** | Next.js Link pré-carrega páginas visíveis | Automático (`prefetch={true}`) |
| **Prefetch on Hover** | Pré-carrega ao passar o mouse | 200ms antes do clique |
| **Skeleton First** | Renderiza skeleton antes do fetch | Imediato na montagem |
| **Optimistic Transition** | Muda de tela antes dos dados chegarem | Clique do usuário |

#### Implementação

##### 1. Next.js Link Prefetch (Padrão)

```tsx
// Links internos já fazem prefetch automático
<Link href="/resources">Materiais</Link> // ✅ prefetch=true por padrão
```

##### 2. Prefetch on Hover (Para Links Importantes)

```tsx
import { useRouter } from 'next/navigation';

function NavLink({ href, children }) {
  const router = useRouter();
  
  return (
    <Link 
      href={href}
      onMouseEnter={() => router.prefetch(href)}
      onTouchStart={() => router.prefetch(href)}
    >
      {children}
    </Link>
  );
}
```

##### 3. Skeleton-First Rendering

```tsx
// ❌ ERRADO: Spinner enquanto carrega
if (isLoading) return <Spinner />;
return <Content data={data} />;

// ✅ CORRETO: Skeleton imediato, conteúdo substitui
return (
  <PageScaffold>
    <PageScaffold.Header title="Meus Planos" />
    {isLoading ? <PlanCardSkeleton /> : <PlanGrid data={data} />}
  </PageScaffold>
);
```

##### 4. Transição Ultra-Rápida no Layout

```tsx
// DashboardClientLayout.tsx
const INSTANT_TRANSITION = {
  initial: { opacity: 0.5 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { 
    duration: 0.15,  // 150ms - quase instantâneo
    ease: 'easeOut' 
  }
};
```

#### Checklist de Performance

- [ ] Todos os `<Link>` internos usam prefetch padrão
- [ ] Links de navegação principal usam prefetch on hover
- [ ] Nenhuma página exibe spinner central (sempre skeleton)
- [ ] Transição de página ≤200ms
- [ ] Skeleton aparece no primeiro frame após clique

#### Métricas Alvo

| Métrica | Valor Atual | Meta |
|---------|-------------|------|
| Time to First Skeleton | ~300ms | <100ms |
| Page Transition Duration | 300ms | 150ms |
| Perceived Load Time | Variável | Consistente |

## 4. Arquivos Afetados

| Arquivo | Modificação |
|---------|-------------|
| `src/app/(client)/account/page.tsx` | Remover CSS animation |
| `src/app/(client)/lesson-plans/page.tsx` | Remover CSS animation do grid |
| `src/app/(client)/resources/loading.tsx` | Deletar ou implementar skeleton |
| `src/app/globals.css` | Adicionar regras PWA no root |
| `src/components/client/layout/DashboardClientLayout.tsx` | Padronizar transição |
| `src/lib/motion/tokens.ts` | **[NOVO]** Tokens de animação |
| `src/components/client/shared/page-grid-skeleton.tsx` | **[NOVO]** Skeleton unificado |

---

## 5. Plano de Implementação

### Fase 1: Eliminação de Duplicações (1h)
- [ ] Remover animações CSS das páginas
- [ ] Ajustar `DashboardClientLayout` com tokens

### Fase 2: Skeleton Padronizado (2h)
- [ ] Criar `PageGridSkeleton`
- [ ] Atualizar `/account` para usar skeleton
- [ ] Remover `loading.tsx` do `/resources`

### Fase 3: PWA Hardening (1h)
- [ ] Adicionar regras CSS ao root
- [ ] Testar em dispositivo iOS real
- [ ] Validar com Lighthouse PWA

### Fase 4: Motion Tokens (1h)
- [ ] Criar `lib/motion/tokens.ts`
- [ ] Migrar `DashboardClientLayout` para usar tokens
- [ ] Atualizar `QuizCard` e outros componentes

---

## 6. Critérios de Aceite

- [ ] Nenhuma página tem animação CSS de entrada própria
- [ ] Transição entre páginas é suave e única (sem "double fade")
- [ ] Todos os grids usam o mesmo componente de skeleton
- [ ] PWA no iOS não permite swipe-back
- [ ] Tokens de motion estão documentados e em uso

---

## 7. Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| Regressão visual em animações | Média | Testes visuais antes/depois |
| Breaking change em PWA | Baixa | Testar em staging antes de prod |
| Performance de Framer Motion | Baixa | Usar `will-change` e `transform` |

---

## 8. Referências

- [Framer Motion Best Practices](https://www.framer.com/motion/)
- [Apple HIG: Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- [Web.dev: PWA Patterns](https://web.dev/patterns/pwa/)
