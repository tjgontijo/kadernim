# PRD: Community Wizard - Integração BNCC com Reutilização de Código

## Visão Geral

Este documento define os requisitos para integrar seleção de códigos BNCC no Community Wizard, mantendo máxima reutilização de componentes existentes e seguindo a estrutura do Lesson Plans.

## Análise da Estrutura Atual

### **Schema Prisma (Verificado)**
```prisma
model CommunityRequest {
  id String @id @default(cuid())
  title String
  description String @db.Text
  votingMonth String

  educationLevelId String
  educationLevel   EducationLevel @relation(fields: [educationLevelId], references: [id])

  gradeId String?
  grade   Grade?  @relation(fields: [gradeId], references: [id])

  subjectId String
  subject   Subject @relation(fields: [subjectId], references: [id])

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  status CommunityRequestStatus @default(draft)
  // ... outros campos
}
```

**Observação**: Schema atual já suporta educationLevel, grade e subject. Não há campo específico para BNCC skills.

### **Hooks Existentes (Analisados)**

Todos os hooks estão em `src/hooks/use-taxonomy.ts`:

- `useBnccSkills()` - Busca habilidades BNCC com cache 30min
- `useBnccThemes()` - Busca temas BNCC com cache 1h
- `useEducationLevels()` - Cache 1h
- `useGrades()` - Cache 1h
- `useSubjects()` - Cache 1h

### **Componentes Reutilizáveis Identificados**

#### Componentes Compartilhados (podem ser importados diretamente)

Localizados em `src/components/client/quiz/`:
- `QuizStep` - Container para cada step do wizard
- `QuizChoice` - Seleção única/múltipla com cards
- `QuizAction` - Botão de ação principal
- `QuizCard` - Card individual de opção
- `QuizLayout` - Layout do drawer/modal
- `QuizSkillPicker` - Seletor de habilidades BNCC

#### Componentes que devem ser COPIADOS para `src/components/client/community/`
> **Importante**: Componentes organizados dentro de um caso de uso específico (lesson-plans) devem ser copiados para o domínio community, não importados diretamente. Isso evita acoplamento entre features.

- `question-skills.tsx` (de `lesson-plans/questions/`) → Copiar para `community/questions/question-bncc-skills.tsx`

---

## UI da Página Community

### **Tabs de Navegação**
Similar à estrutura de Resources, com duas abas principais:

