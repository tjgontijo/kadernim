---
name: lente-design-system
description: Orientações obrigatórias para UI, estilo (Tailwind + Shadcn) e tom de voz da Lente Clínica.
---

# Lente Clínica Design System

Este sistema guia a criação visual e de conteúdo da plataforma "Lente Clínica".

## 1. Fundação Visual (Tailwind + Shadcn)

Nós usamos **Shadcn/UI**, mas suas cores e raios originais **devem ser sobrescritos** utilizando nossos tokens CSS injetados no `:root` através do Tailwind.
**NÃO crie classes CSS personalizadas** (como `.lc-btn-primary`). O projeto não usa metodologias como BEM. Use apenas Tailwind injetando as variáveis:

- **Teal (Primária/Ação)**: `bg-[var(--lc-teal-600)] hover:bg-[var(--lc-teal-700)] text-white`
- **Atenção (Amarelo)**: Fundo `bg-[var(--lc-amber-50)]`, Borda `border-[var(--lc-amber-300)]`, Texto `text-[var(--lc-amber-800)]`
- **Urgência (Vermelho)**: Fundo `bg-[var(--lc-red-50)]`, Borda `border-[var(--lc-red-300)]`, Texto `text-[var(--lc-red-800)]`
- **Superfícies**: Fundo geral `bg-[var(--lc-neutral-50)]`. Cards usam `bg-white`.
- **Raios**: Botões primários usam `rounded-[var(--lc-radius-full)]`. Cards usam `rounded-[var(--lc-radius-md)]`.
- **Sombras**: Cards usam shadow do sistema, ex: `shadow-[var(--lc-shadow-1)]`.

*Exemplo de sobrescrita no Shadcn:*
```tsx
<Button className="bg-[var(--lc-teal-600)] hover:bg-[var(--lc-teal-700)] rounded-[var(--lc-radius-full)]">
  Salvar
</Button>
```

## 2. Tipografia e Ícones

- **Fontes**: Geist Sans (UI padrão) e Geist Mono (Dados clínicos e dosagens).
- **Ícones**: É estritamente obrigatório usar `lucide-react`. 
- **NUNCA use emojis para UI estrutural** (ex: ⚠️, ❌). Se precisar de um alerta visual, importe `<TriangleAlert />` (Atenção/Amarelo) ou `<AlertCircle />` (Urgência/Vermelho) do Lucide.

## 3. Tom de Voz (UX Writing)

- **Vibe**: "Autoridade sem arrogância" - ambiente clínico acolhedor.
- **Idioma**: Sempre PT-BR.
- **Regra do Imperativo**: Nunca dê ordens ao usuário (a terapeuta). Substitua "Clique aqui" ou "Preencha o formulário" por frases convidativas como "Adicionar paciente" ou "Veja os alertas".
- **Regra do Alerta**: Textos de alerta (amarelo/vermelho) devem ser concisos e sem causar pânico. Não use exclamações ou tudo em maiúsculo (exceção apenas para a *Tag* de severidade). Use: "Sinal indica possível acatisia." em vez de "ATENÇÃO!!! ACATISIA!".
