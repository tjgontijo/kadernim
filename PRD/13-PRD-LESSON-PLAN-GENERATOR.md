# PRD 13: Gerador de Planos de Aula com BNCC

## 1. Visão Geral

### 1.1 O que é?
Ferramenta guiada para criar planos de aula alinhados à BNCC em poucos minutos. A professora responde perguntas simples, seleciona habilidades da BNCC, e o sistema gera um plano estruturado com exportação para Word e PDF.

### 1.2 Por que fazer?
- **Dor real**: Criar plano de aula é demorado e repetitivo
- **Diferencial**: Alinhamento auditável com BNCC (coordenador aprova)
- **Retenção**: Motivo para usar o app toda semana
- **Valor percebido**: Feature premium que justifica assinatura

### 1.3 Público-alvo
- Professoras da Educação Básica
- **Perfil**: Baixa familiaridade com tecnologia, preferem interfaces simples
- **Contexto**: Precisam entregar planos para coordenação, têm pouco tempo

---

## 2. Regras de Negócio

### 2.1 Acesso
- **Apenas assinantes** podem usar
- Usuários free veem a feature bloqueada (upsell)

### 2.2 Limites

| Recurso | Limite |
|---------|--------|
| Planos por mês | 15 |
| Habilidades BNCC por plano | 1-3 |
| Histórico salvo | Últimos 20 planos |

### 2.3 Custo de IA estimado

**Modelo:** `gpt-4o-mini` (melhor custo-benefício)

**Preços (OpenAI, janeiro 2026):**
- Input: $0.150 / 1M tokens
- Output: $0.600 / 1M tokens

**Estimativa por plano:**

| Componente | Tokens | Cálculo | Custo |
|------------|--------|---------|-------|
| **Input** (system + user prompt) | ~1.000 | 1.000 × $0.150/1M | $0.00015 |
| **Output** (plano completo JSON) | ~2.000 | 2.000 × $0.600/1M | $0.00120 |
| **Total por plano** | ~3.000 | | **$0.00135** |

**Projeções mensais:**

| Cenário | Assinantes | Planos/usuário | Total planos | Custo total |
|---------|------------|----------------|--------------|-------------|
| **Conservador** | 500 | 8 | 4.000 | **~$5.40** |
| **Moderado** | 1.000 | 10 | 10.000 | **~$13.50** |
| **Otimista** | 2.000 | 12 | 24.000 | **~$32.40** |

**Observações:**
- Custo marginal **desprezível** (~$0.0014/plano)
- Limite de 15/mês previne abuso
- Não inclui custos de infraestrutura (Vercel/banco)

---

## 3. Estrutura do Plano de Aula

Baseado no padrão BNCC nacional:

| Seção | Descrição | Origem |
|-------|-----------|--------|
| **Identificação** | Título, ano, disciplina, duração | Wizard |
| **Habilidades BNCC** | Códigos e descrições | Professora seleciona |
| **Objetivos** | O que alunos devem aprender | IA gera |
| **Conteúdo** | Tema central da aula | Professora informa |
| **Metodologia** | Etapas da aula com tempo | IA gera |
| **Recursos** | Materiais necessários | IA gera |
| **Avaliação** | Como verificar aprendizagem | IA gera |

---

## 4. UI/UX Design

### 4.1 Princípios (dado perfil do usuário)

✅ FAZER                           ❌ EVITAR
─────────────────────────────────────────────────────
Uma pergunta por tela              Formulários longos
Botões grandes e claros            Muitas opções juntas
Seleção visual (cards/chips)       Campos de texto livre
Linguagem simples                  Termos técnicos
Progresso visível                  Passos indefinidos
Feedback imediato                  Ações sem confirmação

### 4.2 Telas do Aplicativo

*   **Principal**: Listagem de planos existentes com botões de exportação (Word/PDF) e progresso de uso mensal.
*   **Empty State**: Mensagem amigável com CTA para criar o primeiro plano.
*   **Etapa 1 (Etapa de Ensino)**: Seleção entre Educação Infantil e Ensino Fundamental.
*   **Etapa 1A (Educação Infantil)**: Seleção de Faixa Etária e Campo de Experiência.
*   **Etapa 1B (Ensino Fundamental)**: Seleção de Ano (Ano/Série) e Disciplina (Componente Curricular).
*   **Etapa 2 (Tema)**: Input de texto para o tema da aula e seleção de quantidade/duração de aulas.
*   **Etapa 3 (Habilidades BNCC)**: Busca e seleção de 1 a 3 habilidades BNCC filtradas pela etapa/ano/disciplina selecionados.
*   **Etapa 4 (Resumo)**: Revisão dos dados informados antes de disparar a geração via IA.
*   **Loading**: Feedback visual durante o processo de geração pela IA (~30s).
*   **Sucesso**: Finalização com links diretos para download em Word e PDF.
---

## 5. Modelo de Dados

### 5.1 BNCC (Base Nacional)

**IMPORTANTE:** A BNCC é a **"fonte de verdade"** armazenada como um "tabelão" para consultas da IA. Usa slugs ao invés de FKs rígidas para flexibilidade estrutural.

```prisma
model BnccSkill {
  id String @id @default(cuid())

  // Código oficial BNCC (fonte de verdade)
  // ⚠️ NÃO é unique sozinho! Códigos como EF12LP01 cobrem múltiplos anos
  code String // "EI03TS01", "EF05MA09", "EF12LP01", "EF15AR01"...

  // Etapa de ensino (slug do EducationLevel existente)
  educationLevelSlug String // "educacao-infantil" | "ensino-fundamental-1" | "ensino-fundamental-2"

  // ===== EDUCAÇÃO INFANTIL =====
  fieldOfExperience String? // "Traços, sons, cores e formas"
  ageRange String?          // "ei-criancas-pequenas" (slug do Grade)

  // ===== ENSINO FUNDAMENTAL =====
  gradeSlug String?         // "ef1-3-ano", "ef2-7-ano" (slug do Grade)
  subjectSlug String?       // "matematica", "historia" (slug do Subject)
  unitTheme String?         // "Números", "Álgebra" (Unidade Temática)
  knowledgeObject String?   // "Fração", "Sistema de numeração" (Objeto de Conhecimento)

  // Texto principal (obrigatório)
  description String @db.Text // Texto completo da habilidade BNCC

  // Conteúdo auxiliar (se disponível na planilha oficial)
  comments String? @db.Text
  curriculumSuggestions String? @db.Text

  // ===== BUSCA =====
  // Full-Text Search (PostgreSQL) com unaccent
  // Gerado automaticamente por trigger em reset-db.sh
  searchVector Unsupported("tsvector")?

  // Embeddings (OpenAI) - Opcional para busca semântica
  // Gerado via script: npx tsx scripts/embed.ts
  embedding Unsupported("vector(1536)")?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Índices para performance
  @@index([educationLevelSlug])
  @@index([gradeSlug])
  @@index([subjectSlug])
  @@index([code])
  @@index([searchVector], type: Gin)     // FTS com GIN index
  // @@index([embedding], type: IVFFlat) // Não suportado no schema - criar via SQL

  // ⚠️ IMPORTANTE: Unique compostos separados para EI e EF
  @@unique([code, gradeSlug])   // EF: Permite duplicar EF12, EF15, etc por ano
  @@unique([code, ageRange])    // EI: Previne duplicação por faixa etária

  @@map("bncc_skill")
}
```

**Por que usar slugs ao invés de FKs?**
1. **Flexibilidade**: EI tem estrutura diferente de EF (campos de experiência vs disciplinas)
2. **IA consulta texto**: A IA faz buscas textuais/semânticas, não precisa de JOINs
3. **Importação simples**: Mapeia direto da planilha BNCC sem lookups
4. **Denormalizado = rápido**: Uma única query traz tudo que a IA precisa

**Por que dois unique compostos?**
- **EF usa `gradeSlug`**: Códigos como `EF12LP01` abrangem múltiplos anos
  - `@@unique([code, gradeSlug])` permite `EF12LP01` + `ef1-1-ano` e `EF12LP01` + `ef1-2-ano`
- **EI usa `ageRange`**: Previne duplicação por faixa etária
  - `@@unique([code, ageRange])` garante `EI03TS01` + `ei-criancas-pequenas` único
- **Queries simples**:
  - EF: `WHERE code = 'EF12LP01' AND gradeSlug = 'ef1-1-ano'`
  - EI: `WHERE code = 'EI03TS01' AND ageRange = 'ei-criancas-pequenas'`

### 5.2 Planos de Aula