```
┌─────────────────────────────────────────────────────────┐
│  [Todas]  [Minhas Solicitações]                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Conteúdo da aba selecionada                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### **Aba: Todas (Ranking)**
- **Ordenação**: Por número de votos (descendente)
- **Exibição**: Estilo ranking com posição visível (1º, 2º, 3º, etc.)
- **Informações**: Título, votos, autor, comentários count, status
- **Ações**: Votar, comentar, ver detalhes

```
┌─────────────────────────────────────────────────────────┐
│ 1º │ Apostila de frações para 4º ano                   │
│    │ Maria   12 comentários   47 votos                 │
├────┴────────────────────────────────────────────────────┤
│ 2º │ Jogo de alfabetização                             │
│    │ João    8 comentários    38 votos                 │
├─────────────────────────────────────────────────────────┤
│ 3º │ Mural de rotina                                   │
│    │ Ana     5 comentários    31 votos                 │
└─────────────────────────────────────────────────────────┘
```

### **Aba: Minhas Solicitações**
- **Ordenação**: Por data de criação (mais recentes primeiro)
- **Exibição**: Lista normal com badge de posição no ranking geral
- **Informações**: Título, status, posição no ranking, votos, comentários
- **Ações**: Editar (se draft), ver detalhes, excluir

```
┌─────────────────────────────────────────────────────────┐
│ Apostila de frações para 4º ano          1º lugar      │
│ Status: voting   47 votos   12 comentários             │
├─────────────────────────────────────────────────────────┤
│ Cartazes de números                      15º lugar     │
│ Status: voting   8 votos    2 comentários              │
├─────────────────────────────────────────────────────────┤
│ Meu rascunho                             Rascunho      │
│ Status: draft    Editar | Excluir                      │
└─────────────────────────────────────────────────────────┘
```

### **Página de Detalhes (Request)**
- Informações completas do pedido
- Lista de uploads/referências
- Seção de comentários (thread)
- Botão de voto
- Se owner: botão editar/excluir

### **Filtros (Já Implementados)**
A página já possui filtros em cascata:
- Etapa de Ensino
- Ano/Série
- Componente/Campo

---

## Regras de Negócio

### **Modelo de Configurações Centralizado**

> **IMPORTANTE**: Todos os limites devem ser configuráveis via banco de dados, não hardcoded.

As configurações são armazenadas no model `SystemConfig` e podem ser ajustadas por role.

### **Acesso por Role**
| Role | Visualizar | Votar | Comentar | Criar Solicitação |
|------|------------|-------|----------|-------------------|
| `user` (não-assinante) | Leitura | - | - | - |
| `subscriber` | Sim | Sim | Sim | Sim |
| `editor` | Sim | Sim | Sim | Sim |
| `manager` | Sim | Sim | Sim | Sim |
| `admin` | Sim | Sim | Sim | Sim |

> Usuários não-assinantes podem ver o ranking e acessar detalhes das solicitações, mas em modo **somente leitura**.

### **Configurações Padrão (via SystemConfig)**

| Configuração | Chave | Valor Padrão | Descrição |
|--------------|-------|--------------|-----------|
| Votos por mês (subscriber) | `community.votes.subscriber` | 5 | Máximo de votos mensais para assinantes |
| Votos por mês (admin) | `community.votes.admin` | 999 | Máximo de votos mensais para admins |
| Solicitações por mês | `community.requests.limit` | 1 | Máximo de solicitações por mês |
| Pré-requisito de votos | `community.requests.minVotes` | 1 | Votos mínimos antes de criar solicitação |
| Max uploads por request | `community.uploads.maxFiles` | 5 | Máximo de arquivos por solicitação |
| Max tamanho upload (MB) | `community.uploads.maxSizeMB` | 2 | Tamanho máximo por arquivo |
| Max BNCC skills | `community.bncc.maxSkills` | 5 | Máximo de habilidades BNCC selecionáveis |

### **Votos**
| Regra | Configuração |
|-------|--------------|
| Máx votos por mês | Definido por role via `SystemConfig` |
| Votos por request | 1 (unique constraint no banco) |
| Pode votar no próprio? | Não (validação no service) |

### **Criação de Solicitações**
| Regra | Configuração |
|-------|--------------|
| Máx solicitações por mês | Via `SystemConfig` |
| Pré-requisito | Deve ter votado `minVotes` vezes no mês |
| Status inicial | `voting` (entra direto em votação) |

---

## Requisitos Funcionais

### **1. Pergunta Inicial: Alinhamento BNCC**
- **Localização**: Primeiro step do wizard
- **Componente**: Reutilizar `QuizChoice` existente
- **Opções**:
  - "Sim, tem alinhamento" → Fluxo BNCC
  - "Não, é material geral" → Fluxo simplificado

### **2. Fluxo Condicional (Sem IA)**

#### **Fluxo BNCC (Com Alinhamento)**
```
1. Alinhamento BNCC? → SIM
2. Taxonomia (3 dropdowns em cascata na mesma tela):
   ├── Etapa de Ensino (single-select)
   ├── Ano/Faixa Etária (single-select, filtrado pela etapa)
   └── Componente Curricular (single-select, filtrado pelo ano)
3. Seleção BNCC Skills (multi-select, máx via config)
4. Título + Descrição + Upload (tudo na mesma tela)
5. Review
```

#### **Fluxo Simplificado (Sem Alinhamento)**
```
1. Alinhamento BNCC? → NÃO
2. Título + Descrição + Upload (tudo na mesma tela)
3. Review
```

> **Nota**: Fluxo sem IA - título e descrição são inseridos manualmente pelo usuário.

#### **Upload de Referências**
| Configuração | Valor Padrão | Chave SystemConfig |
|--------------|--------------|-------------------|
| Formatos aceitos | PNG, JPG, PDF | (fixo no código) |
| Máximo de arquivos | 5 | `community.uploads.maxFiles` |
| Tamanho máximo por arquivo | 2MB | `community.uploads.maxSizeMB` |

---

## Implementação Técnica

### **1. Estado do Wizard**
```typescript
interface CommunityWizardState {
  // Taxonomia (condicional - apenas se hasBnccAlignment = true)
  educationLevelId?: string
  educationLevelSlug?: string
  educationLevelName?: string
  gradeId?: string
  gradeSlug?: string
  gradeName?: string
  subjectId?: string
  subjectSlug?: string
  subjectName?: string

