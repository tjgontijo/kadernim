# 🎯 Sistema de Ads Premium (Freemium)

Sistema de injeção de banners premium similar ao AdSense. Banners aparecem **apenas para usuários FREE**, incentivando upgrade para Premium.

## 📦 Componentes

### 1. `AdSlot` - Slot de Banner
Renderiza um banner em uma posição específica. Não aparece para usuários premium.

```tsx
import { AdSlot } from '@/components/ads'

// Banner no header
<AdSlot slot="header" variant="default" />

// Banner inline (entre conteúdo)
<AdSlot slot="inline" variant="compact" />

// Banner na sidebar
<AdSlot slot="sidebar" variant="minimal" />
```

### 2. `AdInjector` - Injeção Automática
Injeta banners automaticamente entre elementos (como AdSense).

```tsx
import { AdInjector } from '@/components/ads'

<AdInjector injectAfter={3} variant="compact">
  {resources.map(resource => (
    <ResourceCard key={resource.id} {...resource} />
  ))}
</AdInjector>

// Injeta um banner a cada 3 recursos
```

### 3. `PageHeader` - Header Padrão
Header com slot de banner integrado (usa o componente existente do layout).

```tsx
import { PageHeader } from '@/components/layout/PageHeader'
import { BookOpen } from 'lucide-react'

<PageHeader 
  title="Meus Recursos"
  icon={<BookOpen className="h-5 w-5" />}
  description="Explore materiais pedagógicos"
  showAd={true}
/>
```

## 🎨 Variantes de Banner

### Default (Completo)
- Ícone grande
- Título e descrição
- 2 CTAs
- Dismissível

### Compact
- Ícone médio
- Título e descrição curta
- 1 CTA
- Dismissível

### Minimal
- Apenas texto + CTA
- Sem dismiss
- Ideal para sidebar

## 📍 Slots Disponíveis

| Slot | Uso | Variante Recomendada |
|------|-----|---------------------|
| `header` | Topo da página | `default` |
| `inline` | Entre conteúdo | `compact` |
| `sidebar` | Barra lateral | `minimal` |
| `footer` | Rodapé | `compact` |

## 🔧 Hook: `usePremiumStatus`

```tsx
import { usePremiumStatus } from '@/hooks/use-premium-status'

function MyComponent() {
  const { isPremium, isFree, showAds } = usePremiumStatus()
  
  return (
    <>
      {showAds && <AdSlot slot="header" />}
      {isPremium && <PremiumFeature />}
    </>
  )
}
```

## 📋 Exemplos de Uso

### Página com Header + Ads Inline

```tsx
import { PageHeader } from '@/components/layout/PageHeader'
import { AdInjector } from '@/components/ads'
import { BookOpen } from 'lucide-react'

export default function ResourcesPage() {
  return (
    <>
      {/* Header com banner */}
      <PageHeader 
        title="Recursos Pedagógicos"
        icon={<BookOpen className="h-5 w-5" />}
        description="Explore materiais de qualidade"
        showAd={true}
      />
      
      <div className="container mx-auto px-4 py-4">
        {/* Lista com ads injetados automaticamente */}
        <AdInjector injectAfter={4} variant="compact">
          {resources.map(resource => (
            <ResourceCard key={resource.id} {...resource} />
          ))}
        </AdInjector>
      </div>
    </>
  )
}
```

### Sidebar com Banner Minimal

```tsx
<aside className="w-64">
  <AdSlot slot="sidebar" variant="minimal" />
  
  <nav>
    {/* Menu items */}
  </nav>
</aside>
```

### Controle Manual

```tsx
import { usePremiumStatus } from '@/hooks/use-premium-status'
import { PremiumBanner } from '@/components/ads'

function CustomComponent() {
  const { showAds } = usePremiumStatus()
  
  if (!showAds) return null
  
  return <PremiumBanner slot="inline" variant="compact" />
}
```

## 🎯 Lógica de Exibição

✅ **Mostra banners quando:**
- `user.subscriptionTier === 'free'`
- `user.subscriptionTier === null`
- Usuário não autenticado

❌ **NÃO mostra banners quando:**
- `user.subscriptionTier === 'premium'`

## 🚀 Próximos Passos

- [ ] Sistema de dismiss com localStorage
- [ ] Controle de frequência (não mostrar após 3 dismisses)
- [ ] A/B testing de mensagens
- [ ] Analytics de conversão
- [ ] Variantes sazonais (Black Friday, etc)
