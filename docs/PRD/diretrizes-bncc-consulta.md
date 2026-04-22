# PRD: Diretrizes - Consulta BNCC para Professoras

**Versao:** 0.1 - PRD Inicial  
**Data:** 2026-04-22  
**Status:** Draft  
**Prioridade:** Alta

---

## 1. Visao Geral

Criar uma nova tela no dashboard, acessada pelo menu **Diretrizes**, para que professoras possam consultar habilidades da **Base Nacional Comum Curricular (BNCC)** de forma independente da Biblioteca de materiais.

O MVP deve reaproveitar a base BNCC ja existente no banco (`BnccSkill`) e a taxonomia educacional atual (`EducationLevel`, `Grade`, `Subject`). A experiencia deve ser simples: buscar por codigo ou texto, filtrar por etapa/ano/componente e abrir uma leitura clara da habilidade.

Rota proposta: `/diretrizes`.

---

## 2. Contexto Atual do Produto

### 2.1 Schema existente

O schema ja possui a estrutura necessaria para consulta BNCC:

- `BnccSkill`
  - `code`
  - `educationLevelId`
  - `gradeId`
  - `subjectId`
  - `unitTheme`
  - `knowledgeObject`
  - `description`
  - `comments`
  - `curriculumSuggestions`
- `ResourceBnccSkill`
  - vincula materiais a habilidades BNCC.
- `EducationLevel`, `Grade`, `Subject`, `GradeSubject`
  - sustentam filtros de etapa, ano/faixa e componente/campo.

Nao ha necessidade de migration de banco para o MVP.

### 2.2 Dados seedados

Existem seeds para BNCC:

- `prisma/seeds/seed-bncc-fundamental.ts`
- `prisma/seeds/seed-bncc-infantil.ts`
- `prisma/seeds/data/bncc_fundamental.tsv`
- `prisma/seeds/data/bncc_infantil.tsv`

Antes de publicar a tela, precisamos validar cobertura, qualidade dos slugs e contagem por etapa/ano/componente.

### 2.3 UI existente relacionada

Hoje a BNCC aparece em dois pontos:

- No detalhe do recurso, via `ResourceBNCC`, exibindo habilidades vinculadas ao material.
- No formulario editorial/admin, via `BnccSelector`, para selecionar habilidades ao cadastrar ou editar recurso.

O componente `BnccSelector` ja tem uma experiencia util de busca e lista, mas foi desenhado para edicao admin, nao para consulta pedagogica por professora.

### 2.4 API atual

Existe `GET /api/v1/admin/bncc/search`, usado pelo seletor editorial.

Problemas para a nova feature:

- Fica no namespace `admin`.
- Permite apenas `admin`, `editor` e `manager`.
- Tem logs/debug e fallback permissivo voltado a diagnostico interno.
- Retorna dados suficientes para selecao, mas nao para leitura completa da diretriz.

Para a tela da professora, precisamos de uma API autenticada fora de `admin`.

---

## 3. Problema

A professora consegue ver habilidades BNCC quando um recurso ja esta aberto, mas nao tem um lugar proprio para consultar a BNCC.

Isso cria tres friccoes:

1. Ela precisa partir de um material para chegar na habilidade.
2. Nao consegue procurar rapidamente por codigo, componente, objeto de conhecimento ou texto.
3. Nao consegue usar o Kadernim como referencia curricular durante planejamento, selecao de materiais ou conversa pedagogica.

---

## 4. Objetivos

1. Adicionar item de menu **Diretrizes** no dashboard.
2. Criar tela de consulta BNCC com busca e filtros educacionais.
3. Reaproveitar a taxonomia e a base `BnccSkill` ja existentes.
4. Permitir leitura completa da habilidade, incluindo comentarios e sugestoes curriculares quando existirem.
5. Manter a experiencia coerente com Biblioteca, Planejador e design system atual.
6. Preparar a base para, no futuro, relacionar diretrizes a materiais e planos de aula.

---

## 5. Nao Objetivos

- Nao importar nova base BNCC no MVP.
- Nao criar editor/admin de habilidades BNCC.
- Nao criar IA para explicar BNCC.
- Nao criar plano de aula a partir de uma habilidade nesta fase.
- Nao alterar o schema Prisma no MVP.
- Nao substituir o `BnccSelector` admin.
- Nao implementar busca vetorial.

