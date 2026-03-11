# PRD 04: UI/UX Refinement & Accessibility Compliance

**Status:** 🟡 PLANEJAMENTO
**Prioridade:** 🔴 ALTA
**Data de Criação:** 11 Mar 2025
**Última Atualização:** 11 Mar 2025
**Versão:** 1.0

---

## 📋 ÍNDICE

1. [Resumo Executivo](#resumo-executivo)
2. [Contexto & Motivação](#contexto--motivação)
3. [Objetivos](#objetivos)
4. [Design System Consolidado](#design-system-consolidado)
5. [Problemas Críticos](#problemas-críticos)
6. [Requisitos Funcionais](#requisitos-funcionais)
7. [Requisitos Não-Funcionais](#requisitos-não-funcionais)
8. [Entregas por Fase](#entregas-por-fase)
9. [Timeline & Dependências](#timeline--dependências)
10. [Critérios de Sucesso](#critérios-de-sucesso)
11. [Riscos & Mitigação](#riscos--mitigação)

---

## Resumo Executivo

O Kadernim atualmente possui uma arquitetura UI sólida (shadcn/ui + Tailwind), mas apresenta **inconsistências visuais, problemas de acessibilidade e UX inadequada** em páginas críticas, especialmente no painel administrativo.

### Situação Atual
- ✅ Design system base implementado
- ✅ 50 componentes UI reutilizáveis
- ✅ Tema claro/escuro suportado
- ⚠️ Acessibilidade WCAG 2.1 não completa
- ⚠️ Responsividade inadequada em mobile (375px)
- ⚠️ Loading states pobres
- ⚠️ Dark mode não testado completamente

### Impacto nos Usuários
- 🔴 Usuários em mobile (375px) com experiência quebrada
- 🔴 Usuários com necessidades de acessibilidade excluídos
- 🔴 Admin dashboard com UX confusa em páginas críticas
- 🟡 Usuários com movimento/sensibilidade visual afetados

---

## Contexto & Motivação

### Por que agora?
1. **Pre-launch quality:** Antes de lançar, garantir padrão profissional
2. **WCAG compliance:** Acessibilidade é requisito legal em muitos países
3. **Mobile-first:** 60%+ dos acessos em mobile educacional
4. **Admin pain points:** Equipe relata UX confusa em relatórios
5. **Dark mode:** Usuários pedindo melhor suporte

### Alinhamento com Visão
- ✅ Kadernim = plataforma educacional "simples e poderosa"
- ✅ Acessibilidade = faz parte da missão inclusiva
- ✅ Mobile-first = professores usam celular na sala

---

## Objetivos

### Primário
- **Atingir WCAG 2.1 AA** em todas as páginas críticas
- **Responsividade 100%** de 375px até 1440px
- **Mobile UX > 8.5/10** em teste com usuários reais

### Secundário
- Melhorar performance em admin (CLS < 0.1, LCP < 2.5s)
- Consolidar design system em documentation
- Treinar time em padrões de acessibilidade

### Terciário
- Implementar dark mode em 100% das páginas
- Adicionar motion-driven animations (respeitando prefers-reduced-motion)
- Documentar componentes com Storybook (opcional)

---

## Design System Consolidado

### 🎨 Paleta de Cores

```
PRIMARY (Confiança, Profissionalismo)
├─ #2563EB - Azul Indigo (Actions, Links)
├─ #3B82F6- Azul Claro (Secondary, Hovers)
└─ hsl(217 91% 60%) - CSS Variable

ACCENT (CTAs, Chamadas de Ação)
├─ #F97316 - Laranja (Primary Button, Highlights)
└─ hsl(25 95% 53%) - CSS Variable

SUCCESS (Confirmações, Positivos)
├─ #10B981 - Esmeralda
└─ hsl(160 84% 39%) - CSS Variable

WARNING (Alertas)
├─ #F59E0B - Âmbar
└─ hsl(45 96% 56%) - CSS Variable

DANGER (Destrutivos, Erros)
├─ #EF4444 - Vermelho
└─ hsl(0 84% 60%) - CSS Variable

NEUTRAL (Textos, Backgrounds)
├─ Light Mode:
│  ├─ #F8FAFC - Background
│  ├─ #1E293B - Text Primary
│  ├─ #64748B - Text Secondary
│  └─ #E2E8F0 - Borders/Dividers
└─ Dark Mode:
   ├─ #0F172A - Background
   ├─ #F8FAFC - Text Primary
   ├─ #CBD5E1 - Text Secondary
   └─ #334155 - Borders/Dividers
```

### 📝 Tipografia

```
HEADINGS (Luxo + Minimalista)
├─ Font: Bodoni Moda (serif, refined)
├─ Weights: 400, 500, 600, 700
└─ Size Scale: 24px → 32px → 48px

BODY (Profissional + Legível)
├─ Font: Inter ou Jost (sans-serif)
├─ Weight: 400 (body), 500 (medium), 600 (semi-bold)
├─ Size: 14px (sm), 16px (base), 18px (lg)
└─ Line Height: 1.5-1.75

CODE/MONO
├─ Font: "Fira Code" ou "JetBrains Mono"
├─ Size: 12px-14px
└─ Usage: Input placeholder, badges, timestamps
```

**Implementação:**
```css
/* já em src/app/layout.tsx */
@import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;500;600;700&family=Jost:wght@300;400;500;600;700&display=swap');
```

### 📐 Spacing (8px Grid)

```
Mapa de Espaçamento:
├─ xs (4px)   - Between inline elements
├─ sm (8px)   - Button padding, small gaps
├─ md (16px)  - Card padding, section margins
├─ lg (24px)  - Large sections, modals
├─ xl (32px)  - Page padding, hero spacing
└─ 2xl (48px) - Section separation

Exemplo:
<div className="p-md gap-sm">  {/* padding: 16px, gap: 8px */}
  <button className="px-md py-sm" />  {/* padding: 16px 8px */}
</div>
```

### ✨ Componentes de Feedback

```
LOADING
├─ > 300ms: Mostrar skeleton screen (não spinner)
├─ 300ms-1s: Spinner com label "Carregando..."
└─ > 1s: Progress bar + descrição
┴─ Cor: hsl(var(--primary))
└─ Animation: 150ms ease-in-out

SUCCESS
├─ Toast: "✓ Ação realizada" (auto-dismiss 3-5s)
├─ Color: hsl(var(--success))
├─ Icon: CheckCircle (Lucide)
└─ Sound: Opcional (respeitando preferências)

ERROR
├─ Placement: Abaixo do campo problemático
├─ Color: hsl(var(--danger))
├─ Text: "Causa + Como Corrigir"
├─ Icon: AlertCircle (Lucide)
└─ Exemplo: "Email inválido. Use formato name@example.com"

WARNING
├─ Placement: Inline, acima de CTA destrutivo
├─ Color: hsl(var(--warning))
├─ Icon: AlertTriangle (Lucide)
└─ Exemplo: "Deletar é permanente. Não há undo."
```

---

## Problemas Críticos

### 🔴 P1: Acessibilidade (WCAG 2.1 AA Violations)

#### P1.1 - Contraste de Cores
**Afetadas:** Todas as páginas
**Severidade:** CRÍTICA
**Impacto:** ~8% população com daltonismo

```
PROBLEMA:
- Dark mode cores não testadas
- Charts com cores hardcoded sem fallback
- Muted text pode estar < 4.5:1 em alguns backgrounds

EXEMPLOS:
❌ Texto #64748B em fundo #F8FAFC = 5.8:1 ✅ (OK)
❌ Texto #64748B em fundo #0F172A (dark) = 4.2:1 ❌ (FALHA)

REQUISITOS:
- Normal text: 4.5:1 mínimo (AA) / 7:1 (AAA)
- Large text (18px+): 3:1 mínimo (AA) / 4.5:1 (AAA)
- Graphics & UI components: 3:1 mínimo
```

**Solução:**
- [ ] Auditar todas as cores em light e dark mode
- [ ] Usar ferramentas: WebAIM Contrast Checker, axe DevTools
- [ ] Criar CSS variables com garantia de contraste

---

#### P1.2 - Focus States Inadequados
**Afetadas:** Input, Button, Link, Checkbox, Radio, Select
**Severidade:** CRÍTICA
**Impacto:** Usuários navegando por teclado excluídos

```
PROBLEMA:
- Botões sem focus ring ou com ring removido
- Tab order não visível em mobile
- Focus trap não funciona em modals

EXEMPLOS:
❌ button { outline: none; }  /* Remove focus natural */
✅ button:focus-visible { outline: 2px solid; }

REQUISITOS:
- Focus ring: 2-4px, contraste 3:1 com background
- Keyboard nav: Tab, Shift+Tab, Enter, Space, Arrow Keys
- Focus visible: Em inputs, buttons, links, dropdowns
- Focus trap: Em modals/dialogs
- Tab order: Sequencial, lógico
```

**Solução:**
- [ ] Adicionar `focus:ring-2 focus:ring-offset-2` em todos os botões
- [ ] Verificar tab order com keyboard navigation
- [ ] Testar modals com FocusScope

---

#### P1.3 - ARIA Labels & Semantic HTML
**Afetadas:** Icons, Charts, Tables, Forms
**Severidade:** ALTA
**Impacto:** Screen reader users

```
PROBLEMA:
- Icons sem aria-label
- Charts sem descrição para SR
- Tabelas sem captions
- Inputs sem <label>

EXEMPLOS:
❌ <button><Trash2 /></button>  /* O que faz? */
✅ <button aria-label="Deletar recurso"><Trash2 /></button>

REQUISITOS:
- Cada icon button: aria-label descritivo
- Cada chart: aria-label com resumo de dados
- Cada tabela: <caption> ou aria-label
- Cada input: <label htmlFor> associado
- Heading hierarchy: h1 → h2 → h3 (sem pulos)
```

**Solução:**
- [ ] Audit all icon buttons: adicionar aria-label
- [ ] Add aria-label em charts (LLM usage page)
- [ ] Add <caption> em tabelas
- [ ] Verificar heading hierarchy

---

#### P1.4 - prefers-reduced-motion
**Afetadas:** Todas animações
**Severidade:** ALTA
**Impacto:** Usuários com vertigem, epilepsia

```
CSS PADRÃO:
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

REQUISITOS:
- Desabilitar todas animações quando active
- Manter funcionalidade visual
- Testar em DevTools (Rendering → Emulate CSS media)
```

**Solução:**
- [ ] Adicionar media query em globals.css
- [ ] Testar todas animações com a flag ativa

---

### 🔴 P2: Responsividade Mobile (375px)

#### P2.1 - Tabelas Horizontal Scroll
**Afetadas:** LLM Usage, Resources (table view)
**Severidade:** CRÍTICA

```
PROBLEMA:
Table com colunas demais não cabe em 375px
Resultado: Horizontal scroll é ruim no mobile

SOLUÇÃO (Stack Cards em Mobile):
// Desktop: Table view
// Mobile: Card view com colunas como linhas

<div className="hidden md:table">
  {/* Table for desktop */}
</div>

<div className="md:hidden">
  {/* Card stack for mobile */}
</div>
```

**Implementar:**
- [ ] Resources page: stacking/scrollable columns em mobile
- [ ] LLM Usage logs: card view alternative
- [ ] Testar 375px, 768px, 1024px

---

#### P2.2 - Touch Targets < 44px
**Afetadas:** Badge, Icon buttons, Dropdown triggers
**Severidade:** ALTA

```
REQUISITO:
- Mínimo 44x44px de área clicável (iOS)
- Mínimo 48x48dp (Android Material)
- Espaçamento mínimo 8px entre targets

EXEMPLO:
❌ <IconButton className="h-4 w-4" />  /* 16x16px */
✅ <IconButton className="h-8 w-8 p-2" />  /* 32x32px com padding */
```

**Auditar:**
- [ ] Icon buttons: min 44px
- [ ] Badge dismiss: min 44px touch area
- [ ] Dropdown triggers: min 44px height
- [ ] Usar `hitSlop` se necessário

---

#### P2.3 - Sidebar Navigation em Mobile
**Afetadas:** Admin layout
**Severidade:** ALTA

```
PROBLEMA:
- Sidebar sempre visível em desktop (ok)
- Em mobile, occupa todo screen (não ok)
- Drawer implementation pode estar quebrado

SOLUÇÃO:
// Mobile: Hamburger menu → Drawer
// Desktop: Always visible sidebar

Usar SidebarProvider corretamente:
<SidebarProvider defaultOpen={false}>  {/* closed on mobile */}
```

**Verificar:**
- [ ] Sidebar closed by default em mobile
- [ ] Hamburger icon sempre visível
- [ ] Drawer slides corretamente
- [ ] Fechar ao clicar item

---

### 🔴 P3: Loading States

#### P3.1 - Spinner Demais (sem skeleton)
**Afetadas:** LLM Usage, Resources, Admin pages
**Severidade:** ALTA

```
PROBLEMA:
- Spinner simples por > 1s = UX pobre
- Usuários desistem
- Sem skeleton = sem context visual

SOLUÇÃO (Progressive Loading):
< 300ms: Nada (rápido demais para notificar)
300ms-1s: Spinner com label
> 1s: Skeleton screen (layout placeholder)

IMPLEMENTAR SKELETONS:
- LLM Usage: Stats cards com skeleton
- Resources table: 5-6 rows skeleton
- Charts: Axis skeleton com shimmer
```

**Exemplo:**
```tsx
// Componente Skeleton:
<div className="space-y-4">
  <Skeleton className="h-12 w-full" />  {/* Card */}
  <Skeleton className="h-12 w-full" />
  <Skeleton className="h-12 w-full" />
</div>
```

**Tarefas:**
- [ ] Criar SkeletonCard, SkeletonTable, SkeletonChart
- [ ] Usar em Resources page
- [ ] Usar em LLM Usage page
- [ ] Usar em Admin dashboard

---

#### P3.2 - Loading em Modo Escuro
**Afetadas:** Spinners, Progress bars
**Severidade:** MÉDIA

```
PROBLEMA:
Spinner com cor hardcoded:
❌ border-b-2 border-primary (não responsivo ao tema)

SOLUÇÃO:
✅ Usar CSS variables: border-b-2 border-[hsl(var(--primary))]
```

---

### 🟡 P4: Dark Mode Testes Incompletos

#### P4.1 - Cores não Testadas em Dark Mode
**Afetadas:** Charts, Cards, Tables, Forms
**Severidade:** ALTA

```
PROBLEMA:
- Charts com cores hardcoded: ['#8884d8', '#82ca9d', ...]
- Em dark mode, pode ficar invisível
- Backgrounds/text contrast não testado

REQUISITOS:
- Testar todas cores em #0F172A background
- Todos os textos: 4.5:1 de contraste
- Charts: Usar CSS variables ao invés de hex
```

**Tarefas:**
- [ ] Audit all hardcoded colors
- [ ] Teste dark mode em todas páginas
- [ ] Converter chart colors para CSS vars
- [ ] Verificar contraste em backgrounds escuros

---

### 🟡 P5: Confirmação de Ações Destrutivas

#### P5.1 - Browser Confirm() Inadequado
**Afetadas:** Delete Resource (linha 83)
**Severidade:** MÉDIA

```
PROBLEMA:
❌ if (!confirm('Tem certeza?')) return;  /* Feia e pouco acessível */

SOLUÇÃO:
✅ Use AlertDialog customizado

IMPLEMENTAR:
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Deletar</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
      <AlertDialogDescription>
        Este recurso será deletado permanentemente.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={onDelete}>
        Deletar
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## Requisitos Funcionais

### RF1: Design System Documentation
```
ENTREGA:
- [ ] Arquivo: docs/DESIGN_SYSTEM.md
- [ ] Cores com exemplos de uso
- [ ] Tipografia com size scale
- [ ] Spacing grid 8px
- [ ] Componentes base (Button, Card, Input, etc)
- [ ] Padrões de feedback (toast, skeleton, empty state)
```

### RF2: Acessibilidade WCAG 2.1 AA
```
ENTREGA:
- [ ] Contraste 4.5:1 em light mode (todas páginas)
- [ ] Contraste 4.5:1 em dark mode (todas páginas)
- [ ] Focus ring visível (2-4px)
- [ ] Keyboard navigation completo
- [ ] aria-label em todos icon buttons
- [ ] aria-label em charts
- [ ] Tabelas com <caption>
- [ ] prefers-reduced-motion respeitado

PÁGINAS:
✓ Home/Pricing (se existir)
✓ Login
✓ Admin Dashboard
✓ Admin LLM Usage
✓ Admin Resources
✓ Admin Templates (Push/WhatsApp)
✓ Client Lesson Plans
✓ Client Resources
```

### RF3: Responsividade 100%
```
BREAKPOINTS:
- 375px  (iPhone SE, Galaxy S5)
- 480px  (Landscape mobile)
- 768px  (iPad)
- 1024px (iPad Pro, Desktop small)
- 1440px (Desktop large)

TESTES:
✓ Sem horizontal scroll
✓ Touch targets ≥ 44px
✓ Readable text (16px min base)
✓ Sidebar collapsa em mobile
✓ Modals responsivos
✓ Tabelas stack em mobile
```

### RF4: Loading States Melhorados
```
ENTREGA:
- [ ] Skeleton screens para todas list pages
- [ ] Progress indicator para operações > 1s
- [ ] Spinner com label descritivo
- [ ] Loading state em form submit
- [ ] Disabled state durante upload/save

COMPONENTES:
✓ SkeletonCard
✓ SkeletonTable (5-6 rows)
✓ SkeletonChart
✓ SkeletonForm
```

### RF5: Dark Mode Completo
```
ENTREGA:
- [ ] Todas cores testadas em dark mode
- [ ] Charts responsivos ao tema
- [ ] Backgrounds visíveis em dark
- [ ] Borders/separators visíveis
- [ ] Contraste validado

VERIFICAR:
✓ CSS variables aplicadas
✓ Tailwind dark: prefix funcionando
✓ next-themes integrado
```

### RF6: Modal & Dialog UX
```
ENTREGA:
- [ ] Confirmação destrutiva com AlertDialog
- [ ] Modals centrados com backdrop
- [ ] Focus trap em modals
- [ ] Close button acessível (X ou Esc)
- [ ] Scrim 40-60% opacity

USAR:
✓ DeleteConfirmDialog componente compartilhado
✓ Aplicar em: Delete Resource, Delete Template, etc
```

---

## Requisitos Não-Funcionais

### RNF1: Performance
```
MÉTRICAS (Core Web Vitals):
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

AÇÕES:
✓ Images com aspectRatio (previne CLS)
✓ Lazy load abaixo do fold
✓ Font display: swap (FOIT prevention)
✓ Virtualize long lists (50+ items)
```

### RNF2: Browser Support
```
SUPORTE:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari 14+

TESTES:
✓ BrowserStack ou similar
✓ Testar responsividade em cada
```

### RNF3: Acessibilidade Automated Testing
```
FERRAMENTAS:
- [ ] axe DevTools (Chrome extension)
- [ ] Lighthouse (built-in Chrome)
- [ ] WAVE (WebAIM)
- [ ] Pa11y (CLI)

SETUP:
- [ ] Pre-commit hook para axe scan
- [ ] CI/CD: Lighthouse checks
```

---

## Entregas por Fase

### 🎯 Fase 1: Fundação (Semana 1)
**Objetivo:** Críticos resolvidos
**Esforço:** 40 horas

#### Tarefas:
```
[ ] 1.1 - Audit contraste todas as cores (light + dark)
    └─ Tool: WebAIM Contrast Checker
    └─ Doc: Planilha cores com ratios

[ ] 1.2 - Adicionar focus rings visíveis
    ├─ Button: focus:ring-2
    ├─ Input: focus:ring-2
    ├─ Link: focus:ring-2
    └─ Test: Tab navigation

[ ] 1.3 - Criar componentes Skeleton
    ├─ SkeletonCard
    ├─ SkeletonTable
    ├─ SkeletonChart
    └─ SkeletonForm

[ ] 1.4 - Respeitar prefers-reduced-motion
    └─ globals.css: @media (prefers-reduced-motion)

[ ] 1.5 - Testar responsividade 375px
    ├─ LLM Usage page
    ├─ Resources page
    └─ Admin templates

[ ] 1.6 - Dark mode audit cores
    ├─ Charts colors → CSS vars
    ├─ Text contrast dark: 4.5:1
    └─ Backgrounds visibility
```

**Entregas:**
- docs/DESIGN_SYSTEM.md (v1)
- SkeletonCard, SkeletonTable componentes
- Focus ring CSS aplicado
- Dark mode color audit report

---

### 🎯 Fase 2: Melhorias (Semana 2)
**Objetivo:** UX & Acessibilidade refinada
**Esforço:** 40 horas

#### Tarefas:
```
[ ] 2.1 - aria-label em todos icon buttons
    └─ Buscar: "icon button" no projeto
    └─ Adicionar aria-label com ação

[ ] 2.2 - Charts acessibilidade
    ├─ LLM Usage: aria-label em charts
    ├─ Add: table alternativa para dados
    └─ Tooltip keyboard accessible

[ ] 2.3 - Tabelas acessibilidade
    ├─ Resources table: <caption>
    ├─ Templates table: <caption>
    └─ Add: aria-sort em sortable columns

[ ] 2.4 - Mobile sidebar/navigation
    ├─ Drawer functions corretamente
    ├─ Hamburger sempre visível
    └─ Close on item click

[ ] 2.5 - Modals & Dialogs
    ├─ DeleteConfirmDialog componente
    ├─ Apply em Delete actions
    ├─ Focus trap
    └─ Esc key close

[ ] 2.6 - Form validation UX
    ├─ Error placement (abaixo do campo)
    ├─ Inline validation on blur
    ├─ Helper text para campos complexos
    └─ Required indicator (*)

[ ] 2.7 - Empty states
    ├─ Resources sem items
    ├─ Templates sem items
    ├─ Logs sem dados
    └─ Com CTA para criar
```

**Entregas:**
- aria-labels implementados
- DeleteConfirmDialog componente
- Form validation melhorado
- Empty state components

---

### 🎯 Fase 3: Polish (Semana 3)
**Objetivo:** Refinamento final & documentação
**Esforço:** 30 horas

#### Tarefas:
```
[ ] 3.1 - Animations suaves (com reduced-motion)
    ├─ Scroll reveals (hero section)
    ├─ Card entrance 150-300ms
    └─ Modal scale + fade

[ ] 3.2 - Touch feedback
    ├─ Button press: scale 0.95
    ├─ Card press: elevation change
    └─ Smooth transitions 200ms

[ ] 3.3 - Character counters
    ├─ Push template: 100 char title
    ├─ Push template: 500 char body
    ├─ WhatsApp template: body counter
    └─ Visual warning @ 80%

[ ] 3.4 - Copy & Paste improvements
    ├─ Toast "Copiado!" on copy
    ├─ Clipboard feedback
    └─ Keyboard shortcuts

[ ] 3.5 - Loading optimizations
    ├─ Lazy load modals
    ├─ Code split por route
    └─ Font preload critical

[ ] 3.6 - Final accessibility audit
    ├─ Run: axe DevTools
    ├─ Run: Lighthouse
    ├─ Run: WAVE
    └─ Fix remaining issues

[ ] 3.7 - Documentation
    ├─ docs/DESIGN_SYSTEM.md (final)
    ├─ docs/ACCESSIBILITY.md
    ├─ CHANGELOG
    └─ Component usage guide
```

**Entregas:**
- All animations polished
- Character counters implementados
- Final accessibility audit passed
- Complete documentation

---

## Timeline & Dependências

### Cronograma Sugerido
```
SEMANA 1 (Mar 17-23):    Fase 1 - Fundação
  ├─ Seg-Qua: Audits (contraste, focus)
  ├─ Qua-Sex: Skeletons + dark mode
  └─ Sex-Seg: Testing & fixes

SEMANA 2 (Mar 24-30):    Fase 2 - UX
  ├─ Seg-Qua: aria-labels, charts
  ├─ Qua-Sex: Mobile, modals
  └─ Sex-Seg: Testing

SEMANA 3 (Mar 31-Abr 6): Fase 3 - Polish
  ├─ Seg-Qua: Animations, touch
  ├─ Qua-Sex: Counters, optimizations
  └─ Sex-Seg: Final audit & docs
```

### Dependências
```
BLOQUEANTES:
❌ Nenhuma (mudanças são aditivas)

RECOMENDADAS:
⚠️ Revisar design system antes de criar novos componentes
⚠️ Usar token colors ao invés de hex hardcoded
```

---

## Critérios de Sucesso

### ✅ Sucesso = Todos os critérios atendidos

```
MÉTRICAS QUANTITATIVAS:

1. Contraste
   ✓ 100% das cores: 4.5:1 em light mode
   ✓ 100% das cores: 4.5:1 em dark mode
   ✓ Validado com WebAIM Contrast Checker

2. Focus Rings
   ✓ 100% dos inputs/buttons: ring-2 visível
   ✓ Tab navigation: sequencial
   ✓ Keyboard users: teste completo

3. Acessibilidade
   ✓ aria-label: 100% dos icon buttons
   ✓ axe scan: 0 violations críticas/sérias
   ✓ Lighthouse a11y: ≥ 90/100

4. Responsividade
   ✓ 375px: 0 horizontal scroll
   ✓ Touch targets: 100% ≥ 44px
   ✓ Modals: responsivos em todas resoluções

5. Performance
   ✓ LCP: < 2.5s
   ✓ FID: < 100ms
   ✓ CLS: < 0.1

6. Dark Mode
   ✓ 100% das páginas testadas
   ✓ Charts responsivos
   ✓ Contraste validado

MÉTRICAS QUALITATIVAS:

7. UX
   ✓ Usuários mobile: sem frustração > 2s
   ✓ Admin UX: tempo de tarefa reduzido 20%
   ✓ Feedback: loading/error/success claro

8. Code Quality
   ✓ Design tokens centralizados
   ✓ Componentes reutilizáveis
   ✓ Documentação atualizada
```

### 🧪 Teste de Aceitação

```
CENÁRIOS:

TC1: Login Accessibility
├─ [ ] Tab order correto
├─ [ ] Focus rings visível
├─ [ ] aria-label em botões
└─ [ ] Dark mode contrast OK

TC2: Admin LLM Usage Mobile (375px)
├─ [ ] Sem horizontal scroll
├─ [ ] Stats cards legível
├─ [ ] Chart toca corretamente
├─ [ ] Paginação funciona
└─ [ ] Touch targets 44px+

TC3: Admin Resources Delete
├─ [ ] Confirmação dialog
├─ [ ] Focus trap
├─ [ ] Acessível com teclado
└─ [ ] Aria-labels presentes

TC4: Form Validation
├─ [ ] Erro próximo ao campo
├─ [ ] Mensagem clara
├─ [ ] Inline validation on blur
└─ [ ] Helper text visível

TC5: Dark Mode
├─ [ ] Contraste 4.5:1
├─ [ ] Charts legível
├─ [ ] Sem hardcoded colors
└─ [ ] Borders/separators visível
```

---

## Riscos & Mitigação

### 🚨 Risco 1: Quebras em Componentes Existentes
**Probabilidade:** MÉDIA
**Impacto:** ALTO

```
PROBLEMA:
Adicionar focus rings/acessibilidade pode quebrar CSS existente

MITIGAÇÃO:
✓ Usar branch separado
✓ Test coverage antes de merge
✓ Review com full stack dev
✓ Rollback plan
```

### 🚨 Risco 2: Performance Degradação
**Probabilidade:** BAIXA
**Impacto:** ALTO

```
PROBLEMA:
Adicionar skeletons/animations pode aumentar bundle

MITIGAÇÃO:
✓ Monitor bundle size: bundlesize tool
✓ Lazy load skeletons
✓ Code split animations
✓ Gzip compression
```

### 🚨 Risco 3: Browser Incompatibilidade
**Probabilidade:** MÉDIA
**Impacto:** MÉDIO

```
PROBLEMA:
Algumas features em browsers antigos

MITIGAÇÃO:
✓ Test em BrowserStack
✓ Polyfills se necessário
✓ Graceful degradation
✓ Drop support de IE11
```

### 🚨 Risco 4: Escopo Creep
**Probabilidade:** ALTA
**Impacto:** MÉDIO

```
PROBLEMA:
Quando mexer em UI, aparecem "melhorias" adicionais

MITIGAÇÃO:
✓ Sprint fixo de 3 semanas
✓ Nice-to-have em Fase 4
✓ Escopo congelado no início
✓ Change request formal
```

---

## Apêndice A: Checklist Implementação

### Acessibilidade
```
CONTRASTE
[ ] Audit colors light mode
[ ] Audit colors dark mode
[ ] Chart colors CSS variables
[ ] Text contrast 4.5:1
[ ] Borders visibility

FOCUS & KEYBOARD
[ ] Focus ring 2-4px
[ ] Focus visible em inputs
[ ] Tab order sequencial
[ ] Modals: focus trap
[ ] Esc key closes dialogs

ARIA & SEMANTICS
[ ] aria-label icon buttons
[ ] aria-label charts
[ ] <caption> em tabelas
[ ] <label> em inputs
[ ] Heading hierarchy h1→h6

MOTION
[ ] prefers-reduced-motion
[ ] Animations ≤ 300ms
[ ] No infinite animations
[ ] Respectful effects
```

### Mobile Responsividade
```
BREAKPOINTS
[ ] 375px: iPhone SE
[ ] 480px: Landscape
[ ] 768px: Tablet
[ ] 1024px: Desktop small
[ ] 1440px: Desktop large

LAYOUT
[ ] No horizontal scroll
[ ] Touch targets ≥ 44px
[ ] Modals responsive
[ ] Tables stack mobile
[ ] Sidebar collapses

IMAGES
[ ] Aspect ratio declared
[ ] Lazy load below fold
[ ] WebP/AVIF support
[ ] Responsive srcset
```

### Dark Mode
```
[ ] All colors tested dark
[ ] Backgrounds visible
[ ] Text contrast dark
[ ] Borders visible dark
[ ] Charts responsive
[ ] Modal scrim dark
[ ] Form elements dark
[ ] Inputs dark mode
```

### Performance
```
[ ] LCP < 2.5s
[ ] FID < 100ms
[ ] CLS < 0.1
[ ] Font display: swap
[ ] Lazy load modals
[ ] Code splitting
[ ] Image optimization
[ ] Bundle size check
```

---

## Apêndice B: Referências

### WCAG 2.1 AA
- https://www.w3.org/WAI/WCAG21/quickref/
- https://www.w3.org/WAI/WCAG21/Understanding/

### Ferramentas
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- axe DevTools: https://www.deque.com/axe/devtools/
- Lighthouse: Built-in Chrome DevTools
- WAVE: https://wave.webaim.org/

### Design System
- Material Design: https://m3.material.io/
- Apple HIG: https://developer.apple.com/design/human-interface-guidelines/
- Tailwind CSS: https://tailwindcss.com/

### Learning
- "Inclusive Components" by Heydon Pickering
- Web Accessibility by Mozilla: https://developer.mozilla.org/en-US/docs/Web/Accessibility
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/

---

## Assinatura & Aprovação

| Papel | Nome | Data | Assinatura |
|-------|------|------|-----------|
| Product Owner | - | - | ☐ |
| Tech Lead | - | - | ☐ |
| Designer | - | - | ☐ |
| QA Lead | - | - | ☐ |

---

**Versão:** 1.0
**Última atualização:** 11 Mar 2025
**Próxima revisão:** 01 Abr 2025
**Status:** 🟡 PLANEJAMENTO → 🟢 DESENVOLVIMENTO (após aprovação)