  // Alinhamento BNCC
  hasBnccAlignment?: boolean

  // BNCC Skills (condicional - apenas se hasBnccAlignment = true)
  selectedSkills?: Array<{ code: string; description: string }>

  // Conteúdo (sempre obrigatório)
  title?: string
  description?: string

  // Upload de referências
  attachments?: File[]
}
```

### **2. Novo Step: `bncc-alignment`**
```typescript
// src/components/client/community/questions/question-bncc-alignment.tsx
// REUTILIZAÇÃO: QuizChoice + QuizStep existentes
interface QuestionBnccAlignmentProps {
  onSelect: (hasAlignment: boolean) => void
}

export function QuestionBnccAlignment({ onSelect }: QuestionBnccAlignmentProps) {
  return (
    <QuizStep
      title="Este material tem alinhamento com a BNCC?"
      description="Alguns materiais como murais de presença não precisam de alinhamento curricular específico."
    >
      <QuizChoice
        options={[
          {
            id: 'yes',
            slug: 'yes',
            name: 'Sim, tem alinhamento',
            description: 'Material pedagógico com objetivos de aprendizagem específicos',
            icon: BookOpen
          },
          {
            id: 'no',
            slug: 'no',
            name: 'Não, é material geral',
            description: 'Material organizacional ou de apoio sem objetivos curriculares',
            icon: Layout
          }
        ]}
        onSelect={(opt) => onSelect(opt.slug === 'yes')}
        autoAdvance={true}
      />
    </QuizStep>
  )
}
```

### **3. Step: `QuestionBnccSkills`**
```typescript
// src/components/client/community/questions/question-bncc-skills.tsx
// CÓPIA ADAPTADA de lesson-plans/questions/question-skills.tsx
interface QuestionBnccSkillsProps {
  educationLevelSlug: string
  gradeSlug: string
  subjectSlug: string
  selectedSkills: Array<{ code: string; description: string }>
  maxSkills: number // Via SystemConfig
  onChange: (skills: Array<{ code: string; description: string }>) => void
  onContinue: () => void
}

export function QuestionBnccSkills({
  educationLevelSlug,
  gradeSlug,
  subjectSlug,
  selectedSkills,
  maxSkills,
  onChange,
  onContinue
}: QuestionBnccSkillsProps) {
  const { data: skills, isLoading } = useBnccSkills({
    educationLevelSlug,
    gradeSlug,
    subjectSlug,
    limit: 100,
    searchMode: 'text'
  })

  return (
    <QuizStep
      title="Selecione as habilidades BNCC"
      description={`Escolha até ${maxSkills} habilidades que o material deve desenvolver.`}
    >
      <QuizChoice
        options={skills?.map(skill => ({
          id: skill.code,
          slug: skill.code,
          name: skill.code,
          description: skill.description
        })) || []}
        value={selectedSkills.map(s => s.code)}
        onSelect={(opt) => {
          const exists = selectedSkills.find(s => s.code === opt.slug)
          if (exists) {
            onChange(selectedSkills.filter(s => s.code !== opt.slug))
          } else if (selectedSkills.length < maxSkills) {
            onChange([...selectedSkills, { code: opt.slug, description: opt.description || '' }])
          }
        }}
        multiple={true}
        maxSelection={maxSkills}
        showCounter={true}
        loading={isLoading}
        onContinue={onContinue}
        continueLabel="Continuar"
      />
    </QuizStep>
  )
}
```

### **4. Step: `QuestionContent` (Título + Descrição + Upload)**
```typescript
// src/components/client/community/questions/question-content.tsx
interface QuestionContentProps {
  title: string
  description: string
  attachments: File[]
  maxFiles: number // Via SystemConfig
  maxSizeMB: number // Via SystemConfig
  onChange: (updates: Partial<CommunityWizardState>) => void
  onContinue: () => void
}