---

## 6. Principio de Produto

A tela deve responder a pergunta da professora:

> "Quais habilidades da BNCC se aplicam a esta etapa, ano e componente, e o que elas dizem?"

O foco e consulta rapida, leitura confiavel e navegacao curricular. A tela nao deve parecer uma area administrativa.

---

## 7. UX Proposta

### 7.1 Navegacao

Adicionar **Diretrizes** no menu principal do dashboard, junto de:

- Biblioteca
- Meus favoritos
- Planejador
- Diretrizes

Icone sugerido: `BookMarked`, `FileSearch` ou `Map` de `lucide-react`. A escolha deve manter stroke leve e leitura editorial, conforme o design system.

### 7.2 Estrutura da pagina

Usar `PageScaffold`, seguindo o padrao de `/resources` e `/planner`.

Header:

- Titulo: `Diretrizes`
- Subtitulo visual/apoio, se necessario: `Consulta BNCC`

Controles:

- Busca por texto ou codigo:
  - placeholder: `Buscar por codigo, habilidade ou objeto de conhecimento`
- Filtro por etapa:
  - `Educacao Infantil`
  - `Ensino Fundamental 1`
  - `Ensino Fundamental 2`
- Filtro por ano/faixa:
  - depende da etapa selecionada.
- Filtro por componente/campo:
  - depende da etapa/ano quando possivel.

Os filtros devem reaproveitar a logica de taxonomia ja usada em `ResourceFilters`.

### 7.3 Layout desktop

Layout recomendado:

- Coluna esquerda: lista de habilidades.
- Coluna direita: painel sticky de detalhe da habilidade selecionada.

Card/list item da habilidade:

- codigo (`EF04MA09`, `EI03EO01`, etc.)
- componente/campo
- ano/faixa
- unidade tematica, quando existir
- objeto de conhecimento, quando existir
- descricao em ate 2 ou 3 linhas

Painel de detalhe:

- codigo em destaque
- etapa
- ano/faixa
- componente/campo
- unidade tematica
- objeto de conhecimento
- habilidade completa
- comentarios
- possibilidades para o curriculo
- acao secundaria: `Ver materiais relacionados`, quando houver relacao via `ResourceBnccSkill`

### 7.4 Layout mobile

No mobile, evitar duas colunas.

Opcoes aceitaveis:

- Cards expansivos na propria lista.
- Drawer de detalhe ao tocar em uma habilidade.

O filtro pode seguir o padrao atual de drawer usado em `ResourceFilters`.

### 7.5 Estados

Loading:

- Criar `src/app/(dashboard)/diretrizes/loading.tsx`.
- Usar skeleton de header, controles e lista.

Empty:

- Mensagem: `Nenhuma habilidade encontrada para esses filtros.`
- Acao: `Limpar filtros`.

Erro:

- Mensagem curta e botao de tentar novamente.

Sem filtro inicial:

- Exibir habilidades recentes/primeiras por ordenacao curricular ou orientar a selecionar etapa.
- Decisao recomendada: listar resultados paginados ordenados por codigo, sem obrigar filtro inicial.

---

## 8. Contrato de Dados

### 8.1 Schema de resposta

Criar schemas Zod em um novo dominio, por exemplo:

`src/lib/bncc/schemas/bncc-schemas.ts`

```ts
export const BnccSkillListItemSchema = z.object({
  id: z.string(),
  code: z.string(),
  description: z.string(),
  educationLevel: z.object({
    slug: z.string(),
    name: z.string(),
  }),
  grade: z.object({
    slug: z.string(),
    name: z.string(),
  }).nullable(),
  subject: z.object({
    slug: z.string(),
    name: z.string(),
  }).nullable(),
  unitTheme: z.string().nullable(),
  knowledgeObject: z.string().nullable(),
  relatedResourcesCount: z.number().int().nonnegative().optional(),
})

export const BnccSkillDetailSchema = BnccSkillListItemSchema.extend({
  comments: z.string().nullable(),
  curriculumSuggestions: z.string().nullable(),
})
```

### 8.2 Filtros

```ts
export const BnccSkillFilterSchema = z.object({
  q: z.string().trim().max(100).optional(),
  educationLevel: z.string().optional(),
  grade: z.string().optional(),
  subject: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(30),
})
```

---

## 9. APIs Propostas