```prisma
model LessonPlan {
  id        String   @id @default(cuid())

  // Autor
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Identificação
  title              String   // "Introdução às Frações"
  educationLevelId   String   // FK para EducationLevel
  educationLevel     EducationLevel @relation(fields: [educationLevelId], references: [id])
  year               String   // "3" (3º ano) - extraído do código BNCC
  subjectId          String   // FK para Subject
  subject            Subject  @relation(fields: [subjectId], references: [id])
  duration           Int      // Número de aulas (1, 2, 3)

  // Conteúdo gerado pela IA (JSON estruturado - ver schema abaixo)
  content   Json     // LessonPlanContent (TypeScript interface abaixo)

  // Habilidades BNCC selecionadas
  skillCodes String[] // ["EF03MA09", "EF03MA10"] - referência aos códigos

  // Controle
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, createdAt(sort: Desc)])
  @@index([educationLevelId, subjectId])
  @@map("lesson_plan")
}

// Controle de uso mensal (rate limiting)
model LessonPlanUsage {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  yearMonth String   // "2026-01" (formato YYYY-MM)
  count     Int      @default(0)

  updatedAt DateTime @updatedAt

  @@unique([userId, yearMonth])
  @@index([userId, yearMonth])
  @@map("lesson_plan_usage")
}
```

### 5.3 Estrutura do JSON de Conteúdo

**Armazenado no campo `content` (Json) do LessonPlan**

```typescript
// TypeScript Interface (para uso no frontend/backend)
interface LessonPlanContent {
  // Identificação (redundante com DB, mas facilita exportação standalone)
  identification: {
    title: string               // "Introdução às Frações"
    educationLevel: string      // "Fundamental - Anos Iniciais"
    year: string                // "3º Ano"
    subject: string             // "Matemática"
    duration: {
      lessons: number           // 2
      minutesPerLesson: number  // 50
      totalMinutes: number      // 100
    }
  }

  // Habilidades BNCC selecionadas (com detalhes completos)
  bnccSkills: Array<{
    code: string                // "EF03MA09"
    description: string         // Texto completo da habilidade
    thematicUnit: string        // "Números"
    knowledgeObject: string     // "Fração"
  }>

  // Objetivos de aprendizagem (gerados pela IA)
  objectives: string[]          // ["Compreender o conceito de fração...", ...]

  // Metodologia (sequência didática)
  methodology: Array<{
    phase: string               // "Introdução" | "Desenvolvimento" | "Fechamento"
    duration: string            // "15 min"
    description: string         // Descrição geral da fase
    activities: string[]        // Lista de atividades específicas
  }>

  // Recursos/Materiais necessários
  resources: string[]           // ["Folhas de papel", "Tesoura", ...]

  // Avaliação
  assessment: {
    criteria: string[]          // ["Identifica frações simples", ...]
    instruments: string[]       // ["Observação durante atividade", ...]
  }

  // Metadados de geração
  metadata: {
    generatedAt: string         // ISO 8601 timestamp
    model: string               // "gpt-4o-mini"
    tokensUsed?: number         // Rastreamento de custo (opcional)
  }
}
```

**Zod Schema para Validação (backend)**

```typescript
// src/lib/schemas/lesson-plan.ts
import { z } from 'zod'

export const LessonPlanContentSchema = z.object({
  identification: z.object({
    title: z.string().min(3).max(200),
    educationLevel: z.string(),
    year: z.string(),
    subject: z.string(),
    duration: z.object({
      lessons: z.number().int().min(1).max(3),
      minutesPerLesson: z.number().int().min(30).max(120),
      totalMinutes: z.number().int()
    })
  }),

  bnccSkills: z.array(
    z.object({
      code: z.string().regex(/^[A-Z]{2}\d{2}[A-Z]{2}\d{2}$/), // Formato BNCC
      description: z.string(),
      thematicUnit: z.string(),
      knowledgeObject: z.string()
    })
  ).min(1).max(3), // 1 a 3 habilidades

  objectives: z.array(z.string()).min(2).max(6),

  methodology: z.array(
    z.object({
      phase: z.enum(['Introdução', 'Desenvolvimento', 'Fechamento']),
      duration: z.string(),
      description: z.string(),
      activities: z.array(z.string())
    })
  ).min(3).max(10), // Pelo menos 3 fases

  resources: z.array(z.string()).min(1).max(20),

  assessment: z.object({
    criteria: z.array(z.string()).min(2).max(8),
    instruments: z.array(z.string()).min(1).max(5)
  }),

  metadata: z.object({
    generatedAt: z.string().datetime(),
    model: z.string(),
    tokensUsed: z.number().optional()
  })
})

export type LessonPlanContent = z.infer<typeof LessonPlanContentSchema>
```

---

## 6. API Endpoints

### 6.1 BNCC (Consulta)

```
GET /api/v1/bncc/education-levels
    Retorna etapas de ensino (reutiliza EducationLevel existente)

    Response: [
      { slug: "educacao-infantil", name: "Educação Infantil", order: 1 },
      { slug: "ensino-fundamental-1", name: "Ensino Fundamental I", order: 2 },
      { slug: "ensino-fundamental-2", name: "Ensino Fundamental II", order: 3 }
    ]

GET /api/v1/bncc/grades?educationLevelSlug=ensino-fundamental-1
    Retorna anos/séries por etapa (reutiliza Grade existente)

    Response: [
      { slug: "ef1-1-ano", name: "1º ano", order: 1 },
      { slug: "ef1-2-ano", name: "2º ano", order: 2 },
      { slug: "ef1-3-ano", name: "3º ano", order: 3 },
      ...
    ]

GET /api/v1/bncc/subjects?educationLevelSlug=ensino-fundamental-1&gradeSlug=ef1-3-ano
    Retorna disciplinas/campos disponíveis conforme etapa

    **Para EF (Ensino Fundamental):**
    Response: [
      { slug: "matematica", name: "Matemática" },
      { slug: "lingua-portuguesa", name: "Língua Portuguesa" },
      { slug: "ciencias", name: "Ciências" },
      { slug: "historia", name: "História" },
      { slug: "geografia", name: "Geografia" },
      { slug: "arte", name: "Arte" },
      { slug: "educacao-fisica", name: "Educação Física" },
      { slug: "ensino-religioso", name: "Ensino Religioso" },
      // EF1: 8 componentes (SEM língua-inglesa)
      // EF2: 9 componentes (COM língua-inglesa)
    ]

    **Para EI (Educação Infantil):**
    Response: [
      { slug: "ei-o-eu-o-outro-e-o-nos", name: "O eu, o outro e o nós" },
      { slug: "ei-corpo-gestos-e-movimentos", name: "Corpo, gestos e movimentos" },
      { slug: "ei-tracos-sons-cores-e-formas", name: "Traços, sons, cores e formas" },
      { slug: "ei-escuta-fala-pensamento-e-imaginacao", name: "Escuta, fala, pensamento e imaginação" },
      { slug: "ei-espacos-tempos-quantidades-relacoes-e-transformacoes", name: "Espaços, tempos, quantidades, relações e transformações" }
      // EI: 5 campos de experiência (armazenados como Subject)
    ]

    **⚠️ IMPORTANTE ARQUITETURAL:**
    - **EF:** Subjects = Componentes Curriculares (Matemática, etc)
    - **EI:** Subjects = Campos de Experiência (para facilitar filtros de recursos)
    - **BnccSkill.fieldOfExperience:** Também armazena campo de experiência (denormalizado)

GET /api/v1/bncc/skills?educationLevelSlug=ensino-fundamental-1&gradeSlug=ef1-3-ano&subjectSlug=matematica&q=frações
    Busca habilidades BNCC com filtros + Full-Text Search + Embeddings

    Query params:
    - educationLevelSlug (required): Slug da etapa
    - gradeSlug (required): Slug do ano/série
    - subjectSlug (required): Slug da disciplina
    - q (optional): Termo de busca (usa FTS + embeddings para melhor relevância)
    - searchMode (optional): "fts" | "semantic" | "hybrid" (padrão: "hybrid")

    Response: {
      skills: [
        {
          id: "cuid",
          code: "EF03MA09",
          description: "Associar o quociente de uma divisão com resto zero...",
          unitTheme: "Números",
          knowledgeObject: "Fração",
          gradeSlug: "ef1-3-ano",
          subjectSlug: "matematica"
        }
      ]
    }
```

**Implementação da busca FTS (Full-Text Search):**

