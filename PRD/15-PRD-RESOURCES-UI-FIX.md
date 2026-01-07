# PRD: Correção de Resources UI e Imagens

## Problema que resolve

A tela de listagem e detalhe de recursos (`/resources` e `/resources/[id]`) apresenta os seguintes problemas críticos:

1. **Imagens:** O sistema ignora a coluna `url` da model `ResourceImage` e reconstrói URLs manualmente a partir de `cloudinaryPublicId`, gerando código desnecessário e potencialmente incorreto.
2. **Dark Mode:** Cores hardcoded (`gray-*`, `red-*`, `blue-*`) quebram a experiência em modo escuro.
3. **UX do Carrossel:** Carrossel atual usa componente básico sem lazy loading, sem placeholders animados e sem indicadores de navegação adequados.
4. **Inconsistência:** Componentes não seguem o design system já estabelecido.

---

## Regra de Ouro: Usar `url` diretamente

A model `ResourceImage` possui:
```prisma
model ResourceImage {
  id          String
  resourceId  String
  cloudinaryPublicId String
  url         String?        // ← USAR ESTA COLUNA
  alt         String?
  order       Int
}
```

**Regra:** Sempre usar `image.url` diretamente. O `cloudinaryPublicId` é apenas referência interna para manipulação de assets.

---

## Escopo de Correção

### 1. Backend (API)

#### [MODIFICAR] `src/services/resources/catalog/list-service.ts`
- Linha 99-100: Remover construção de URL via `cloudinaryPublicId`
- Usar diretamente `ri.url` na query SQL
- Fallback para `null` se `url` estiver vazia

**De:**
```sql
(SELECT ri."cloudinaryPublicId" FROM "resource_image" ri ...) AS "cloudinaryPublicId",
(SELECT ri.url FROM "resource_image" ri ...) AS "imageUrl",
```

**Para:**
```sql
(SELECT COALESCE(ri.url, NULL) FROM "resource_image" ri WHERE ri."resourceId" = r.id ORDER BY ri."order" ASC LIMIT 1) AS "thumbUrl",
```

#### [MODIFICAR] `src/app/api/v1/resources/[id]/route.ts`
- Linhas 104-118: Simplificar mapeamento de imagens
- Usar `img.url` diretamente sem reconstrução

**De:**
```ts
thumbUrl: resource.images?.[0]
  ? `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/.../${resource.images[0].cloudinaryPublicId}`
  : null,
images: resource.images.map((img) => ({
  url: img.url || `https://res.cloudinary.com/.../${img.cloudinaryPublicId}`,
})),
```

**Para:**
```ts
thumbUrl: resource.images?.[0]?.url ?? null,
images: resource.images.map((img) => ({
  id: img.id,
  url: img.url,
  alt: img.alt,
  order: img.order,
})),
```

---

### 2. Novo Componente: LazyImage

#### [CRIAR] `src/components/ui/lazy-image.tsx`

Componente otimizado para carregamento de imagens com:
- Placeholder animado (shimmer) enquanto carrega
- Transição suave de opacidade ao carregar
- Suporte a SSR (renderiza placeholder no servidor)

```tsx
'use client'

import { useState, useEffect } from 'react'
import Image, { ImageProps } from 'next/image'

type LazyImageProps = ImageProps & {
  placeholderColor?: string
}

