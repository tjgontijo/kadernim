# 📸 Imagens para Banners Premium

## Estrutura de Pastas

```
/public/ads/
├── hero/           # Imagens grandes para banners default (1200x600px)
├── compact/        # Imagens médias para banners compact (400x400px)
├── icons/          # Ícones e badges (200x200px)
└── testimonials/   # Fotos de professoras (300x300px)
```

## Recomendações

### Hero Banners (Default)
- **Dimensões:** 1200x600px ou 16:9
- **Formato:** WebP (fallback JPG)
- **Peso:** < 150KB
- **Conteúdo:** Professora feliz usando materiais, sala de aula colorida, crianças aprendendo

### Compact Banners
- **Dimensões:** 400x400px ou 1:1
- **Formato:** WebP (fallback JPG)
- **Peso:** < 80KB
- **Conteúdo:** Materiais pedagógicos, atividades impressas, recursos visuais

### Testimonials
- **Dimensões:** 300x300px
- **Formato:** WebP (fallback JPG)
- **Peso:** < 50KB
- **Conteúdo:** Fotos profissionais de professoras (com autorização)

## Uso no Código

```tsx
// Banner com imagem hero
<AdSlot 
  slot="header" 
  variant="default"
  creative="conversion"
  imageSrc="/ads/hero/teacher-happy.webp"
/>

// Banner compact com ícone
<AdSlot 
  slot="inline" 
  variant="compact"
  creative="social-proof"
  imageSrc="/ads/compact/materials-preview.webp"
/>
```

## Otimização

- Use Next.js Image component (já implementado)
- Sempre forneça alt text descritivo
- Prefira WebP com fallback JPG
- Comprima imagens antes do upload (TinyPNG, Squoosh)

## Exemplos de Imagens Sugeridas

1. **hero/teacher-classroom.webp** - Professora sorrindo em sala colorida
2. **compact/activity-sheets.webp** - Stack de atividades impressas
3. **compact/digital-resources.webp** - Tablet mostrando recursos digitais
4. **testimonials/prof-ana.webp** - Foto profissional da Profª Ana
5. **icons/premium-badge.webp** - Badge "Premium" com coroa

## Diretrizes de Marca

- **Cores principais:** Indigo (#4F46E5), Purple (#9333EA), Pink (#EC4899)
- **Tom:** Profissional, acolhedor, inspirador
- **Público:** Professoras de Ed. Infantil e Fundamental I (25-45 anos)
- **Emoção:** Alívio, empoderamento, comunidade