```typescript
// src/app/api/v1/bncc/skills/route.ts
import { prisma } from '@/lib/db'
import { Prisma } from '@/prisma/generated/prisma/client'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const educationLevelSlug = searchParams.get('educationLevelSlug')
  const gradeSlug = searchParams.get('gradeSlug')
  const subjectSlug = searchParams.get('subjectSlug')
  const query = searchParams.get('q') // Termo de busca (opcional)

  if (!educationLevelSlug || !gradeSlug || !subjectSlug) {
    return Response.json({ error: 'Missing required params' }, { status: 400 })
  }

  // Busca com Full-Text Search (PostgreSQL)
  const skills = await prisma.$queryRaw<Array<{
    id: string
    code: string
    description: string
    unitTheme: string | null
    knowledgeObject: string | null
    gradeSlug: string
    subjectSlug: string
    rank?: number
  }>>`
    SELECT
      id,
      code,
      description,
      unit_theme as "unitTheme",
      knowledge_object as "knowledgeObject",
      grade_slug as "gradeSlug",
      subject_slug as "subjectSlug"
      ${query ? Prisma.sql`, ts_rank(search_vector, websearch_to_tsquery('portuguese', ${query})) as rank` : Prisma.empty}
    FROM bncc_skill
    WHERE education_level_slug = ${educationLevelSlug}
      AND grade_slug = ${gradeSlug}
      AND subject_slug = ${subjectSlug}
      ${query ? Prisma.sql`AND search_vector @@ websearch_to_tsquery('portuguese', ${query})` : Prisma.empty}
    ORDER BY ${query ? Prisma.sql`rank DESC,` : Prisma.empty} code ASC
    LIMIT 50
  `

  return Response.json({ skills })
}
```

### 6.2 Planos de Aula

```
GET /api/v1/lesson-plans
    Lista planos do usuário (últimos 20, ordenados por criação DESC)

    Response: {
      plans: [
        {
          id: "cuid",
          title: "Introdução às Frações",
          educationLevel: { name: "..." },
          year: "3",
          subject: { name: "Matemática" },
          duration: 2,
          skillCodes: ["EF03MA09", "EF03MA10"],
          createdAt: "2026-01-15T10:30:00Z"
        }
      ],
      usage: { used: 3, limit: 15, remaining: 12 }
    }

POST /api/v1/lesson-plans
    Cria novo plano com geração via IA

    Headers: Authorization (session)

    Body: {
      educationLevelId: string
      year: string              // "3"
      subjectId: string
      title: string
      duration: number          // 1, 2 ou 3
      skillCodes: string[]      // ["EF03MA09", "EF03MA10"]
    }

    Validações:
    - Usuário deve ser subscriber ou admin
    - Limite mensal não atingido (< 15)
    - 1 a 3 habilidades BNCC
    - Habilidades devem existir no banco
    - Duração entre 1 e 3 aulas

    Response: {
      plan: {
        id: "cuid",
        title: "...",
        content: { ... }, // LessonPlanContent
        skillCodes: [...],
        createdAt: "..."
      },
      downloadUrls: {
        word: "/api/v1/lesson-plans/{id}/download?format=docx",
        pdf: "/api/v1/lesson-plans/{id}/download?format=pdf"
      }
    }

    Errors:
    - 401: Não autenticado
    - 403: Não é assinante / Limite mensal atingido
    - 400: Validação falhou
    - 500: Erro na geração com IA

GET /api/v1/lesson-plans/:id
    Retorna plano específico (apenas do próprio usuário ou admin)

    Response: {
      plan: { id, title, content, ... }
    }

GET /api/v1/lesson-plans/:id/download?format=docx|pdf
    Gera e retorna arquivo para download

    Query params:
    - format: "docx" | "pdf"

    Headers:
    - Content-Disposition: attachment; filename="plano-fracoes.docx"
    - Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document

    Response: Binary file (Word ou PDF)

GET /api/v1/lesson-plans/usage
    Retorna uso do mês atual do usuário

    Response: {
      yearMonth: "2026-01",
      used: 3,
      limit: 15,
      remaining: 12,
      resetsAt: "2026-02-01T00:00:00Z"
    }
```

---

## 7. Geração com IA

### 7.1 Prompt de Geração

```typescript
const systemPrompt = `Você é um especialista em pedagogia brasileira.
Crie planos de aula alinhados à BNCC, práticos e aplicáveis em sala de aula.

Diretrizes:
- Use linguagem simples e direta
- Sugira atividades práticas e interativas
- Considere recursos comuns em escolas públicas
- Divida o tempo de forma realista
- Inclua momentos de avaliação formativa`

const userPrompt = `Crie um plano de aula com as seguintes especificações:

**Identificação:**
- Ano: ${year}
- Disciplina: ${subject}
- Tema: ${title}
- Duração: ${duration} aula(s) de 50 minutos

**Habilidades BNCC a desenvolver:**
${skills.map(s => `- ${s.code}: ${s.description}`).join('\n')}

**Formato de resposta:**
Retorne um JSON válido com a estrutura especificada.`
```

### 7.2 Implementação

```typescript
// src/app/api/v1/lesson-plans/route.ts
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { LessonPlanContentSchema } from '@/lib/schemas/lesson-plan'

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) return unauthorized()

  // Verificar se é assinante
  if (session.user.role !== 'subscriber' && session.user.role !== 'admin') {
    return forbidden('Apenas assinantes podem criar planos')
  }

  // Verificar limite mensal
  const usage = await getLessonPlanUsage(session.user.id)
  if (usage.count >= 15) {
    return forbidden('Limite de 15 planos/mês atingido')
  }

  const body = await req.json()
  const { yearId, subjectId, title, duration, skillCodes } = body

  // Buscar habilidades completas
  const skills = await prisma.bnccSkill.findMany({
    where: { code: { in: skillCodes } }
  })

  // Gerar plano com IA
  const { object: content } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: LessonPlanContentSchema,
    system: systemPrompt,
    prompt: buildPrompt({ yearId, subjectId, title, duration, skills })
  })

  // Salvar plano
  const plan = await prisma.lessonPlan.create({
    data: {
      userId: session.user.id,
      title,
      yearId,
      subjectId,
      duration,
      content,
      skillCodes
    }
  })

  // Incrementar uso
  await incrementUsage(session.user.id)

  return Response.json({ plan })
}
```

---

## 8. Exportação

### 8.1 Word (.docx)

```typescript
// src/lib/export/word.ts
import { Document, Paragraph, TextRun, Table } from 'docx'

export function generateWordDocument(plan: LessonPlanContent): Buffer {
  const doc = new Document({
    sections: [{
      children: [
        // Título
        new Paragraph({
          children: [
            new TextRun({ text: 'PLANO DE AULA', bold: true, size: 28 })
          ],
          alignment: 'center'
        }),

        // Identificação
        createIdentificationTable(plan),

        // Habilidades BNCC
        new Paragraph({
          children: [
            new TextRun({ text: 'HABILIDADES BNCC', bold: true })
          ]
        }),
        ...plan.skills.map(s =>
          new Paragraph({ text: `• ${s.code}: ${s.description}` })
        ),

        // Objetivos
        // Metodologia
        // Recursos
        // Avaliação
        // ...
      ]
    }]
  })

  return Packer.toBuffer(doc)
}
```

### 8.2 PDF

```typescript
// src/lib/export/pdf.ts
// Opção 1: Renderizar HTML para PDF com Puppeteer/Playwright
// Opção 2: Usar react-pdf para gerar diretamente

import { renderToBuffer } from '@react-pdf/renderer'
import { LessonPlanPDF } from './templates/LessonPlanPDF'

export async function generatePDF(plan: LessonPlanContent): Promise<Buffer> {
  return renderToBuffer(<LessonPlanPDF plan={plan} />)
}
```

---

## 9. Componentes React

### 9.1 Estrutura de Arquivos