export function QuestionContent({
  title,
  description,
  attachments,
  maxFiles,
  maxSizeMB,
  onChange,
  onContinue
}: QuestionContentProps) {
  const isValid = title.length >= 10 && description.length >= 20

  return (
    <QuizStep
      title="Descreva o material que você precisa"
      description="Título claro e descrição detalhada ajudam a comunidade a entender sua necessidade."
    >
      <div className="space-y-6">
        {/* Título */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Título</label>
          <input
            type="text"
            className="w-full h-14 bg-muted/50 border-2 border-border/50 rounded-2xl px-4 font-medium focus:border-primary focus:ring-0 transition-all outline-none"
            placeholder="Ex: Jogo de tabuleiro sobre frações"
            value={title}
            onChange={(e) => onChange({ title: e.target.value })}
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground">{title.length}/100 caracteres</p>
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Descrição detalhada</label>
          <textarea
            className="w-full h-32 bg-muted/50 border-2 border-border/50 rounded-2xl p-4 font-medium focus:border-primary focus:ring-0 transition-all outline-none resize-none"
            placeholder="Descreva com detalhes o que você precisa, para qual contexto, e como pretende usar..."
            value={description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>

        {/* Upload */}
        <FileUploadArea
          files={attachments}
          onFilesChange={(files) => onChange({ attachments: files })}
          accept={['image/png', 'image/jpeg', 'application/pdf']}
          maxFiles={maxFiles}
          maxSizeMB={maxSizeMB}
        />

        <QuizAction
          label="Revisar"
          disabled={!isValid}
          onClick={onContinue}
        />
      </div>
    </QuizStep>
  )
}
```

### **5. Step: `QuestionTaxonomy` (3 dropdowns em cascata)**
```typescript
// src/components/client/community/questions/question-taxonomy.tsx
// Similar ao lesson-plans - 3 selects na mesma tela
interface QuestionTaxonomyProps {
  educationLevelId?: string
  gradeId?: string
  subjectId?: string
  onChange: (updates: Partial<CommunityWizardState>) => void
  onContinue: () => void
}

export function QuestionTaxonomy({
  educationLevelId,
  gradeId,
  subjectId,
  onChange,
  onContinue
}: QuestionTaxonomyProps) {
  const { data: educationLevels } = useEducationLevels()
  const { data: grades } = useGrades(selectedEducationLevelSlug)
  const { data: subjects } = useSubjects(selectedEducationLevelSlug, selectedGradeSlug, true)

  const isComplete = educationLevelId && gradeId && subjectId

  return (
    <QuizStep
      title="Para qual etapa é o material?"
      description="Selecione a etapa, ano e componente curricular."
    >
      <div className="space-y-4">
        {/* Etapa de Ensino */}
        <QuizSelect
          label="Etapa de Ensino"
          placeholder="Selecione a etapa"
          options={educationLevels?.map(el => ({ value: el.slug, label: el.name })) || []}
          value={selectedEducationLevelSlug}
          onChange={(slug) => {
            const level = educationLevels?.find(el => el.slug === slug)
            onChange({
              educationLevelId: level?.id,
              educationLevelSlug: slug,
              educationLevelName: level?.name,
              gradeId: undefined,
              gradeSlug: undefined,
              gradeName: undefined,
              subjectId: undefined,
              subjectSlug: undefined,
              subjectName: undefined,
            })
          }}
        />

        {/* Ano/Faixa Etária */}
        <QuizSelect
          label="Ano/Faixa Etária"
          placeholder="Selecione o ano"
          options={grades?.map(g => ({ value: g.slug, label: g.name })) || []}
          value={selectedGradeSlug}
          onChange={(slug) => {
            const grade = grades?.find(g => g.slug === slug)
            onChange({
              gradeId: grade?.id,
              gradeSlug: slug,
              gradeName: grade?.name,
              subjectId: undefined,
              subjectSlug: undefined,
              subjectName: undefined,
            })
          }}
          disabled={!educationLevelId}
        />

        {/* Componente Curricular */}
        <QuizSelect
          label="Componente Curricular"
          placeholder="Selecione o componente"
          options={subjects?.map(s => ({ value: s.slug, label: s.name })) || []}
          value={selectedSubjectSlug}
          onChange={(slug) => {
            const subject = subjects?.find(s => s.slug === slug)
            onChange({
              subjectId: subject?.id,
              subjectSlug: slug,
              subjectName: subject?.name,
            })
          }}
          disabled={!gradeId}
        />

        <QuizAction
          label="Continuar"
          disabled={!isComplete}
          onClick={onContinue}
        />
      </div>
    </QuizStep>
  )
}
```

### **6. Fluxo no CreateRequestDrawer**

```typescript
// Steps disponíveis (simplificado)
export type CommunityStep =
  | 'bncc-alignment'     // Pergunta inicial
  | 'taxonomy'           // Etapa + Ano + Disciplina (se BNCC)
  | 'bncc-skills'        // Seleção de skills (se BNCC)
  | 'content'            // Título + Descrição + Upload
  | 'review'             // Revisão final
  | 'submitting'
  | 'success'

// Step 1: Pergunta inicial
{currentStep === 'bncc-alignment' && (
  <QuestionBnccAlignment
    onSelect={(hasAlignment) => {
      if (hasAlignment) {
        goToNextStep('taxonomy', { hasBnccAlignment: true })
      } else {
        goToNextStep('content', { hasBnccAlignment: false })
      }
    }}
  />
)}

// Step 2 (BNCC): Taxonomia (3 dropdowns em uma tela)
{currentStep === 'taxonomy' && wizardState.hasBnccAlignment && (
  <QuestionTaxonomy
    educationLevelId={wizardState.educationLevelId}
    gradeId={wizardState.gradeId}
    subjectId={wizardState.subjectId}
    onChange={(updates) => setWizardState(prev => ({ ...prev, ...updates }))}
    onContinue={() => goToNextStep('bncc-skills', {})}
  />
)}

// Step 3 (BNCC): Seleção de Skills
{currentStep === 'bncc-skills' && wizardState.hasBnccAlignment && (
  <QuestionBnccSkills
    educationLevelSlug={wizardState.educationLevelSlug!}
    gradeSlug={wizardState.gradeSlug!}
    subjectSlug={wizardState.subjectSlug!}
    selectedSkills={wizardState.selectedSkills || []}
    maxSkills={config.maxBnccSkills} // Via SystemConfig
    onChange={(skills) => setWizardState(prev => ({ ...prev, selectedSkills: skills }))}
    onContinue={() => goToNextStep('content', {})}
  />
)}

// Step 4 (BNCC) ou Step 2 (Simplificado): Título + Descrição + Upload
{currentStep === 'content' && (
  <QuestionContent
    title={wizardState.title || ''}
    description={wizardState.description || ''}
    attachments={wizardState.attachments || []}
    maxFiles={config.maxUploadFiles} // Via SystemConfig
    maxSizeMB={config.maxUploadSizeMB} // Via SystemConfig
    onChange={(updates) => setWizardState(prev => ({ ...prev, ...updates }))}
    onContinue={() => goToNextStep('review', {})}
  />
)}

// Step 5 (BNCC) ou Step 3 (Simplificado): Review
{currentStep === 'review' && (
  <ReviewStep wizardState={wizardState} onSubmit={handleSubmit} />
)}
```

### **7. API Endpoint**
```typescript
// POST /api/v1/community/requests
{
  title: string,               // Obrigatório (min 10 chars)
  description: string,         // Obrigatório (min 20 chars)
  hasBnccAlignment: boolean,

  // Condicional: apenas se hasBnccAlignment = true
  educationLevelId?: string,
  gradeId?: string,
  subjectId?: string,
  bnccSkillCodes?: string[],   // Array de códigos BNCC

  // Attachments (FormData - multipart)
  attachments?: File[]         // Limites via SystemConfig
}
```

---

## Schema Database

### **NOVO: SystemConfig (Configurações Centralizadas)**

```prisma
model SystemConfig {
  id        String   @id @default(cuid())

  key       String   @unique  // Ex: "community.votes.subscriber"
  value     String             // Valor serializado (JSON ou string)
  type      ConfigType         // Tipo do valor para parsing

  // Metadata
  label       String?          // Label amigável para admin
  description String?          // Descrição do que configura
  category    String?          // Categoria para agrupamento (community, lesson-plans, etc)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([category])
  @@map("system_config")
}

enum ConfigType {
  string
  number
  boolean
  json
}
```

#### **Configurações Iniciais (Seed)**
```typescript
const communityConfigs = [
  // Votos
  { key: 'community.votes.subscriber', value: '5', type: 'number', category: 'community', label: 'Votos por mês (assinante)' },
  { key: 'community.votes.editor', value: '10', type: 'number', category: 'community', label: 'Votos por mês (editor)' },
  { key: 'community.votes.manager', value: '20', type: 'number', category: 'community', label: 'Votos por mês (manager)' },
  { key: 'community.votes.admin', value: '999', type: 'number', category: 'community', label: 'Votos por mês (admin)' },

  // Solicitações
  { key: 'community.requests.limit', value: '1', type: 'number', category: 'community', label: 'Solicitações por mês' },
  { key: 'community.requests.minVotes', value: '1', type: 'number', category: 'community', label: 'Votos mínimos para criar' },

  // Uploads
  { key: 'community.uploads.maxFiles', value: '5', type: 'number', category: 'community', label: 'Máx arquivos por solicitação' },
  { key: 'community.uploads.maxSizeMB', value: '2', type: 'number', category: 'community', label: 'Máx tamanho por arquivo (MB)' },

  // BNCC
  { key: 'community.bncc.maxSkills', value: '5', type: 'number', category: 'community', label: 'Máx habilidades BNCC' },
]
```

### **Service para Configurações**

```typescript
// src/services/config/system-config.ts
import { prisma } from '@/lib/db'

// Cache em memória (5 minutos)
const configCache = new Map<string, { value: any; expiresAt: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

export async function getConfig<T>(key: string, defaultValue: T): Promise<T> {
  // Verificar cache
  const cached = configCache.get(key)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as T
  }

  // Buscar do banco
  const config = await prisma.systemConfig.findUnique({
    where: { key }
  })

  if (!config) return defaultValue

  // Parse baseado no tipo
  let value: any
  switch (config.type) {
    case 'number':
      value = Number(config.value)
      break
    case 'boolean':
      value = config.value === 'true'
      break
    case 'json':
      value = JSON.parse(config.value)
      break
    default:
      value = config.value
  }

  // Atualizar cache
  configCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL })

  return value as T
}