export function LazyImage({ placeholderColor = 'hsl(var(--muted))', alt, ...props }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div
        className="animate-pulse rounded-xl bg-muted"
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
        aria-label={alt}
      />
    )
  }

  return (
    <>
      {!isLoaded && (
        <div
          className="animate-pulse rounded-xl bg-muted absolute inset-0 z-10"
        />
      )}
      <Image
        alt={alt}
        {...props}
        onLoad={() => setIsLoaded(true)}
        style={{
          ...props.style,
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
        className={`rounded-xl ${props.className || ''}`}
      />
    </>
  )
}
```

---

### 3. Novo Componente: ResourceImageCarousel

#### [CRIAR] `src/components/client/resources/ResourceImageCarousel.tsx`

Carrossel baseado em Swiper com:
- Lazy loading de imagens
- Paginação externa (dots)
- Autoplay opcional
- Loop infinito
- Suporte a zoom (opcional)

```tsx
'use client'

import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'
import { Autoplay, Zoom } from 'swiper/modules'
import { LazyImage } from '@/components/ui/lazy-image'

import 'swiper/css'
import 'swiper/css/zoom'

interface ResourceImage {
  id: string
  url: string
  alt?: string | null
  order: number
}

interface ResourceImageCarouselProps {
  images: ResourceImage[]
  title: string
  autoplay?: boolean
  loop?: boolean
  zoom?: boolean
}

export function ResourceImageCarousel({
  images,
  title,
  autoplay = true,
  loop = true,
  zoom = false,
}: ResourceImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const modules = []
  if (autoplay) modules.push(Autoplay)
  if (zoom) modules.push(Zoom)

  const autoplayConfig = autoplay
    ? { delay: 4000, disableOnInteraction: true }
    : false

  if (!mounted) {
    return (
      <div className="relative aspect-video w-full bg-muted animate-pulse rounded-xl" />
    )
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl bg-muted">
        <Swiper
          modules={modules}
          slidesPerView={1}
          loop={loop}
          autoplay={autoplayConfig}
          zoom={zoom ? { maxRatio: 3 } : false}
          onSwiper={setSwiperInstance}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="aspect-video"
        >
          {images.map((img, index) => (
            <SwiperSlide key={img.id}>
              <div className="relative aspect-video w-full">
                <LazyImage
                  src={img.url}
                  alt={img.alt || `${title} - Imagem ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 60vw"
                  priority={index === 0}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  className="object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Paginação externa - dots */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => swiperInstance?.slideTo(index)}
              aria-label={`Ir para imagem ${index + 1}`}
              className={`h-2 rounded-full transition-all ${
                activeIndex === index
                  ? 'w-4 bg-primary'
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

---

### 4. Frontend - Correção de Cores

#### [MODIFICAR] `src/components/client/resources/ResourceCard.tsx`

| De | Para |
|----|------|
| `bg-gray-100` | `bg-muted` |
| `from-gray-200 to-gray-300` | `from-muted to-muted/70` |
| `text-gray-400` | `text-muted-foreground/60` |
| `text-gray-900` | `text-foreground` |
| `group-hover:text-blue-600` | `group-hover:text-primary` |
| `text-gray-500` | `text-muted-foreground` |

#### [MODIFICAR] `src/components/client/resources/ResourceUpsellBanner.tsx`

| De | Para |
|----|------|
| `bg-white` | `bg-card` |
| `text-gray-900` | `text-foreground` |
| `text-gray-500` | `text-muted-foreground` |

#### [MODIFICAR] `src/app/(client)/resources/[id]/page.tsx`

**Cores:**
| De | Para |
|----|------|
| `text-gray-500` | `text-muted-foreground` |
| `text-gray-600` | `text-muted-foreground` |
| `text-gray-700` | `text-foreground/80` |
| `text-gray-900` | `text-foreground` |
| `bg-gray-100` | `bg-muted` |
| `from-gray-200 to-gray-300` | `from-muted to-muted/70` |
| `text-gray-400` | `text-muted-foreground/60` |
| `border-red-200 bg-red-50 text-red-600` | `border-destructive/30 bg-destructive/10 text-destructive` |
| `border-blue-200 bg-blue-50 text-blue-700` | `border-primary/30 bg-primary/10 text-primary` |

**Carrossel - Substituir implementação atual:**

Remover:
```tsx
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
```

Adicionar:
```tsx
import { ResourceImageCarousel } from '@/components/client/resources/ResourceImageCarousel'
```

Substituir bloco de carrossel por:
```tsx
{resource.images && resource.images.length > 0 ? (
  <ResourceImageCarousel
    images={resource.images}
    title={resource.title}
    autoplay={true}
    loop={true}
  />
) : resource.thumbUrl ? (
  <div className="overflow-hidden rounded-xl bg-muted">
    <AspectRatio ratio={16 / 9}>
      <LazyImage
        src={resource.thumbUrl}
        alt={resource.title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 60vw"
      />
    </AspectRatio>
  </div>
) : (
  <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-muted">
    <span className="text-muted-foreground/60">Sem imagem</span>
  </div>
)}
```

---

## Dependências

### Instalar Swiper
```bash
npm install swiper
```

---

## Arquivos Afetados

| Arquivo | Tipo | Ação |
|---------|------|------|
| `src/services/resources/catalog/list-service.ts` | Backend | MODIFICAR |
| `src/app/api/v1/resources/[id]/route.ts` | Backend | MODIFICAR |
| `src/components/ui/lazy-image.tsx` | Frontend | CRIAR |
| `src/components/client/resources/ResourceImageCarousel.tsx` | Frontend | CRIAR |
| `src/components/client/resources/ResourceCard.tsx` | Frontend | MODIFICAR |
| `src/components/client/resources/ResourceUpsellBanner.tsx` | Frontend | MODIFICAR |
| `src/app/(client)/resources/[id]/page.tsx` | Frontend | MODIFICAR |

---

## Critérios de Aceitação

- [ ] Imagens carregam usando `url` diretamente (sem reconstrução de URL)
- [ ] Carrossel usa Swiper com lazy loading e paginação externa (dots)
- [ ] Placeholder animado (shimmer) aparece enquanto imagens carregam
- [ ] Transição suave de opacidade ao carregar imagens
- [ ] Todos os componentes funcionam corretamente em dark mode
- [ ] Nenhuma cor hardcoded nos arquivos modificados
- [ ] Build passa sem erros de TypeScript

---

## Fora do Escopo

- Migração de dados para preencher `url` onde estiver vazia
- Testes automatizados
- Funcionalidade de zoom (pode ser adicionada depois)