### 9.1 Listar habilidades

`GET /api/v1/bncc/skills`

Query params:

- `q`
- `educationLevel`
- `grade`
- `subject`
- `page`
- `limit`

Resposta:

```json
{
  "data": [
    {
      "id": "uuid",
      "code": "EF04MA09",
      "description": "Reconhecer as fracoes unitarias mais usuais...",
      "educationLevel": { "slug": "ensino-fundamental-1", "name": "Ensino Fundamental 1" },
      "grade": { "slug": "ef1-4-ano", "name": "4o ano" },
      "subject": { "slug": "matematica", "name": "Matematica" },
      "unitTheme": "Numeros",
      "knowledgeObject": "Fracoes",
      "relatedResourcesCount": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 30,
    "hasMore": true
  }
}
```

### 9.2 Detalhar habilidade

`GET /api/v1/bncc/skills/[id]`

Resposta:

```json
{
  "data": {
    "id": "uuid",
    "code": "EF04MA09",
    "description": "...",
    "comments": "...",
    "curriculumSuggestions": "...",
    "educationLevel": { "slug": "ensino-fundamental-1", "name": "Ensino Fundamental 1" },
    "grade": { "slug": "ef1-4-ano", "name": "4o ano" },
    "subject": { "slug": "matematica", "name": "Matematica" },
    "unitTheme": "Numeros",
    "knowledgeObject": "Fracoes",
    "relatedResourcesCount": 3
  }
}
```

### 9.3 Permissoes

MVP:

- exigir usuario autenticado no dashboard;
- nao restringir a `admin/editor/manager`;
- avaliar regra de assinatura junto ao produto.

Recomendacao:

- se Diretrizes for parte do valor pago, exigir assinatura ativa ou staff;
- se for recurso de aquisicao/retencao, liberar para todo usuario autenticado.

A decisao deve ser explicita antes da implementacao.

---

## 10. Implementacao Tecnica

### 10.1 Arquivos novos esperados

- `src/app/(dashboard)/diretrizes/page.tsx`
- `src/app/(dashboard)/diretrizes/loading.tsx`
- `src/components/dashboard/bncc/bncc-filters.tsx`
- `src/components/dashboard/bncc/bncc-skill-list.tsx`
- `src/components/dashboard/bncc/bncc-skill-detail.tsx`
- `src/components/dashboard/bncc/bncc-page-skeleton.tsx`
- `src/lib/bncc/schemas/bncc-schemas.ts`
- `src/lib/bncc/services/bncc-service.ts`
- `src/lib/bncc/api-client/bncc-client.ts`
- `src/hooks/bncc/use-bncc-skills.ts`
- `src/app/api/v1/bncc/skills/route.ts`
- `src/app/api/v1/bncc/skills/[id]/route.ts`

### 10.2 Arquivos existentes a alterar

- `src/components/dashboard/layout/navigation/AppSidebar.tsx`
  - adicionar item `Diretrizes`.
- `src/components/dashboard/layout/header/DashboardHeader.tsx`
  - mapear breadcrumb de `/diretrizes` para `Diretrizes`, evitando exibir apenas `diretrizes`.
- Opcional: mobile navigation antiga, se voltar a ser usada em algum fluxo.

### 10.3 Busca

Campos buscaveis:

- `code`
- `description`
- `unitTheme`
- `knowledgeObject`
- `comments`
- `curriculumSuggestions`

Ordenacao inicial:

1. `educationLevel.order`
2. `grade.order`
3. `subject.name`
4. `code`

Se `q` for codigo exato ou prefixo de codigo, priorizar match de `code`.

### 10.4 Reaproveitamento

Reaproveitar:

- hooks de taxonomia: `useEducationLevels`, `useGrades`, `useSubjects`;
- padrao visual de `ResourceFilters`;
- `PageScaffold`;
- tokens visuais de cards/listas do dashboard;
- parte do estilo de `ResourceBNCC`, mas sem limitar a uma secao de recurso.

Nao reaproveitar diretamente:

- endpoint admin atual;
- `BnccSelector` como componente principal da tela, porque ele e orientado a selecao e checkbox.

---

## 11. Plano de Implementacao

### Fase 0: Validacao de Dados (2-4h)