// Helpers específicos para Community
export async function getCommunityConfig() {
  const [
    votesSubscriber,
    votesEditor,
    votesManager,
    votesAdmin,
    requestsLimit,
    requestsMinVotes,
    uploadsMaxFiles,
    uploadsMaxSizeMB,
    bnccMaxSkills,
  ] = await Promise.all([
    getConfig('community.votes.subscriber', 5),
    getConfig('community.votes.editor', 10),
    getConfig('community.votes.manager', 20),
    getConfig('community.votes.admin', 999),
    getConfig('community.requests.limit', 1),
    getConfig('community.requests.minVotes', 1),
    getConfig('community.uploads.maxFiles', 5),
    getConfig('community.uploads.maxSizeMB', 2),
    getConfig('community.bncc.maxSkills', 5),
  ])

  return {
    votes: {
      subscriber: votesSubscriber,
      editor: votesEditor,
      manager: votesManager,
      admin: votesAdmin,
    },
    requests: {
      limit: requestsLimit,
      minVotes: requestsMinVotes,
    },
    uploads: {
      maxFiles: uploadsMaxFiles,
      maxSizeMB: uploadsMaxSizeMB,
    },
    bncc: {
      maxSkills: bnccMaxSkills,
    },
  }
}

export function getVoteLimitByRole(role: UserRole, config: Awaited<ReturnType<typeof getCommunityConfig>>) {
  switch (role) {
    case 'admin': return config.votes.admin
    case 'manager': return config.votes.manager
    case 'editor': return config.votes.editor
    case 'subscriber': return config.votes.subscriber
    default: return 0 // user não pode votar
  }
}
```

### **Alteração: CommunityRequest**
```prisma
model CommunityRequest {
  // ... campos existentes

  // TORNAR OPCIONAL: educationLevelId e subjectId (para fluxo simplificado)
  educationLevelId String?  // Era obrigatório
  subjectId        String?  // Era obrigatório

  // NOVO: Alinhamento BNCC
  hasBnccAlignment Boolean @default(false)
  bnccSkillCodes   String[] @default([])

  // NOVO: Contador de comentários (desnormalizado para performance)
  commentCount     Int @default(0)

  // Relacionamentos existentes
  votes      CommunityRequestVote[]
  references CommunityRequestReference[]  // Sistema/Admin

  // NOVOS relacionamentos
  uploads    CommunityRequestUpload[]     // Usuário
  comments   CommunityRequestComment[]    // Discussão

  @@map("community_request")
}
```

### **NOVO: Uploads do Usuário**
```prisma
model CommunityRequestUpload {
  id        String   @id @default(cuid())
  requestId String
  request   CommunityRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Cloudinary
  cloudinaryPublicId String
  url                String

  // Metadata
  fileName  String
  fileType  String   // 'image/png' | 'image/jpeg' | 'application/pdf'
  fileSize  Int      // bytes

  createdAt DateTime @default(now())

  @@index([requestId])
  @@map("community_request_upload")
}
```

### **NOVO: Comentários**
```prisma
model CommunityRequestComment {
  id        String   @id @default(cuid())
  requestId String
  request   CommunityRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Thread (opcional - para respostas aninhadas)
  parentId  String?
  parent    CommunityRequestComment?  @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies   CommunityRequestComment[] @relation("CommentReplies")

  content   String   @db.Text
  isEdited  Boolean  @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([requestId])
  @@index([userId])
  @@index([parentId])
  @@map("community_request_comment")
}
```

### **Estruturas Existentes vs Novas**

| Model | Status | Descrição |
|-------|--------|-----------|
| `SystemConfig` | **Criar** | Configurações centralizadas do sistema |
| `CommunityRequestVote` | Existe | Rastreia quem votou em cada request |
| `CommunityRequestReference` | Existe | Arquivos do **sistema** (recursos produzidos) |
| `CommunityRequestUpload` | **Criar** | Uploads do **usuário** (referências visuais) |
| `CommunityRequestComment` | **Criar** | Comentários com suporte a threads |

> **Separação de domínio**: `Reference` = arquivos do sistema/admin. `Upload` = arquivos enviados pelo usuário no wizard.

---

## Atualização do Request Service

```typescript
// src/services/community/request-service.ts
import { getCommunityConfig, getVoteLimitByRole } from '@/services/config/system-config'