```
src/
├── app/(client)/lesson-plans/
│   ├── page.tsx                    # Lista de planos + empty state
│   └── layout.tsx
│
├── components/client/lesson-plans/
│   │
│   │  # Wizard de criação (com bifurcação EI vs EF)
│   ├── create-plan-drawer.tsx      # Drawer principal
│   ├── wizard-steps.tsx            # Indicador de progresso
│   ├── step-stage.tsx              # Etapa 1: Etapa de ensino
│   │
│   │  # Bifurcação: EI vs EF
│   ├── step-ei-age-field.tsx       # Etapa 1A (EI): Faixa etária + Campo exp.
│   ├── step-ef-grade-subject.tsx   # Etapa 1B (EF): Ano + Disciplina
│   │
│   ├── step-theme.tsx              # Etapa 2: Tema + Duração (comum)
│   │
│   │  # Etapa 3 (busca de habilidades - lógica diferente)
│   ├── step-skills.tsx             # Etapa 3: Seleção BNCC (switch EI/EF)
│   ├── skill-selector-ei.tsx       # Seletor para EI (fieldOfExperience)
│   ├── skill-selector-ef.tsx       # Seletor para EF (gradeSlug + subjectSlug)
│   │
│   ├── step-review.tsx             # Etapa 4: Resumo (comum)
│   │
│   │  # Componentes de UI
│   ├── plan-card.tsx               # Card de plano na lista
│   ├── plan-list.tsx               # Lista de planos
│   ├── empty-state.tsx             # Estado vazio com CTA
│   ├── usage-progress.tsx          # Barra de uso mensal
│   ├── generating-state.tsx        # Tela de loading
│   └── success-state.tsx           # Tela de sucesso + downloads
│
├── hooks/
│   ├── useLessonPlans.ts           # React Query - lista
│   ├── useLessonPlanUsage.ts       # React Query - uso mensal
│   ├── useBnccSkills.ts            # React Query - busca BNCC (com switch EI/EF)
│   └── useCreateLessonPlan.ts      # Mutation de criação
│
└── services/lesson-plans/
    ├── list-plans.ts
    ├── create-plan.ts
    ├── generate-content.ts         # Geração com IA
    ├── export-word.ts
    └── export-pdf.ts
```

**⚠️ Nota sobre bifurcação EI vs EF:**

O código do wizard precisa verificar `educationLevelSlug` para decidir qual fluxo seguir:

```typescript
// create-plan-drawer.tsx
const [educationLevelSlug, setEducationLevelSlug] = useState<string>()
const isEI = educationLevelSlug === 'educacao-infantil'

// Renderizar componentes diferentes
{currentStep === 1 && (
  isEI ? (
    <StepEiAgeField {...props} />  // Faixa etária + Campo de experiência
  ) : (
    <StepEfGradeSubject {...props} />  // Ano + Disciplina
  )
)}

// Hook de busca também precisa adaptar
// useBnccSkills.ts
const params = isEI
  ? { educationLevelSlug, ageRange, fieldOfExperience, q }
  : { educationLevelSlug, gradeSlug, subjectSlug, q }
```

---

## 10. Importação dos Dados da BNCC

### 10.1 Fonte Oficial