- Conferir contagem total de `BnccSkill`.
- Conferir contagem por `educationLevel`, `grade` e `subject`.
- Validar se fundamental e infantil estao navegaveis pelos filtros.
- Identificar habilidades sem `gradeId` ou `subjectId`.

### Fase 1: API e schemas (4-6h)

- Criar schemas Zod de BNCC.
- Criar service de consulta.
- Criar endpoint autenticado `GET /api/v1/bncc/skills`.
- Criar endpoint `GET /api/v1/bncc/skills/[id]`.
- Cobrir permissao fora de `admin`.

### Fase 2: UI da tela (6-10h)

- Criar rota `/diretrizes`.
- Implementar header, busca, filtros e lista.
- Implementar detalhe desktop e detalhe mobile.
- Implementar estados loading, empty e error.

### Fase 3: Navegacao e refinamento (2-4h)

- Adicionar item no `AppSidebar`.
- Ajustar breadcrumb no `DashboardHeader`.
- Validar responsivo.
- Validar acessibilidade basica.

### Fase 4: Relacao com materiais (opcional no MVP, 3-6h)

- Exibir `relatedResourcesCount`.
- Adicionar CTA `Ver materiais relacionados`.
- Em versao simples, linkar para `/resources` com filtros equivalentes.
- Em versao mais precisa, criar query por `bnccSkillId` na Biblioteca.

---

## 12. Criterios de Aceitacao

1. A professora autenticada ve o item **Diretrizes** no menu do dashboard.
2. A rota `/diretrizes` carrega dentro do layout do dashboard.
3. A professora consegue buscar por codigo BNCC.
4. A professora consegue buscar por texto da habilidade.
5. A professora consegue filtrar por etapa, ano/faixa e componente/campo.
6. A lista mostra codigo, descricao e contexto curricular.
7. Ao selecionar uma habilidade, a professora ve a descricao completa, comentarios e sugestoes curriculares quando existirem.
8. A tela possui loading, empty e error states.
9. A API nao usa namespace `admin` e nao bloqueia professoras comuns por papel admin.
10. A implementacao passa em `npm run build`.

---

## 13. Metricas de Sucesso

Produto:

- Uso semanal da tela `Diretrizes`.
- Percentual de buscas com resultado.
- Codigos BNCC mais consultados.
- Cliques de Diretrizes para materiais relacionados, se implementado.

Tecnicas:

- Tempo medio de resposta de `GET /api/v1/bncc/skills`.
- Taxa de erro da API.
- Percentual de habilidades sem `gradeId` ou `subjectId`.

---

## 14. Riscos e Mitigacoes

1. **Risco:** dados BNCC incompletos ou mal vinculados a slugs.  
   **Mitigacao:** fase 0 obrigatoria com contagem por taxonomia antes da UI final.

2. **Risco:** busca admin atual retorna amostras incorretas por fallback diagnostico.  
   **Mitigacao:** criar service novo ou parametrizar o service existente sem fallback permissivo no endpoint da professora.

3. **Risco:** tela virar um modulo curricular complexo demais.  
   **Mitigacao:** MVP limitado a consulta, filtros e detalhe.

4. **Risco:** performance ruim em busca textual.  
   **Mitigacao:** paginacao desde o inicio; avaliar indices/trigram apenas se a base real exigir.

5. **Risco:** conflito de idioma entre rotas em ingles e label em portugues.  
   **Mitigacao:** documentar decisao de rota `/diretrizes`; manter label e breadcrumb em portugues.

---

## 15. Questoes em Aberto

1. Diretrizes sera liberado para todo usuario autenticado ou apenas assinantes/staff?
2. O MVP deve mostrar materiais relacionados ja na primeira entrega?
3. Devemos permitir copiar codigo/descricao da habilidade?
4. A tela deve ter URL compartilhavel para uma habilidade especifica (`/diretrizes/[id]`) ou detalhe em painel dentro da lista basta para o MVP?
5. Precisamos exibir fonte/data da BNCC importada no rodape da tela?

---

## 16. Definition of Done

Este PRD sera considerado implementado quando:

1. `/diretrizes` estiver disponivel no dashboard.
2. Busca e filtros funcionarem com a base `BnccSkill` real.
3. Professoras nao-admin conseguirem consultar habilidades conforme regra de permissao definida.
4. A UI estiver consistente com Biblioteca e Planejador.
5. `npm run build` passar sem erros.