export async function voteForRequest(userId: string, userRole: UserRole, requestId: string) {
  const currentMonth = getCurrentYearMonth()
  const config = await getCommunityConfig()

  // Obter limite baseado no role
  const maxVotes = getVoteLimitByRole(userRole, config)

  if (maxVotes === 0) {
    throw new Error('Você precisa ser assinante para votar.')
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Check total votes this month
    const totalVotes = await tx.communityRequestVote.count({
      where: {
        userId,
        votingMonth: currentMonth,
      },
    })

    if (totalVotes >= maxVotes) {
      throw new Error(`Você já atingiu seu limite de ${maxVotes} votos este mês.`)
    }

    // 2. Verificar se não é o próprio request
    const request = await tx.communityRequest.findUnique({
      where: { id: requestId },
      select: { userId: true }
    })

    if (request?.userId === userId) {
      throw new Error('Você não pode votar na sua própria solicitação.')
    }

    // ... resto da lógica
  })
}

export async function createCommunityRequest(userId: string, userRole: UserRole, data: CommunityRequestInput) {
  const currentMonth = getCurrentYearMonth()
  const config = await getCommunityConfig()

  // 1. Check if user can create (role check)
  if (userRole === 'user') {
    throw new Error('Você precisa ser assinante para criar solicitações.')
  }

  // 2. Check if user has already made max requests this month
  const existingRequests = await prisma.communityRequest.count({
    where: {
      userId,
      votingMonth: currentMonth,
    },
  })

  if (existingRequests >= config.requests.limit) {
    throw new Error(`Você já criou ${config.requests.limit} pedido(s) este mês.`)
  }

  // 3. Check if user has voted enough this month
  const voteCount = await prisma.communityRequestVote.count({
    where: {
      userId,
      votingMonth: currentMonth,
    },
  })

  if (voteCount < config.requests.minVotes) {
    throw new Error(`Você precisa votar em pelo menos ${config.requests.minVotes} pedido(s) antes de sugerir o seu.`)
  }

  // ... resto da lógica
}
```

---

## Reutilização de Componentes

### **Componentes Compartilhados (importáveis)**
- `QuizStep`, `QuizChoice`, `QuizAction`, `QuizCard`, `QuizLayout` - de `src/components/client/quiz/`
- `QuizSkillPicker` - de `src/components/client/quiz/`
- Hooks de taxonomia (`useEducationLevels`, `useGrades`, `useSubjects`) - de `src/hooks/use-taxonomy.ts`
- Hooks BNCC (`useBnccSkills`, `useBnccThemes`) - de `src/hooks/use-taxonomy.ts`

### **Componentes COPIADOS/CRIADOS para `community/`**
> Evita acoplamento entre features

- `QuestionBnccAlignment` - Novo componente (pergunta sim/não sobre BNCC)
- `QuestionTaxonomy` - Novo componente (3 dropdowns em cascata: Etapa → Ano → Disciplina)
- `QuestionBnccSkills` - Cópia adaptada de `lesson-plans/questions/question-skills.tsx`
- `QuestionContent` - Título + Descrição + Upload (tudo junto, sem IA)
- `CreateRequestDrawer` - Adaptar fluxo condicional

---

## Casos de Uso

### **Material com BNCC**
- **Exemplo**: "Apostila de frações para 4º ano"
- **Fluxo**: Alinhamento(SIM) → Etapa → Ano → Disciplina → BNCC Skills → Conteúdo → Review
- **API**: Envia hasBnccAlignment=true, educationLevelId, gradeId, subjectId, bnccSkillCodes, title, description, attachments

### **Material sem BNCC**
- **Exemplo**: "Mural de presença para sala de aula"
- **Fluxo**: Alinhamento(NÃO) → Conteúdo → Review
- **API**: Envia hasBnccAlignment=false, title, description, attachments

---

## Plano de Implementação

### **Fase 1: Database e Schema**
1. Criar migration para `SystemConfig`
2. Criar seed com configurações iniciais de Community
3. Criar migration para `CommunityRequestUpload`
4. Criar migration para `CommunityRequestComment`
5. Alterar `CommunityRequest`: adicionar campos BNCC e tornar taxonomia opcional

### **Fase 2: Service de Configurações**
1. Implementar `src/services/config/system-config.ts`
2. Adicionar cache em memória com TTL
3. Criar helpers específicos para Community
4. Atualizar `request-service.ts` para usar configurações dinâmicas

### **Fase 3: Wizard - Fluxo Condicional**
1. Criar `QuestionBnccAlignment`
2. Criar `QuestionContent` (título + descrição + upload, sem IA)
3. Criar `QuestionBnccSkills` (cópia adaptada)
4. Extender `CommunityWizardState` interface
5. Adaptar `CreateRequestDrawer` com fluxo condicional
6. Remover steps de IA (refine, select-title)

### **Fase 4: Upload de Arquivos**
1. Criar componente `FileUploadArea`
2. Integrar com Cloudinary
3. Validar limites via SystemConfig
4. Atualizar API para salvar em `CommunityRequestUpload`

### **Fase 5: UI - Tabs e Ranking**
1. Implementar tabs "Todas" e "Minhas Solicitações"
2. Criar componente de ranking com posições
3. Exibir badge de posição na aba "Minhas Solicitações"
4. Implementar ordenação por votos e por data

### **Fase 6: Comentários**
1. Criar componente `CommentThread` com suporte a respostas
2. Implementar API de comentários (CRUD)
3. Exibir contador de comentários nas listagens
4. Página de detalhes com seção de comentários

### **Fase 7: Admin - Configurações**
1. Criar página admin para gerenciar `SystemConfig`
2. Agrupar por categoria (community, lesson-plans, etc)
3. Validação de tipos ao salvar

---

## Riscos e Mitigações

### **Risco 1: Complexidade de Fluxo Condicional**
- **Mitigação**: Implementação incremental com testes unitários
- **Fallback**: Manter fluxo original como fallback

### **Risco 2: Performance com SystemConfig**
- **Mitigação**: Cache em memória com TTL de 5 minutos
- **Monitoramento**: Logs de cache hit/miss

### **Risco 3: Upload de Arquivos**
- **Mitigação**: Validação client-side + server-side
- **Limites**: Configuráveis via SystemConfig

### **Risco 4: Ranking em Tempo Real**
- **Mitigação**: Usar campo `voteCount` desnormalizado (já existe)
- **Monitoramento**: Verificar consistência periódica

---

## Conclusão

Esta implementação prioriza **experiência de comunidade completa** com **configurações flexíveis**:

- **Configurações centralizadas** via `SystemConfig` - sem hardcoded
- **Hooks 100% reutilizados** (useBnccSkills, useBnccThemes, taxonomia)
- **Componentes base compartilhados** (QuizStep, QuizChoice, QuizAction)
- **Componentes de domínio copiados** para evitar acoplamento
- **Fluxo simplificado** sem IA
- **Upload apartado** em model separada (`CommunityRequestUpload`)
- **Sistema de comentários** com suporte a threads
- **UI com ranking** e posição visível
- **Limites por role** configuráveis

**Próximo passo**: Iniciar Fase 1 com migrations de database.
