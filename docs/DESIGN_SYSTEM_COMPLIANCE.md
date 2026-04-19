# 🎨 Design System Compliance Guide

**Objetivo:** Garantir 100% conformidade com Kadernim Design System em todo o frontend.

**Last Updated:** 2026-04-19

---

## 📋 Index

1. [Design System Sources](#design-system-sources)
2. [Componentes Disponíveis](#componentes-disponíveis)
3. [Padrões de Código](#padrões-de-código)
4. [Checklist de Conformidade](#checklist-de-conformidade)
5. [CI/CD Automation](#cicd-automation)
6. [Code Review Guidelines](#code-review-guidelines)

---

## 🎯 Design System Sources

### Oficiais

| Fonte | Localização | Tipo | Status |
|-------|-----------|------|--------|
| **Design System HTML** | `docs/Kadernim/Design System.html` | Visual | ✅ Referência |
| **Detalhe do Recurso** | `docs/Kadernim/Detalhe do Recurso.html` | Wireframe | ✅ Referência |
| **CLAUDE.md** | Root | Behavioral | ✅ Obrigatório |
| **Components** | `src/components/design-system/` | Code | ✅ Canônico |

### Componentes Implementados

```
src/components/design-system/resources/
├─ ResourceGallery.tsx         (Galeria de imagens)
├─ ResourceOverview.tsx        (Resumo do recurso)
├─ ResourceObjectives.tsx      (Objetivos de aprendizagem)
├─ ResourceTimeline.tsx        (Passo-a-passo de aula)
├─ ResourceBNCC.tsx            (Habilidades BNCC)
├─ ResourceReviews.tsx         (Avaliações)
├─ ResourceActionSidebar.tsx   (Autor, botões de ação)
├─ ResourceRelatedStrip.tsx    (Combina com...)
├─ ResourceFilesList.tsx       (Lista de arquivos)
└─ ResourceShareCard.tsx       (Compartilhar)
```

---

## ✅ Componentes Disponíveis

### Design Tokens (Já Implementados)

**Colors:**
```typescript
// Terracotta (Primary)
bg-terracotta          // #D85C2D
text-terracotta        // #D85C2D

// Mustard (Accent)
bg-mustard             // #F5A623
text-mustard           // #F5A623

// Sage (Secondary)
bg-sage                // #7BA084
text-sage              // #7BA084

// Neutrals
bg-card                // #FFFFFF
bg-paper               // #F9F7F4
bg-ink                 // #2D2D2D
```

**Typography:**
```typescript
// Font classes
font-display           // Headline/Titles
font-hand              // Decorative (handwritten style)
font-mono              // Code/Technical

// Sizes
text-[24px]            // h1
text-[20px]            // h2
text-[18px]            // h3
text-[16px]            // body
text-[14px]            // small
text-[12px]            // caption
```

**Spacing:**
```typescript
// Consistent 8px grid
gap-[8px], gap-[16px], gap-[24px], gap-[32px], gap-[56px]
p-[16px], p-[24px], p-[32px]
m-[8px], m-[16px], m-[24px]
```

**Shadows:**
```typescript
shadow-1               // Light
shadow-2               // Medium
shadow-3               // Strong
```

**Border Radius:**
```typescript
rounded-4              // 4px (inputs, pills)
rounded-8              // 8px (cards)
rounded-full           // 50% (avatars)
```

### Componentes UI Reutilizáveis

**Em `/src/components/ui/`:**
- ✅ Button
- ✅ Card
- ✅ Badge
- ✅ Avatar
- ✅ Input
- ✅ Select
- ✅ Checkbox
- ✅ Switch
- ✅ Dialog
- ✅ Dropdown Menu
- ✅ Tabs
- ✅ Table
- ✅ Scroll Area

**REGRA:** Use SEMPRE estes componentes. Nunca crie novos `<button>`, `<input>`, etc. Use `<Button>`, `<Input>`.

---

## 🎨 Padrões de Código

### 1. Estrutura de Componente

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Icon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ComponentProps {
  title: string
  onAction?: () => void
}

export function ComponentName({ title, onAction }: ComponentProps) {
  // Estado
  const [state, setState] = useState(false)

  // Efeitos
  useEffect(() => {
    // Initialize
  }, [])

  // Handlers
  const handleClick = () => {
    setState(!state)
    onAction?.()
  }

  // Render
  return (
    <Card className="p-[24px] rounded-4">
      <h3 className="font-display font-semibold text-[20px] text-ink mb-[16px]">
        {title}
      </h3>
      <Button onClick={handleClick}>Action</Button>
    </Card>
  )
}
```

### 2. Classe Pattern (Tailwind)

**✅ CORRETO:**
```tsx
<div className="bg-card border border-line rounded-4 p-[24px] shadow-1">
  <h3 className="font-display font-semibold text-[20px] text-ink">Title</h3>
</div>
```

**❌ ERRADO:**
```tsx
<div style={{ backgroundColor: 'white', padding: '24px' }}>
  <h3 style={{ fontSize: '20px' }}>Title</h3>
</div>
```

### 3. Spacing Grid (8px)

**✅ CORRETO:**
```tsx
gap-[8px]    // 8px
gap-[16px]   // 16px (2×)
gap-[24px]   // 24px (3×)
gap-[32px]   // 32px (4×)
gap-[56px]   // 56px (7×)
```

**❌ ERRADO:**
```tsx
gap-2        // 8px (não explícito)
gap-3        // 12px (fora do grid)
gap-1        // 4px (muito pequeno)
```

### 4. Colors

**✅ CORRETO:**
```tsx
<span className="text-terracotta">Curadoria Kadernim</span>
<button className="bg-mustard hover:bg-mustard-600">Action</button>
<div className="bg-card border border-line">Content</div>
```

**❌ ERRADO:**
```tsx
<span className="text-orange-500">Curadoria</span>
<button className="bg-yellow-500">Action</button>
<div className="bg-white border border-gray-300">Content</div>
```

### 5. Responsive Design

**Breakpoints:**
- Mobile: < 640px (padrão)
- Tablet: sm (640px)
- Desktop: lg (1024px)

**✅ CORRETO:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">
  {items.map(item => <Card key={item.id} />)}
</div>
```

**❌ ERRADO:**
```tsx
<div className="grid grid-cols-4 gap-5">
  {/* Quebra em mobile */}
</div>
```

---

## 📋 Checklist de Conformidade

### Antes de Começar Implementação

**✅ Planejamento:**
- [ ] Verificar componentes análogos em `src/components/design-system/`
- [ ] Estudar Design System HTML (cores, tipografia, spacing)
- [ ] Verificar CLAUDE.md para guidelines comportamentais
- [ ] Criar branch com nome descritivo (`feat/component-name`)

### Ao Implementar

**✅ Código:**
- [ ] Usar componentes UI de `/src/components/ui/`
- [ ] Seguir estrutura: imports → interface → estado → handlers → render
- [ ] Usar Tailwind com valores do grid 8px
- [ ] Usar cores: terracotta, mustard, sage, card, ink
- [ ] Adicionar comentários APENAS para WHY não-óbvio
- [ ] Testar responsividade (mobile, tablet, desktop)

**✅ Acessibilidade:**
- [ ] `alt` em imagens
- [ ] `aria-label` em ícones (se sem texto)
- [ ] Cores com suficiente contraste (WCAG AA)
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Focus states visíveis

**✅ Performance:**
- [ ] `'use client'` apenas se houver state/effects
- [ ] Lazy loading de imagens
- [ ] Memoization se houver prop drilling
- [ ] No inline styles ou CSS modules (Tailwind only)

### Antes de fazer PR

**✅ Qualidade:**
- [ ] Lint/type check: `npm run type-check`
- [ ] Build local: `npm run build`
- [ ] Visual check: `npm run dev`
- [ ] Testar em mobile/tablet/desktop
- [ ] Screenshot da feature
- [ ] Documentação atualizada

**❌ NÃO FAZER:**
- [ ] Criar novos componentes UI (use os existentes)
- [ ] Usar inline styles ou CSS modules
- [ ] Hardcodar cores (use Tailwind)
- [ ] Adicionar bibliotecas CSS (use Tailwind)
- [ ] Commits em main (sempre PR)

---

## ⚙️ CI/CD Automation

### 1. ESLint Rules (Tailwind Compliance)

**Adicionar em `.eslintrc.json`:**

```json
{
  "rules": {
    "tailwindcss/no-custom-classname": "warn",
    "tailwindcss/classnames-order": "warn"
  }
}
```

### 2. Pre-commit Hook

**Criar `.husky/pre-commit`:**

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run type-check
npm run lint
npm run build
```

### 3. GitHub Actions (CI)

**Criar `.github/workflows/design-compliance.yml`:**

```yaml
name: Design System Compliance

on: [pull_request]

jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install deps
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        run: npm run build
      
      - name: Check Tailwind compliance
        run: npx tailwind-checker
```

### 4. Storybook (Component Documentation)

**Criar `.storybook/config.ts`:**

```typescript
export const decorators = [
  (Story) => (
    <div className="bg-paper p-[32px] min-h-screen">
      <Story />
    </div>
  ),
]
```

---

## 👀 Code Review Guidelines

### Ao Revisar PR de Frontend

**✅ Verificar:**

1. **Design System Compliance**
   - [ ] Usa componentes UI corretos?
   - [ ] Cores estão no Design System (terracotta, mustard, sage)?
   - [ ] Spacing segue grid 8px?
   - [ ] Tipografia segue guidelines?

2. **Acessibilidade**
   - [ ] Alt text em imagens?
   - [ ] ARIA labels onde necessário?
   - [ ] Contraste de cores OK (WCAG AA)?
   - [ ] Keyboard navigation funciona?

3. **Responsive**
   - [ ] Mobile first?
   - [ ] Breakpoints: sm, lg (não md)?
   - [ ] Testou em 3 resoluções?

4. **Code Quality**
   - [ ] Imports organizados?
   - [ ] Nenhum hardcode de valores?
   - [ ] Componentes desnecessários criados?
   - [ ] Simplificação possível?

### Comentários Padrão (Copiar/Colar)

**Design System:**
```
This color is not in our Design System. Please use terracotta, mustard, sage, or neutrals from globals.css
```

**Spacing:**
```
Please use 8px grid values (8, 16, 24, 32, 56). This breaks the consistency.
```

**Component Reuse:**
```
There's already a similar component in src/components/ui/. Can we reuse or extend it instead?
```

**Accessibility:**
```
This needs an aria-label since it's an icon without text. See WCAG 2.1 Level AA.
```

---

## 📚 Quick Reference

### Arquivo Estrutura

```
src/
├─ components/
│  ├─ ui/                    ← Componentes base (Button, Card, etc)
│  ├─ design-system/         ← Componentes de domínio (ResourceCard, etc)
│  │  └─ resources/          ← Resource-specific components
│  ├─ dashboard/             ← Dashboard-specific components
│  └─ shared/                ← Componentes comuns
├─ app/
│  ├─ (dashboard)/           ← Protected routes
│  └─ api/                   ← API routes
└─ lib/
   ├─ resources/             ← Resource business logic
   └─ schemas/               ← Zod validation
```

### Imports Padrão

```typescript
// UI Components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Design System
import { ResourceCard } from '@/components/design-system/resources'

// Icons
import { Icon } from 'lucide-react'

// Validation
import { z } from 'zod'

// Hooks
import { useQuery } from '@tanstack/react-query'
```

### Tailwind Classes (Memorize)

```
Colors:     terracotta, mustard, sage, card, paper, ink, line
Spacing:    gap-[8px], p-[16px], m-[24px], mb-[32px]
Shadows:    shadow-1, shadow-2, shadow-3
Radius:     rounded-4, rounded-8, rounded-full
Typography: font-display, font-hand, font-mono
```

---

## 🚀 Workflow Prático

### Ao Começar Task de Frontend

1. **Explorar Design System:**
   ```bash
   open docs/Kadernim/Design\ System.html
   code src/components/design-system/
   ```

2. **Estudar Componentes Análogos:**
   ```bash
   grep -r "className=" src/components/design-system/ | head -20
   ```

3. **Verificar Tailwind:**
   ```bash
   grep -r "bg-\|text-\|gap-" src/components/design-system/ | sort -u
   ```

4. **Criar PR com Checklist:**
   ```markdown
   ## Checklist de Conformidade
   - [ ] Design System: Cores (terracotta, mustard, sage)
   - [ ] Spacing: Grid 8px
   - [ ] Responsividade: Mobile first
   - [ ] Acessibilidade: Alt, aria-label, contrast
   - [ ] Type check: npm run type-check
   - [ ] Build local: npm run build
   ```

---

## 📞 Escalation

**Se encontrar desvio do Design System:**

1. **Menor:** Comentário no PR com sugestão
2. **Maior:** Bloquear merge + pedir revisão
3. **Pattern recorrente:** Atualizar documentação

**Dúvidas:**
- Design: Ver `docs/Kadernim/Design System.html`
- Components: Ver `src/components/design-system/`
- Guidelines: Ver `CLAUDE.md`
- Accessibility: Ver WCAG 2.1 AA

---

## ✨ Conclusão

**Objetivo:** 100% conformidade com Design System em cada commit.

**Mecânica:**
- ✅ Linters + type checking
- ✅ Pre-commit hooks
- ✅ CI/CD automático
- ✅ Code review guidelines
- ✅ Esta documentação

**Resultado:**
- Consistência visual
- Experiência coerente
- Escalabilidade
- Facilidade de manutenção

---

**Last Reviewed:** 2026-04-19  
**Maintainer:** Arquitetura Frontend  
**Version:** 1.0