**URL:** [Base Nacional Comum Curricular - MEC](http://basenacionalcomum.mec.gov.br/)

**Formato recomendado:** Planilha Excel oficial do MEC contendo:
- Códigos de habilidades (ex: EF03MA09, EI03TS01)
- Descrições completas
- Unidades temáticas / Campos de experiência
- Objetos de conhecimento
- Etapas, anos e componentes curriculares

### 10.2 Estrutura da Importação

```typescript
// scripts/import-bncc.ts
import { prisma } from '@/lib/db'
import * as XLSX from 'xlsx'

interface BnccRow {
  codigo: string              // "EF03MA09" ou "EI03TS01"
  descricao: string           // Texto da habilidade
  etapa: string               // "Educação Infantil", "Ensino Fundamental I", etc
  ano?: string                // "3º ano" (EF) ou "Crianças pequenas" (EI)
  componente?: string         // "Matemática" (EF) ou "Traços, sons..." (EI)
  unidadeTematica?: string    // "Números" (apenas EF)
  objetoConhecimento?: string // "Fração" (apenas EF)
  comentarios?: string        // Campo auxiliar
  sugestoes?: string          // Sugestões curriculares
}

// Mapeamento de nomes legíveis para slugs
const educationLevelMap: Record<string, string> = {
  'Educação Infantil': 'educacao-infantil',
  'Ensino Fundamental I': 'ensino-fundamental-1',
  'Ensino Fundamental II': 'ensino-fundamental-2',
}

const gradeMap: Record<string, string> = {
  '1º ano': 'ef1-1-ano',
  '2º ano': 'ef1-2-ano',
  '3º ano': 'ef1-3-ano',
  // ... completar
  'Bebês': 'ei-bebes',
  'Crianças bem pequenas': 'ei-criancas-bem-pequenas',
  'Crianças pequenas': 'ei-criancas-pequenas',
}

const subjectMap: Record<string, string> = {
  'Matemática': 'matematica',
  'Língua Portuguesa': 'lingua-portuguesa',
  'O eu, o outro e o nós': 'ei-o-eu-o-outro-e-o-nos',
  // ... completar
}

// Função auxiliar: Expandir códigos multi-ano (EF12, EF15, EF67, etc)
function expandGrades(code: string, educationLevelSlug: string): string[] {
  // Extrair anos do código (ex: "EF12LP01" → "12")
  const match = code.match(/^E[IF](\d{2})/)
  if (!match) return []

  const yearCode = match[1]

  // Códigos multi-ano conhecidos
  const multiYearMap: Record<string, string[]> = {
    '12': ['ef1-1-ano', 'ef1-2-ano'],                    // Anos 1-2
    '15': ['ef1-1-ano', 'ef1-2-ano', 'ef1-3-ano', 'ef1-4-ano', 'ef1-5-ano'], // Anos 1-5
    '35': ['ef1-3-ano', 'ef1-4-ano', 'ef1-5-ano'],       // Anos 3-5
    '67': ['ef2-6-ano', 'ef2-7-ano'],                    // Anos 6-7
    '69': ['ef2-6-ano', 'ef2-7-ano', 'ef2-8-ano', 'ef2-9-ano'], // Anos 6-9
    '89': ['ef2-8-ano', 'ef2-9-ano'],                    // Anos 8-9
  }

  return multiYearMap[yearCode] || []
}

async function importBncc() {
  console.log('📚 Importando habilidades BNCC...')

  // 1. Ler planilha Excel
  const workbook = XLSX.readFile('./data/bncc-oficial.xlsx')
  const sheet = workbook.Sheets['Habilidades']
  const rows: BnccRow[] = XLSX.utils.sheet_to_json(sheet)

  let imported = 0
  let skipped = 0

  // 2. Para cada linha da planilha
  for (const row of rows) {
    try {
      // Mapear para slugs
      const educationLevelSlug = educationLevelMap[row.etapa]
      const gradeSlug = row.ano ? gradeMap[row.ano] : null
      const subjectSlug = row.componente ? subjectMap[row.componente] : null

      if (!educationLevelSlug) {
        console.warn(`⚠️  Etapa desconhecida: ${row.etapa}`)
        skipped++
        continue
      }

      // Detectar se é EI ou EF pelo código
      const isEI = row.codigo.startsWith('EI')

      // ⚠️ IMPORTANTE: Expandir códigos multi-ano (EF12, EF15, etc)
      const gradesToImport = expandGrades(row.codigo, educationLevelSlug)
      const finalGrades = gradesToImport.length > 0 ? gradesToImport : [gradeSlug]

      // Criar uma linha para cada ano do intervalo
      for (const currentGradeSlug of finalGrades) {
        if (!currentGradeSlug && !isEI) {
          console.warn(`⚠️  gradeSlug ausente para ${row.codigo}`)
          continue
        }

        // Criar habilidade BNCC
        // ⚠️ Usar constraint correto: EI usa ageRange, EF usa gradeSlug
        const uniqueWhere = isEI
          ? {
              code_ageRange: {
                code: row.codigo,
                ageRange: currentGradeSlug || ''
              }
            }
          : {
              code_gradeSlug: {
                code: row.codigo,
                gradeSlug: currentGradeSlug || ''
              }
            }

        await prisma.bnccSkill.upsert({
          where: uniqueWhere,
          update: {
            description: row.descricao,
            comments: row.comentarios,
            curriculumSuggestions: row.sugestoes,
          },
          create: {
            code: row.codigo,
            description: row.descricao,
            educationLevelSlug,

            // Campos específicos de EI
            fieldOfExperience: isEI ? row.componente : null,
            ageRange: isEI ? currentGradeSlug : null,

            // Campos específicos de EF
            gradeSlug: !isEI ? currentGradeSlug : null,
            subjectSlug: !isEI ? subjectSlug : null,
            unitTheme: row.unidadeTematica,
            knowledgeObject: row.objetoConhecimento,

            // Auxiliares
            comments: row.comentarios,
            curriculumSuggestions: row.sugestoes,

            // search_vector será criado automaticamente pelo trigger SQL
          },
        })

        imported++
      }
    } catch (error) {
      console.error(`❌ Erro ao importar ${row.codigo}:`, error)
      skipped++
    }
  }

  console.log(`✅ Importação concluída: ${imported} habilidades, ${skipped} puladas`)
  console.log(`💡 Códigos multi-ano (EF12, EF15, etc) foram expandidos automaticamente`)
}

importBncc()
```

### 10.3 Extensões do PostgreSQL

**O script `reset-db.sh` já cria as extensões automaticamente:**

```sql
-- Extensões criadas automaticamente
CREATE EXTENSION IF NOT EXISTS vector;    # pgvector - para embeddings
CREATE EXTENSION IF NOT EXISTS unaccent;  # Remove acentos no FTS

# Cria trigger FTS
CREATE OR REPLACE FUNCTION bncc_skill_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW."code", ''))), 'A') ||
    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW."description", ''))), 'A') ||
    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW."unitTheme", ''))), 'B') ||
    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW."knowledgeObject", ''))), 'B') ||
    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW."comments", ''))), 'C') ||
    setweight(to_tsvector('portuguese', unaccent(coalesce(NEW."curriculumSuggestions", ''))), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

# Cria índice GIN
CREATE INDEX IF NOT EXISTS bncc_skill_search_gin
ON "bncc_skill" USING GIN ("searchVector");
```

**✅ Não precisa fazer nada manualmente!**

---

### 10.4 Características do FTS Implementado

**O que o trigger FTS faz:**

1. **Usa `unaccent`** para remover acentos
   - "matemática" encontra "matematica"
   - "fração" encontra "fracao"

2. **Pesos diferentes por campo:**
   - **Peso A** (mais importante): `code`, `description`
   - **Peso B** (médio): `unitTheme`, `knowledgeObject`
   - **Peso C** (menos): `comments`, `curriculumSuggestions`

3. **Busca inteligente:**
   ```sql
   -- Busca com ranking automático
   WHERE "searchVector" @@ websearch_to_tsquery('portuguese', 'fração')
   ORDER BY ts_rank("searchVector", websearch_to_tsquery('portuguese', 'fração')) DESC
   ```

4. **Atualização automática:**
   - Trigger roda em BEFORE INSERT OR UPDATE
   - Qualquer mudança no registro atualiza o searchVector

**✅ Tudo gerenciado pelo `reset-db.sh`**

---

### 10.5 Embeddings (Busca Semântica)

**Por que usar embeddings no MVP:**
- ✅ **Busca semântica**: "operações matemáticas" encontra "adição e subtração"
- ✅ **Similaridade**: Encontrar habilidades relacionadas mesmo com termos diferentes
- ✅ **Melhor experiência**: Professoras não precisam usar termos exatos da BNCC
- ✅ **Custo baixo**: ~$0.015 uma vez (menos de 2 centavos!)

**Como gerar embeddings:**

```bash
# 1. Configurar .env
OPENAI_API_KEY=sk-proj-...
EMBED_MODEL=text-embedding-3-small  # Padrão
EMBED_BATCH_SIZE=100                # Padrão

# 2. Executar script
npx tsx scripts/embed.ts

# Exemplo de output:
# 🔧 Backfill de embeddings
#    Modelo: text-embedding-3-small
#    Batch size: 100
#    Delay entre batches: 1000ms
#
# 📊 Pendentes: 1,547 habilidades
# 💰 Custo estimado: ~$0.0155 (773,500 tokens)
# ⏱️  Tempo estimado: ~16 batches × 1000ms
#
# Batch #1: 100/100 salvos | Progresso: 100/1547 (6.5%) | Restam: 1447
# ...
# ✅ Concluído! 1547 embeddings gerados.
```

**Criar índice IVFFlat (depois de gerar embeddings):**

```sql
-- Executar no SQL Editor do Neon ou Prisma Studio
CREATE INDEX IF NOT EXISTS bncc_skill_embedding_idx
ON "bncc_skill"
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Verificar índice criado
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'bncc_skill' AND indexname LIKE '%embedding%';
```

**Busca por similaridade (depois de criar índice):**

```typescript
// Exemplo: Encontrar habilidades similares
const { embeddings } = await embed({
  model: openai.embedding('text-embedding-3-small'),
  value: 'operações matemáticas básicas'
})

const similar = await prisma.$queryRaw<Array<{
  code: string
  description: string
  distance: number
}>>`
  SELECT
    code,
    description,
    embedding <=> ${`[${embeddings[0].join(',')}]`}::vector(1536) as distance
  FROM bncc_skill
  WHERE grade_slug = 'ef1-3-ano'
    AND subject_slug = 'matematica'
  ORDER BY distance ASC
  LIMIT 10
`
```

**Custo estimado:**
- **text-embedding-3-small**: $0.020 / 1M tokens
- **1.500 habilidades**: ~$0.015 (uma vez)
- **Manutenção**: Apenas novos registros

**Decisão para MVP:**
- ✅ **Embeddings no MVP** - busca semântica desde o início
- ✅ **FTS como fallback** - para buscas exatas e rápidas
- 🎯 **Melhor de ambos** - combinar FTS + embeddings conforme necessidade

---

### 10.6 Validação Pós-Importação

```typescript
// scripts/validate-bncc.ts
import { prisma } from '@/lib/db'

async function validateBncc() {
  console.log('🔍 Validando importação BNCC...\n')

  // 1. Contar habilidades por etapa
  const countsByLevel = await prisma.$queryRaw<Array<{
    educationLevelSlug: string
    total: number
  }>>`
    SELECT
      education_level_slug as "educationLevelSlug",
      COUNT(*) as total
    FROM bncc_skill
    GROUP BY education_level_slug
    ORDER BY education_level_slug
  `

  console.log('📊 Habilidades por etapa:')
  console.table(countsByLevel)

  // 2. Contar habilidades por grade
  const countsByGrade = await prisma.$queryRaw<Array<{
    gradeSlug: string
    total: number
  }>>`
    SELECT
      grade_slug as "gradeSlug",
      COUNT(*) as total
    FROM bncc_skill
    WHERE grade_slug IS NOT NULL
    GROUP BY grade_slug
    ORDER BY grade_slug
  `

  console.log('\n📚 Habilidades por ano/série:')
  console.table(countsByGrade)

  // 3. Verificar habilidades sem search_vector
  const withoutFTS = await prisma.bnccSkill.count({
    where: { searchVector: null }
  })

  if (withoutFTS > 0) {
    console.error(`\n⚠️  ${withoutFTS} habilidades SEM search_vector (trigger não funcionou!)`)
  } else {
    console.log('\n✅ Todas as habilidades têm search_vector')
  }

  // 4. Testar busca FTS
  console.log('\n🔎 Testando Full-Text Search...')
  const testResults = await prisma.$queryRaw<Array<{
    code: string
    description: string
  }>>`
    SELECT code, LEFT(description, 60) as description
    FROM bncc_skill
    WHERE search_vector @@ websearch_to_tsquery('portuguese', 'fração')
    LIMIT 3
  `

  console.log('Resultados para "fração":')
  console.table(testResults)

  console.log('\n✅ Validação concluída!')
}

validateBncc()
```

---

## 11. Fases de Implementação

> **Dependências:** Ver [PRD-00: Infraestrutura](./00-INFRASTRUCTURE-DEPENDENCIES.md)

---

### ✅ PRÉ-REQUISITOS (Antes de Começar)

**Certifique-se de que está pronto:**

- [x] **Taxonomia BNCC semeada** (`prisma/seeds/seed-taxonomy.ts`)
  - **3 EducationLevels:** EI, EF1, EF2 (não inclui Ensino Médio)
  - **12 Grades:** 3 EI + 5 EF1 + 4 EF2
  - **14 Subjects:** 5 campos EI + 9 componentes EF
  - **GradeSubject:** Apenas para EF (EI não tem)
  - **Validação:** EF1 tem 8 componentes (SEM inglês), EF2 tem 9 (COM inglês)

- [ ] **Seeds BNCC criados**
  - `prisma/seeds/seed-bncc-infantil.ts` ✅ (criado)
  - `prisma/seeds/seed-bncc-fundamental.ts` ✅ (criado)
  - `prisma/seeds/index.ts` ✅ (integrado)

- [ ] **Dados BNCC baixados**
  - TSV da Educação Infantil → `prisma/seeds/data/bncc_infantil.tsv`
  - TSV do Ensino Fundamental → `prisma/seeds/data/bncc_fundamental.tsv`

- [ ] **Arquitetura confirmada**
  - EI NÃO usa Subject.slug (usa fieldOfExperience em BnccSkill)
  - EF USA Subject.slug (Matemática, Português, etc)
  - EF1 tem 8 componentes, EF2 tem 9 componentes

- [ ] **Embeddings confirmados**
  - ✅ **MVP COM embeddings** - busca semântica + FTS
  - Script pronto: `scripts/embed.ts` (~$0.015, 15-20 min)
  - Custo baixo e valor alto para experiência do usuário

**Quando tudo estiver ✅, prossiga para Fase 0.**

---

### 📦 Fase 0: Preparação e Setup (15-30 min)

**Objetivo:** Instalar dependências e confirmar dados BNCC

**Checklist:**
- [ ] **Instalar dependências de IA**
  ```bash
  npm install ai @ai-sdk/openai
  ```
- [ ] **Configurar variáveis de ambiente** (.env)
  ```env
  OPENAI_API_KEY=sk-proj-...
  ```
- [ ] **Confirmar TSVs BNCC existem**
  - Educação Infantil: `prisma/seeds/data/bncc_infantil.tsv`
  - Ensino Fundamental: `prisma/seeds/data/bncc_fundamental.tsv`
  - ⚠️ Se não tiver, baixar de: http://basenacionalcomum.mec.gov.br/

**⚠️ IMPORTANTE:**
- O script `scripts/reset-db.sh` JÁ configura tudo:
  - Cria extensões (vector, unaccent)
  - Cria trigger FTS automaticamente
  - Cria índice GIN automaticamente
  - Faz backfill do searchVector após seed
- **Não precisa** fazer setup manual de banco!

**Bloqueadores:** Nenhum
**Entrega:** Dependências instaladas e TSVs prontos

---

### 🗄️ Fase 1: Base de Dados BNCC (1-2 dias)

**Objetivo:** Importar todas as habilidades BNCC para o banco de dados

**Checklist:**
- [ ] **1.1 - Schema Prisma**
  - [ ] Criar model `BnccSkill` no `schema.prisma`
  - [ ] Executar: `npx prisma migrate dev --name add_bncc_skill`
  - [ ] Verificar migration criada

- [ ] **1.2 - Confirmar schema BnccSkill**
  - [ ] Verificar que campo `embedding` foi removido (só FTS agora)
  - [ ] Verificar índices: educationLevelSlug, gradeSlug, subjectSlug, code
  - [ ] Verificar unique compostos: code_gradeSlug, code_ageRange

- [ ] **1.3 - Executar Script de Reset Completo**
  - [ ] Verificar TSVs em `prisma/seeds/data/`
  - [ ] Executar: `./scripts/reset-db.sh`
  - [ ] O script faz TUDO:
    - Drop/cria schema public
    - Cria extensões (vector, unaccent)
    - Aplica schema Prisma
    - Cria trigger FTS automaticamente
    - Cria índice GIN automaticamente
    - Roda seeds (EI + EF)
    - Faz backfill do searchVector
    - Gera build
  - [ ] Verificar console: Deve mostrar imports EI + EF

- [ ] **1.4 - Validação**
  - [ ] Criar `scripts/validate-bncc.ts`
  - [ ] Contar habilidades por etapa
  - [ ] Contar habilidades por ano
  - [ ] Verificar search_vector populado
  - [ ] Testar busca FTS com "fração"
  - [ ] Executar: `npx tsx scripts/validate-bncc.ts`

- [ ] **1.5 - Gerar Embeddings (Busca Semântica)**
  - [ ] Configurar OpenAI no .env: `OPENAI_API_KEY=sk-proj-...`
  - [ ] Executar: `npx tsx scripts/embed.ts`
  - [ ] Aguardar conclusão (~15-20 min para ~1.900 habilidades)
  - [ ] Custo: ~$0.015 (text-embedding-3-small)
  - [ ] Verificar log de progresso (batch, percentual)

- [ ] **1.6 - Criar Índice IVFFlat**
  - [ ] Executar SQL no Neon Console ou Prisma Studio:
    ```sql
    CREATE INDEX IF NOT EXISTS bncc_skill_embedding_idx
    ON "bncc_skill"
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
    ```
  - [ ] Verificar índice criado:
    ```sql
    SELECT indexname FROM pg_indexes
    WHERE tablename = 'bncc_skill' AND indexname LIKE '%embedding%';
    ```

**Bloqueadores:** Fase 0 concluída
**Entrega:** ~1.900 habilidades BNCC importadas e validadas com FTS + Embeddings operacionais

---

### 🔌 Fase 2: APIs de Consulta BNCC (1 dia)

**Objetivo:** Endpoints para o wizard consumir

**Decisão de Arquitetura:** Rotas genéricas (não `/bncc/*`) para reutilização em todo o sistema.

**Checklist:**
- [x] **2.1 - GET /api/v1/education-levels** (genérico, reutilizável)
  - [x] Retornar lista de EducationLevel (slug, name, order)
  - [x] Testado: 3 etapas (EI, EF1, EF2) ✅

- [x] **2.2 - GET /api/v1/grades?educationLevelSlug=...** (genérico, reutilizável)
  - [x] Retornar grades filtrados por etapa (via join com EducationLevel)
  - [x] Testado EF1: 5 anos ✅
  - [x] Testado EI: 3 faixas etárias ✅

- [x] **2.3 - GET /api/v1/subjects?educationLevelSlug=...&gradeSlug=...** (genérico, reutilizável)
  - [x] Retornar subjects válidos para o grade (via GradeSubject)
  - [x] Testado EF1: 8 disciplinas (SEM inglês) ✅
  - [x] Testado EF2: 9 disciplinas (COM inglês) ✅
  - [x] Nota: EI não usa subjects (usa fieldOfExperience em BnccSkill)

- [x] **2.4 - GET /api/v1/bncc/skills?...** (Busca Híbrida) - específico BNCC
  - [x] Implementar busca híbrida (FTS + Embeddings)
  - [x] Suportar filtros: educationLevelSlug, gradeSlug, subjectSlug, q (busca)
  - [x] Suportar bifurcação EI (ageRange + fieldOfExperience)
  - [x] Implementar 3 modos:
    - [x] `searchMode=fts`: Full-Text Search com unaccent (testado: 362ms) ✅
    - [x] `searchMode=semantic`: Embeddings (testado: 2.0s) ✅
    - [x] `searchMode=hybrid`: FTS 60% + embeddings 40% (testado: 1.2s) ✅
  - [x] Limitar a 50 resultados (padrão, máximo 100)
  - [x] Ordenar por relevância (ts_rank + vector distance no hybrid)

**Bloqueadores:** Fase 1 concluída ✅
**Entrega:** APIs testadas e funcionando (100% ✅)

**Debug realizado (FTS):**
- Problema identificado: searchVector usava `unaccent()`, mas queries não
- Solução: Adicionar `unaccent($1)` em todas as queries FTS e hybrid
- Testado com acentos: "fração", "multiplicação", "adição", "operações" ✅
- Performance: FTS (362ms) < Hybrid (1.2s) < Semantic (2.0s)

---

### 📝 Fase 3: Schema de Planos + Controle de Uso (1 dia)

**Objetivo:** Estrutura para salvar planos e limitar uso mensal

**Checklist:**
- [x] **3.1 - Schema Prisma**
  - [x] Criar model `LessonPlan` (slugs, bifurcação EI/EF, content JSON) ✅
  - [x] Criar model `LessonPlanUsage` (userId + yearMonth unique) ✅
  - [x] Executar db push ✅
  - [x] Gerar Prisma Client ✅

- [x] **3.2 - Zod Schema de Validação**
  - [x] Criar `lib/schemas/lesson-plan.ts` ✅
  - [x] Implementar `LessonPlanContentSchema` (completo com 6 seções) ✅
  - [x] Validar estrutura: identification, bnccSkills, objectives, methodology, resources, evaluation ✅

- [x] **3.3 - Services de Controle**
  - [x] Criar `services/lesson-plans/get-usage.ts` (getLessonPlanUsage, canCreateLessonPlan) ✅
  - [x] Criar `services/lesson-plans/increment-usage.ts` (upsert atômico) ✅
  - [x] Implementar lógica year-month (YYYY-MM) com reset automático ✅
  - [x] Limite configurado: 15 planos/mês ✅

- [x] **3.4 - API de Uso**
  - [x] GET /api/v1/lesson-plans/usage (com autenticação better-auth) ✅
  - [x] Retornar: used, limit, remaining, resetsAt, yearMonth ✅

**Bloqueadores:** Fase 0 concluída ✅
**Entrega:** Estrutura de dados pronta para receber planos (100% ✅)

---

### 🤖 Fase 4: Geração com IA (2-3 dias) ✅ **100% CONCLUÍDA**

**Objetivo:** Endpoint que gera plano de aula usando OpenAI

**Checklist:**
- [x] **4.1 - Prompts**
  - [x] Criar `lib/ai/prompts/lesson-plan.ts`
  - [x] Implementar `systemPrompt` (especialista em pedagogia)
  - [x] Implementar `buildUserPrompt()` (com habilidades BNCC)
  - [x] Revisar com professora real (se possível)

- [x] **4.2 - Service de Geração**
  - [x] Criar `services/lesson-plans/generate-content.ts`
  - [x] Implementar `generateLessonPlanContent()` com `generateObject()`
  - [x] Usar `gpt-4o-mini` (custo-benefício)
  - [x] Validar output com Zod schema
  - [x] Tratar erros da OpenAI

- [x] **4.3 - API POST /api/v1/lesson-plans**
  - [x] Validar autenticação (session)
  - [x] Validar assinante (role === 'subscriber' || 'admin')
  - [x] Verificar limite mensal (< 30) ← **AJUSTADO de 15 para 30**
  - [x] Buscar habilidades BNCC completas (códigos → objetos completos)
  - [x] Gerar conteúdo com IA
  - [x] Salvar no banco (LessonPlan)
  - [x] Incrementar uso (LessonPlanUsage)
  - [x] Retornar plano + URLs de download

- [x] **4.4 - Testes**
  - [x] Testar com EF (Matemática, 3º ano, frações) ✅ 13.3s
  - [x] Testar com EI (Campo de experiência) ✅ 12.3s
  - [x] Validar qualidade do plano gerado ✅ Excelente
  - [x] Verificar tempo de geração (~30s) ✅ ~12-13s
  - [ ] Testar erro quando limite atingido ← **Não testado (requer 30+ planos)**

**Bloqueadores:** Fase 2 e 3 concluídas
**Entrega:** ✅ Geração de planos funcionando perfeitamente

**Observações técnicas:**
- Schema Zod ajustado para compatibilidade com OpenAI Structured Outputs (todos os campos obrigatórios)
- bnccSkills removido do conteúdo gerado (já disponível no input)
- identification removido (metadata preenchida pelo usuário posteriormente)
- Tempo médio de geração: ~12-13s (melhor que estimado)
- Qualidade dos planos: pedagogicamente sólidos e alinhados às habilidades BNCC

---

### 🎨 Fase 5: Wizard UI - Quiz Style (2-3 dias)

**Objetivo:** Interface de wizard no formato quiz/inlead (uma pergunta por tela)

**UX/UI Guidelines:**
- ✅ **Uma pergunta por tela** - Foco total em cada decisão
- ✅ **Seleção única → Avança automaticamente** - Sem botão "Continuar"
- ✅ **Múltipla seleção → Botão "Continuar"** - Para confirmar escolhas
- ✅ **Input de texto → Botão "Continuar"** - Para tema/título
- ✅ **Progress indicator** - "3 de 7" no topo
- ✅ **Transições suaves** - Animação entre perguntas (framer-motion)
- ✅ **Voltar permitido** - Seta no topo esquerdo

**Checklist:**
- [ ] **5.1 - Estrutura Base**
  - [ ] Criar `create-plan-drawer.tsx` (Vaul Drawer full-screen)
  - [ ] Criar `quiz-progress.tsx` (indicador "X de 7")
  - [ ] Criar `quiz-question.tsx` (container com animação)
  - [ ] Implementar state management (useState para wizard state)
  - [ ] Implementar navegação com histórico (voltar/avançar)
  - [ ] Adicionar transições (framer-motion: slide in/out)

- [ ] **5.2 - Componentes Reutilizáveis**
  - [ ] Criar `single-choice.tsx`
    - Cards grandes (mobile-friendly)
    - Auto-avança ao clicar
    - Feedback visual (pulse/scale)
  - [ ] Criar `multiple-choice.tsx`
    - Checkboxes com contador "X de 3"
    - Botão "Continuar" habilitado quando válido
    - Validação de mínimo/máximo
  - [ ] Criar `text-input-question.tsx`
    - Input grande e claro
    - Botão "Continuar" habilitado quando preenchido
    - Auto-focus

- [ ] **5.3 - Pergunta 1: Etapa de Ensino**
  - [ ] Criar `question-education-level.tsx`
  - [ ] Buscar etapas via API (GET /api/v1/bncc/education-levels)
  - [ ] Renderizar como SingleChoice
  - [ ] Texto: "Para qual etapa de ensino?"
  - [ ] Opções: "Educação Infantil", "Ensino Fundamental I", "Ensino Fundamental II"

- [ ] **5.4 - Pergunta 2: Ano/Faixa Etária** (bifurca aqui)
  - [ ] Criar `question-grade.tsx`
  - [ ] Buscar anos via API (GET /api/v1/bncc/grades?educationLevelSlug=...)
  - [ ] Renderizar como SingleChoice
  - [ ] Texto EI: "Qual faixa etária?"
  - [ ] Texto EF: "Para qual ano?"
  - [ ] Auto-avança ao selecionar

- [ ] **5.5 - Pergunta 3: Disciplina/Campo**
  - [ ] Criar `question-subject.tsx`
  - [ ] Buscar disciplinas via API (GET /api/v1/bncc/subjects?...)
  - [ ] Renderizar como SingleChoice
  - [ ] Texto EI: "Qual campo de experiência?"
  - [ ] Texto EF: "Qual disciplina?"
  - [ ] Auto-avança ao selecionar

- [ ] **5.6 - Pergunta 4: Tema da Aula**
  - [ ] Criar `question-theme.tsx`
  - [ ] Renderizar como TextInputQuestion
  - [ ] Texto: "Qual o tema da aula?"
  - [ ] Placeholder: "Ex: Frações básicas e suas representações"
  - [ ] Validação: mínimo 5 caracteres
  - [ ] Botão "Continuar"

- [ ] **5.7 - Pergunta 5: Duração**
  - [ ] Criar `question-duration.tsx`
  - [ ] Renderizar como SingleChoice
  - [ ] Texto: "Quantas aulas?"
  - [ ] Opções: "1 aula (50 min)", "2 aulas (100 min)", "3 aulas (150 min)"
  - [ ] Auto-avança ao selecionar

- [ ] **5.8 - Pergunta 6: Habilidades BNCC**
  - [ ] Criar `question-skills.tsx`
  - [ ] Input de busca com debounce (500ms)
  - [ ] Buscar via API (GET /api/v1/bncc/skills?q=...)
  - [ ] Renderizar como MultipleChoice
  - [ ] Texto: "Selecione até 3 habilidades BNCC"
  - [ ] Mostrar cards com código + descrição
  - [ ] Contador "X de 3 selecionadas"
  - [ ] Validação: mínimo 1, máximo 3
  - [ ] Botão "Continuar" (só ativo quando 1-3 selecionadas)

- [ ] **5.9 - Pergunta 7: Revisão Final**
  - [ ] Criar `question-review.tsx`
  - [ ] Mostrar resumo editável:
    - Etapa + Ano + Disciplina (com botão "Editar")
    - Tema (com botão "Editar")
    - Duração (com botão "Editar")
    - Habilidades (lista com botão "Editar")
  - [ ] Botão "Gerar Meu Plano" (grande e destacado)

- [ ] **5.10 - Estados de Loading e Sucesso**
  - [ ] Criar `question-generating.tsx`
    - Animação de loading
    - Progress bar fake (0% → 100% em ~30s)
    - Textos motivacionais ("Analisando habilidades BNCC...", "Criando objetivos...", etc)
  - [ ] Criar `question-success.tsx`
    - Animação de sucesso (confetti/checkmark)
    - Preview do plano gerado
    - Botões: "Baixar Word", "Baixar PDF", "Criar Outro Plano"

**Bloqueadores:** Fase 4 concluída
**Entrega:** Wizard completo no formato quiz (uma pergunta por tela, auto-avança em seleção única)

**Nota:** A bifurcação EI vs EF está embutida nas perguntas 2 e 3 (textos diferentes baseados em `educationLevelSlug`).

---

### 📥 Fase 6: Exportação (Word + PDF) (2-3 dias)

**Objetivo:** Gerar arquivos .docx e .pdf para download

**Checklist:**
- [ ] **6.1 - Instalação**
  - [ ] `npm install docx`
  - [ ] `npm install @react-pdf/renderer`

- [ ] **6.2 - Template Word**
  - [ ] Criar `lib/export/word-template.ts`
  - [ ] Implementar estrutura: Título, Identificação, Habilidades BNCC, Objetivos, Metodologia, Recursos, Avaliação
  - [ ] Testar geração local
  - [ ] Validar abertura no Word/Google Docs

- [ ] **6.3 - Template PDF**
  - [ ] Criar `lib/export/pdf-template.tsx`
  - [ ] Implementar layout similar ao Word
  - [ ] Testar geração local

- [ ] **6.4 - Services**
  - [ ] Criar `services/lesson-plans/export-word.ts`
  - [ ] Criar `services/lesson-plans/export-pdf.ts`
  - [ ] Retornar Buffer

- [ ] **6.5 - API de Download**
  - [ ] GET /api/v1/lesson-plans/:id/download?format=docx|pdf
  - [ ] Validar ownership (apenas dono ou admin)
  - [ ] Gerar arquivo
  - [ ] Retornar com headers corretos (Content-Disposition, Content-Type)
  - [ ] Testar download no navegador

**Bloqueadores:** Fase 4 concluída
**Entrega:** Download de planos funcionando

---

### 📚 Fase 7: Lista e Histórico (2 dias)

**Objetivo:** Tela principal com lista de planos criados

**Checklist:**
- [ ] **7.1 - Página Principal**
  - [ ] Criar `app/(client)/lesson-plans/page.tsx`
  - [ ] Implementar layout responsivo
  - [ ] Adicionar botão "Criar Novo Plano" (abre drawer)

- [ ] **7.2 - Empty State**
  - [ ] Criar `empty-state.tsx`
  - [ ] Ilustração/ícone
  - [ ] Texto motivacional
  - [ ] Botão CTA: "Criar Meu Primeiro Plano"
  - [ ] Mostrar "15 planos disponíveis este mês"

- [ ] **7.3 - Lista de Planos**
  - [ ] Criar `plan-list.tsx`
  - [ ] Criar `plan-card.tsx`
  - [ ] Mostrar: título, etapa, ano, disciplina, data, botões download
  - [ ] Ordenar por data (mais recentes primeiro)
  - [ ] Limitar a 20 planos

- [ ] **7.4 - Barra de Uso**
  - [ ] Criar `usage-progress.tsx`
  - [ ] Mostrar: "Você criou X de 15 planos este mês"
  - [ ] Progress bar visual
  - [ ] Aviso quando próximo do limite

- [ ] **7.5 - APIs**
  - [ ] GET /api/v1/lesson-plans (lista)
  - [ ] GET /api/v1/lesson-plans/:id (detalhes)

- [ ] **7.6 - Hooks**
  - [ ] Criar `useLessonPlans.ts` (React Query)
  - [ ] Criar `useLessonPlanUsage.ts` (React Query)

**Bloqueadores:** Fase 6 concluída
**Entrega:** Tela de planos funcionando

---

### ✨ Fase 8: Polimento e Lançamento (1-2 dias)

**Objetivo:** Ajustes finais e preparação para produção

**Checklist:**
- [ ] **8.1 - Otimização de Prompts**
  - [ ] Testar com 5 temas diferentes (EF)
  - [ ] Testar com 3 temas diferentes (EI)
  - [ ] Validar qualidade com professora real
  - [ ] Ajustar prompts se necessário

- [ ] **8.2 - UX/UI**
  - [ ] Revisar responsividade mobile (80% do tráfego)
  - [ ] Adicionar loading states em todas as ações
  - [ ] Adicionar toasts de sucesso/erro (sonner)
  - [ ] Validar todos os formulários (Zod)
  - [ ] Mensagens de erro amigáveis

- [ ] **8.3 - Performance**
  - [ ] Adicionar debounce na busca de habilidades
  - [ ] Cachear listas de educationLevels, grades, subjects
  - [ ] Otimizar queries SQL (EXPLAIN ANALYZE)

- [ ] **8.4 - Monitoramento**
  - [ ] Adicionar logging de tokens usados (custo)
  - [ ] Adicionar analytics (planos criados, downloads)
  - [ ] Configurar alertas (se custo > $50/mês)

- [ ] **8.5 - Testes Finais**
  - [ ] Testar fluxo completo EI (ponta a ponta)
  - [ ] Testar fluxo completo EF (ponta a ponta)
  - [ ] Testar limite mensal
  - [ ] Testar re-download de plano antigo
  - [ ] Testar no mobile (Chrome DevTools)

**Bloqueadores:** Fase 7 concluída
**Entrega:** Feature pronta para produção! 🚀

---

## 📊 Resumo de Tempo Estimado

| Fase | Descrição | Tempo | Acumulado |
|------|-----------|-------|-----------|
| 0 | Preparação e Setup | 1h | 1h |
| 1 | Base de Dados BNCC | 1-2 dias | 2 dias |
| 2 | APIs de Consulta | 1 dia | 3 dias |
| 3 | Schema + Controle de Uso | 1 dia | 4 dias |
| 4 | Geração com IA | 2-3 dias | 7 dias |
| 5 | Wizard UI Quiz-Style | 2-3 dias | 10 dias |
| 6 | Exportação (Word/PDF) | 2-3 dias | 13 dias |
| 7 | Lista e Histórico | 2 dias | 15 dias |
| 8 | Polimento | 1-2 dias | **17 dias** |

**Total:** ~3 semanas (trabalhando solo, full-time)

**Nota:** A Fase 6 (Bifurcação EI vs EF) foi integrada na Fase 5 (wizard quiz-style), economizando ~2 dias.

---

## 12. Métricas de Sucesso

| Métrica | Meta Mês 1 | Meta Mês 3 |
|---------|------------|------------|
| % assinantes que usam | 40% | 60% |
| Planos criados/mês | 500 | 2.000 |
| Taxa de download | 90% | 95% |
| Planos/usuário/mês | 4 | 8 |
| Custo médio/usuário | $0.005 | $0.010 |

**Indicadores de qualidade:**
- Planos baixados vs criados (sucesso se > 90%)
- Usuários que criam 2+ planos (retenção)
- Feedback qualitativo (pesquisa pós-geração)

---

## 13. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Plano genérico demais | Média | Alto | Prompt detalhado + habilidades específicas + testes com professoras reais |
| Professora não entende wizard | Média | Alto | UX ultra-simples, uma pergunta por vez, testes de usabilidade |
| Habilidade BNCC errada | Baixa | Alto | Professora seleciona manualmente (não IA sugere) |
| Custo de IA alto | Baixa | Médio | Limite de 15/mês, gpt-4o-mini, monitoramento de tokens |
| Dados BNCC desatualizados | Baixa | Médio | Usar fonte oficial MEC, script de re-importação |
| Exportação não abre na escola | Média | Alto | Testar com Word/Google Docs reais, formato .docx padrão |

---

## 14. FAQ

**P: Por que não usar chat conversacional?**
R: Professoras têm dificuldade com tecnologia. Wizard com botões é mais rápido e menos propenso a erros.

**P: Por que a professora seleciona as habilidades BNCC?**
R: Dá controle e auditabilidade. Coordenador não questiona "a IA escolheu errado".

**P: Por que limite de 15 planos/mês?**
R: Suficiente para uso real (~1 plano/dia útil), custo baixo ($0.02/usuário), evita abuso.

**P: E se a professora precisar de mais?**
R: Pode ser upsell futuro (plano premium com mais planos).

**P: Funciona para Educação Infantil?**
R: Sim, mas usa "Campos de Experiência" ao invés de disciplinas (conforme BNCC).

**P: Como garantir que a IA gera planos de qualidade?**
R: Prompts específicos + habilidades BNCC selecionadas + testes com professoras reais + iteração dos prompts.

**P: E se a BNCC mudar?**
R: Seeds de re-importação já contemplam isso. Basta baixar novos TSVs do MEC e executar `npx prisma db seed`.

---

## 15. Checklist de Start Rápido

### Antes de começar a codificar:

```bash
# 1. Confirmar taxonomia
npx prisma studio
# Verificar: 3 EducationLevels, 12 Grades, 14 Subjects
# EF1 deve ter 8 GradeSubjects, EF2 deve ter 9

# 2. Baixar dados BNCC (se ainda não tiver)
# Colocar em:
#   - prisma/seeds/data/bncc_infantil.tsv
#   - prisma/seeds/data/bncc_fundamental.tsv

# 3. Verificar seeds BNCC
ls -la prisma/seeds/
# Deve ter:
#   - seed-bncc-infantil.ts ✅
#   - seed-bncc-fundamental.ts ✅
#   - index.ts (com imports) ✅

# 4. Criar branch de feature
git checkout -b feature/lesson-plan-generator

# 5. Pronto para Fase 0!
```

### Primeira coisa a fazer (Fase 0):

```bash
# 1. Instalar dependências de IA
npm install ai @ai-sdk/openai

# 2. Configurar OpenAI
echo "OPENAI_API_KEY=sk-proj-..." >> .env

# 3. Garantir que TSVs existem
ls -la prisma/seeds/data/bncc_*.tsv

# 4. Rodar reset completo (faz tudo automaticamente!)
./scripts/reset-db.sh

# 5. Verificar no Prisma Studio
npx prisma studio
# Deve ter: bncc_skill populado com habilidades

# 6. Começar implementação pela Fase 1 (APIs)!
```

**Boa sorte! 🚀**
