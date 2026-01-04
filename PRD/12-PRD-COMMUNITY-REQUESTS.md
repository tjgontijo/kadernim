# PRD 12: Pedidos da Comunidade (Community Requests)

## 1. Visão Geral

### 1.1 O que é?
Uma área gamificada onde **assinantes** podem solicitar novos materiais pedagógicos e votar nas sugestões de outras professoras. No final de cada mês, os materiais mais votados são produzidos e disponibilizados no mês seguinte.

### 1.2 Por que fazer?
- **Engajamento**: Professoras se sentem parte da construção do produto
- **Retenção**: Motivo para voltar ao app regularmente
- **Produto-Market Fit**: Produzimos o que as professoras realmente precisam
- **Comunidade**: Cria senso de pertencimento e colaboração

### 1.3 Inspiração
- **Duolingo**: Gamificação com streaks, badges e feedback visual divertido
- **Product Hunt**: Sistema de upvotes com ranking mensal
- **Reddit**: Votação comunitária com transparência

---

## 2. Regras de Negócio

### 2.1 Quem pode participar?
| Ação | User | Subscriber | Admin |
|------|------|------------|-------|
| Visualizar pedidos | ❌ | ✅ | ✅ |
| Votar em pedidos | ❌ | ✅ | ✅ |
| Criar pedido | ❌ | ✅ | ✅ |
| Moderar pedidos | ❌ | ❌ | ✅ |

### 2.2 Sistema de Votação

**Votos por mês:**
- Cada assinante tem **5 votos por mês**
- Votos **não acumulam** para o próximo mês
- Votos são **resetados no dia 1** de cada mês (00:00 UTC-3)

**Restrições:**
- ❌ Não pode votar no próprio pedido
- ❌ Não pode votar mais de uma vez no mesmo pedido
- ❌ Não pode remover voto depois de dado

### 2.3 Sistema de Sugestões

**Para criar um pedido:**
- ✅ Precisa ter **votado em pelo menos 1 pedido** no mês atual
- ✅ Máximo de **1 pedido ativo por mês** (pendente ou em votação)
- ✅ Campos obrigatórios: Nível de Ensino, Disciplina, Descrição

**Ciclo de vida do pedido:**
```
                              ┌──────────────────────────────────┐
                              │      AVALIAÇÃO DE VIABILIDADE    │
                              │           (pela equipe)          │
                              └──────────────────────────────────┘
                                      ↑           │
[Rascunho] → [Em Votação] → [Selecionado]    ┌────┴────┐
                  │              (TOP 10)    │         │
                  ↓                          ↓         ↓
              [Arquivado]              [Aprovado]  [Inviável]
              (poucos votos)               │       (justificativa)
                                           ↓
                                    [Em Produção]
                                           ↓
                                     [Disponível]
                                     (link p/ Resource)
```

**Status "Inviável" (Desqualificado):**
- Admin pode marcar pedido como inviável mesmo após seleção
- **Obrigatório informar justificativa** (visível para a autora)
- Exemplos de justificativa:
  - "Material similar já existe no catálogo"
  - "Requer licenciamento de personagens protegidos"
  - "Escopo muito amplo - sugerimos dividir em pedidos menores"
  - "Fora do nosso foco pedagógico atual"
- Pedido inviável **não conta** contra o limite de 1 pedido/mês da autora
- Autora pode criar novo pedido ajustado

### 2.4 Seleção Mensal e Reset

**Regra de Ouro: Voto = Validação**
Pedidos com **0 votos** são **deletados permanentemente** no fim do mês.

**Funil de Sobrevivência (processado no dia 1 às 00:00 BRT):**

| Posição | Votos | Destino |
|---------|-------|--------|
| 1º ao 10º | 1+ | `selected` → Vai para avaliação do Admin |
| 11º ao 30º | 1+ | Continua em `voting` → Sobrevive para o próximo mês |
| Qualquer | 0 | **DELETADO** (DB + Cloudinary) |
| 31º em diante | Qualquer | **DELETADO** (DB + Cloudinary) |

**Regras de Desempate:**
1. **Mais votos ganha** (critério principal)
2. **Empate de votos**: Pedido mais antigo (`createdAt`) tem prioridade

**Reset Mensal (Justiça Competitiva):**
- Todos os pedidos que sobrevivem têm `voteCount` resetado para **zero**
- `survivedMonths` é incrementado (+1)
- Pedidos com `survivedMonths >= 3` são **deletados permanentemente** ("3 strikes")

**⚠️ IMPORTANTE: Seleção ≠ Produção Garantida**
- Pedidos selecionados vão para **avaliação de viabilidade** do Admin.
- Avaliação inclui: direitos autorais, complexidade técnica e alinhamento pedagógico.
- Pedidos aprovados → `approved` → entram em produção.
- Pedidos inviáveis → `unfeasible` (justificativa obrigatória, mantido por 30 dias para transparência antes da deleção automática).

### 2.5 Política de Limpeza (Cleanup)

**Deleção Permanente (Purge):**
- **Pedidos sem votos / Fora do Top 30**: Deletados imediatamente no processamento mensal.
- **Pedidos Inviáveis (`unfeasible`)**: Deletados após **30 dias** (tempo para a autora ver o feedback).
- **Pedidos Completados (`completed`)**: Referências/anexos deletados **imediatamente** após o vínculo com o Resource oficial.

**Motivação:** Manter o banco de dados limpo, o storage do Cloudinary otimizado e focar apenas no que a comunidade realmente validou. Sugestões são efêmeras; o material oficial é que é permanente.

### 2.6 Comunicação e Transparência

Para garantir que a deleção não seja percebida como erro do sistema, o sistema disparará notificações automáticas:

| Evento | Canal | Mensagem / Ação |
|--------|-------|-----------------|
| **Pedido Deletado (0 votos ou Ranking 31+)** | E-mail | "Sua sugestão não atingiu o apoio necessário nesta rodada. Que tal tentar um tema diferente?" |
| **Pedido Inviável (`unfeasible`)** | E-mail + Push | Justificativa do admin + Convite para criar um novo pedido corrigido. |
| **Pedido Selecionado (`selected`)** | E-mail + Push | Parabéns! Seu pedido está entre os 10 mais votados e será avaliado. |
| **Material Publicado (`completed`)**| E-mail + Push | "O material que você votou/pediu já está disponível!" (Para autor + todos que votaram). |

---

## 3. User Stories

### 3.1 Como Assinante

```gherkin
COMO assinante
QUERO ver os pedidos mais votados do mês
PARA votar nos que me interessam

COMO assinante
QUERO criar um pedido de material
PARA ter chance de receber o que preciso

COMO assinante
QUERO ver quantos votos ainda tenho
PARA decidir onde usar estrategicamente

COMO assinante
QUERO ver o histórico de pedidos produzidos
PARA saber que minha participação faz diferença
```

### 3.2 Como Admin

```gherkin
COMO admin
QUERO moderar pedidos inapropriados
PARA manter a qualidade das sugestões

COMO admin
QUERO marcar pedidos como "em produção"
PARA dar visibilidade do progresso

COMO admin
QUERO vincular pedido a um Resource produzido
PARA fechar o ciclo e notificar quem votou
```

---

## 4. Modelo de Dados (Prisma)

### 4.1 Novas Models

```prisma
// Status do pedido no ciclo de vida
enum CommunityRequestStatus {
  draft           // Rascunho (não publicado)
  voting          // Em votação (visível para todos)
  selected        // Selecionado para avaliação de viabilidade
  approved        // Aprovado para produção (viável)
  in_production   // Em produção
  completed       // Produzido e disponível
  unfeasible      // Inviável (desqualificado com justificativa)
}

// Pedido da comunidade
model CommunityRequest {
  id              String                  @id @default(cuid())

  // Autor (usa userId para consistência com o resto do sistema)
  userId          String
  user            User                    @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Categorização (usa tabelas existentes)
  educationLevelId String
  educationLevel   EducationLevel         @relation(fields: [educationLevelId], references: [id])
  
  gradeId          String?                // Opcional: para granularidade de ano/série (EF)
  grade            Grade?                 @relation(fields: [gradeId], references: [id])
  
  subjectId        String
  subject          Subject                @relation(fields: [subjectId], references: [id])

  // Conteúdo
  title           String                  // Título curto (max 100 chars)
  description     String    @db.Text      // Descrição detalhada (max 1000 chars)

  // Status e ciclo
  status          CommunityRequestStatus  @default(voting)
  votingMonth     String                  // Formato: "2026-02" (ano-mês inicial)

  // Contadores (desnormalizado para performance)
  voteCount       Int                     @default(0)
  survivedMonths  Int                     @default(0) // Quantas vezes sobreviveu ao corte mensal (max 3)

  // Justificativa de inviabilidade (quando status = unfeasible)
  unfeasibleReason String?   @db.Text     // Motivo da desqualificação (visível para autora)
  unfeasibleAt     DateTime?              // Quando foi marcado como inviável
  unfeasibleById   String?                // ID do admin que desqualificou

  // Vinculação com Resource produzido (quando completed)
  producedResourceId String?              @unique
  producedResource   Resource?            @relation(fields: [producedResourceId], references: [id])

  // Timestamps
  createdAt       DateTime                @default(now())
  updatedAt       DateTime                @updatedAt
  selectedAt      DateTime?               // Quando foi selecionado (top 10)
  completedAt     DateTime?               // Quando foi marcado como produzido
  unfeasibleAt     DateTime?              // Para controle de limpeza (30 dias)

  // Relações
  votes           CommunityRequestVote[]
  references      CommunityRequestReference[]

  @@index([userId])
  @@index([status, votingMonth])
  @@index([votingMonth, voteCount(sort: Desc)])
  @@index([educationLevelId])
  @@index([gradeId])
  @@index([subjectId])
  @@map("community_request")
}
```

```prisma
// Votos nos pedidos
model CommunityRequestVote {
  id              String            @id @default(cuid())

  requestId       String
  request         CommunityRequest  @relation(fields: [requestId], references: [id], onDelete: Cascade)

  userId          String            // Renomeado de voterId para consistência
  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  votingMonth     String            // Formato: "2026-02" - para contar votos do mês
  createdAt       DateTime          @default(now())

  @@unique([requestId, userId])     // Um voto por pessoa por pedido
  @@index([userId, votingMonth])    // Para contar votos usados no mês
  @@index([requestId])
  @@map("community_request_vote")
}

// Imagens de referência anexadas ao pedido (temporárias - serão deletadas após arquivamento/conclusão)
model CommunityRequestReference {
  id              String            @id @default(cuid())

  requestId       String
  request         CommunityRequest  @relation(fields: [requestId], references: [id], onDelete: Cascade)

  // Cloudinary
  cloudinaryPublicId String
  url             String

  createdAt       DateTime          @default(now())

  @@index([requestId])
  @@map("community_request_reference")
}
```

### 4.2 Alterações em Models Existentes

```prisma
// Adicionar em User
model User {
  // ... campos existentes ...

  // Novos campos
  communityRequests      CommunityRequest[]
  communityRequestVotes  CommunityRequestVote[]
}

// Adicionar em EducationLevel
model EducationLevel {
  // ... campos existentes ...
  communityRequests CommunityRequest[]
}

// Adicionar em Grade
model Grade {
  // ... campos existentes ...
  communityRequests CommunityRequest[]
}

// Adicionar em Subject
model Subject {
  // ... campos existentes ...
  communityRequests CommunityRequest[]
}

// Adicionar em Resource
model Resource {
  // ... campos existentes ...
  originRequest CommunityRequest?  // Se foi criado a partir de um pedido da comunidade
}
```

---

## 5. API Endpoints

### 5.1 Pedidos (Client)

```
GET    /api/v1/community/requests
       Query: month, status, educationLevel, subject, sort
       Response: { requests: [...], userVotes: [...], userVotesRemaining: 3 }

GET    /api/v1/community/requests/:id
       Response: { request, hasVoted, canVote }

POST   /api/v1/community/requests
       Body: { educationLevelId, subjectId, title, description }
       Validação: Precisa ter votado 1+ vezes no mês

POST   /api/v1/community/requests/:id/vote
       Validação: Não pode ser o autor, ter votos disponíveis

POST   /api/v1/community/requests/:id/references
       Body: FormData com imagem
       Limite: 3 imagens por pedido

GET    /api/v1/community/stats
       Response: { votesUsed, votesRemaining, myRequestsThisMonth, topRequests }
```

### 5.2 Administração

```
GET    /api/v1/admin/community/requests
       Query: month, status (com paginação)

PATCH  /api/v1/admin/community/requests/:id/status
       Body: { status: 'approved' | 'in_production' | 'completed' | 'archived' }

PATCH  /api/v1/admin/community/requests/:id/unfeasible
       Body: { reason: "Justificativa obrigatória..." }
       Marca como inviável com justificativa visível para autora

PATCH  /api/v1/admin/community/requests/:id/link-resource
       Body: { resourceId }
       Vincula pedido ao Resource produzido

POST   /api/v1/admin/community/process-month
       Processa fim do mês: seleciona top 10, arquiva baixa votação
```

### 5.3 Job de Processamento Mensal (Vercel Cron)

**Agendamento:** Dia 1 de cada mês, 00:05 BRT (`0 3 1 * *` UTC)

```typescript
// src/app/api/cron/community-month-end/route.ts
// Protegido por CRON_SECRET

export async function POST() {
  const currentMonth = getCurrentYearMonth() // "2026-02"
  const nextMonth = getNextYearMonth()       // "2026-03"

  await prisma.$transaction(async (tx) => {
    // 1. Notifica e Deleta TODOS com 0 votos
    const failedOnVotes = await tx.communityRequest.findMany({
      where: { votingMonth: currentMonth, voteCount: 0, status: 'voting' },
      select: { 
        id: true, 
        title: true,
        user: { select: { email: true, name: true } },
        references: { select: { cloudinaryPublicId: true } } 
      }
    })
    
    // Dispara e-mails (pode ser via fila ou background job)
    await sendRejectionEmails(failedOnVotes, "lack_of_support")

    // Deleta do Cloudinary e DB
    await tx.communityRequest.deleteMany({
      where: { id: { in: failedOnVotes.map(r => r.id) } }
    })

    // 2. Seleciona Top 10 (com 1+ votos)
    const top10 = await tx.communityRequest.findMany({
      where: { votingMonth: currentMonth, status: 'voting', voteCount: { gte: 1 } },
      orderBy: [{ voteCount: 'desc' }, { createdAt: 'asc' }],
      take: 10,
      select: { id: true }
    })
    await tx.communityRequest.updateMany({
      where: { id: { in: top10.map(r => r.id) } },
      data: { status: 'selected', selectedAt: new Date() }
    })

    // 3. Sobreviventes (posição 11-30): resetar votos e passar para próximo mês
    const survivors = await tx.communityRequest.findMany({
      where: { 
        votingMonth: currentMonth, 
        status: 'voting', 
        voteCount: { gte: 1 },
        id: { notIn: top10.map(r => r.id) }
      },
      orderBy: [{ voteCount: 'desc' }, { createdAt: 'asc' }],
      take: 20,
      select: { id: true, survivedMonths: true }
    })

    for (const req of survivors) {
      if (req.survivedMonths >= 2) {
        // 3 strikes - Deletar
        await tx.communityRequest.delete({ where: { id: req.id } })
      } else {
        // Sobrevive para próximo mês
        await tx.communityRequest.update({
          where: { id: req.id },
          data: { 
            votingMonth: nextMonth, 
            voteCount: 0, 
            survivedMonths: req.survivedMonths + 1 
          }
        })
      }
    }

    // 4. Deleta o resto (posição 31+)
    await tx.communityRequest.deleteMany({
      where: { votingMonth: currentMonth, status: 'voting' }
    })
  })

  return Response.json({ ok: true, processed: currentMonth })
}
```

### 5.4 Job de Limpeza de Anexos (Cleanup)

**Agendamento:** Diário, 03:00 BRT (`0 6 * * *` UTC)

```typescript
// src/app/api/cron/community-cleanup/route.ts

export async function POST() {
  const thirtyDaysAgo = subDays(new Date(), 30)

  // 1. Busca pedidos inviáveis há mais de 30 dias para remoção total
  const staleUnfeasible = await prisma.communityRequest.findMany({
    where: {
      status: 'unfeasible',
      unfeasibleAt: { lte: thirtyDaysAgo }
    },
    include: { references: true }
  })

  // ... lógica para deletar refs do Cloudinary ...

  // 2. Deleta os pedidos
  await prisma.communityRequest.deleteMany({
    where: { id: { in: staleUnfeasible.map(r => r.id) } }
  })

  return Response.json({ deleted: staleUnfeasible.length })
}
```

---

## 6. UI/UX Design

### 6.1 Telas Principais

**Página `/community` (Mobile-First):**
- **Header**: Título "Pedidos da Comunidade" + seletor de mês.
- **VoteProgress**: Indicador de votos usados (●●●○○ 3/5) estilo Duolingo.
- **Botão "Sugerir Material"**: Bloqueado até votar 1x. Liberado com animação.
- **Lista de Pedidos (Cards)**: Ordenados por `voteCount DESC`. Exibe título, categoria, descrição truncada, autor, votos e botão de votar.
- **Seção "Produzidos"**: Carousel horizontal com materiais recentes que vieram de pedidos da comunidade.

**Página `/community` (Desktop):**
- Layout em duas colunas: Lista de pedidos à esquerda, sidebar com estatísticas e produzidos à direita.

### 6.2 Drawer de Criação de Pedido (Wizard 3 Steps)

Seguindo o padrão `CrudEditDrawer` do projeto:

| Step | Conteúdo |
|------|----------|
| **1. Categoria** | Seleção de EducationLevel + Grade (opcional) + Subject. Cards visuais com ícones. |
| **2. Descrição** | Input de título (max 100 chars) + textarea de descrição (max 1000 chars). Dica: "Seja específica!" |
| **3. Referências** | Upload de até 3 imagens (opcional) + Preview do pedido + Botão "Publicar". Aviso: não editável após publicação. |

### 6.3 Drawer de Detalhes do Pedido

Ao clicar em um card, abre drawer com:
- Avatar + nome + username do autor
- Descrição completa do pedido
- Imagens de referência (se houver)
- Estatísticas: votos, dias restantes, posição no ranking
- Botão de votar (ou indicador "Já votado")
- Se `status === 'unfeasible'`: exibe card com justificativa da equipe

### 6.4 Elementos de Gamificação (Estilo Duolingo)

| Momento | Feedback Visual |
|---------|-----------------|
| **Após votar** | Confetti + contador incrementa (+1!) + toast "Voto computado!" |
| **Ao desbloquear sugestão** | Toast especial dourado "🔓 Sugestão Desbloqueada!" com animação de unlock |
| **Pedido selecionado (Top 10)** | Notificação celebratória "🏆 Seu pedido foi selecionado!" com opção de compartilhar |
| **Material produzido** | Push notification para todos que votaram: "O material que você ajudou a escolher está disponível!" |

### 6.5 Card de Pedido Inviável (para a autora)

Quando `status === 'unfeasible'`:
- Badge "⚠️ INVIÁVEL" no topo
- Caixa destacada com a justificativa da equipe
- CTA: "Criar novo pedido →" (já que o crédito é devolvido)
### 6.6 Painel Admin

**Página `/admin/community`:**
- Lista de pedidos filtráveis por status e mês
- Para pedidos `selected`: botões "Aprovar" e "Marcar Inviável"
- Modal de justificativa obrigatória para inviabilidade
- Vinculação de Resource ao pedido (ao marcar `completed`)

---

## 7. Componentes React

### 7.1 Estrutura de Arquivos

```
src/
├── app/(client)/community/
│   ├── page.tsx                    # Página principal (lista + stats)
│   └── layout.tsx
│
├── app/admin/community/
│   ├── page.tsx                    # Painel admin de pedidos
│   └── layout.tsx
│
├── components/client/community/
│   │
│   │  # Drawers (padrão CrudEditDrawer)
│   ├── request-create-drawer.tsx   # Wizard 3 steps para criar pedido
│   ├── request-detail-drawer.tsx   # Drawer com detalhes + tabs
│   │
│   │  # Cards e Listas
│   ├── request-card.tsx            # Card com votação inline
│   ├── request-list.tsx            # Lista/Grid de pedidos
│   ├── produced-carousel.tsx       # Carousel de produzidos
│   │
│   │  # Gamificação
│   ├── vote-progress.tsx           # ●●●○○ 3/5 votos (estilo Duolingo)
│   ├── vote-button.tsx             # Botão com animação de confetti
│   ├── vote-feedback-dialog.tsx    # Dialog de celebração
│   ├── unlock-toast.tsx            # Toast de desbloqueio
│   │
│   │  # Stats
│   ├── stats-card.tsx              # Estatísticas do usuário
│   └── community-header.tsx        # Header com votos + CTA
│
├── components/admin/community/
│   ├── request-admin-drawer.tsx    # Drawer admin (moderar/aprovar)
│   ├── unfeasible-dialog.tsx       # Dialog para justificar inviabilidade
│   └── request-admin-list.tsx      # Lista admin com ações em massa
│
├── hooks/
│   ├── useCommunityRequests.ts     # React Query - lista de pedidos
│   ├── useCommunityRequest.ts      # React Query - pedido único
│   ├── useCommunityStats.ts        # React Query - stats do usuário
│   ├── useCommunityVote.ts         # Mutation de voto (com optimistic update)
│   └── useCommunityCreate.ts       # Mutation de criar pedido
│
└── services/community/
    ├── list-requests.ts            # Listar pedidos com filtros
    ├── get-request.ts              # Buscar pedido por ID
    ├── create-request.ts           # Criar novo pedido
    ├── vote-request.ts             # Votar em pedido
    ├── get-stats.ts                # Stats do usuário
    ├── admin/
    │   ├── list-requests.ts        # Lista admin
    │   ├── update-status.ts        # Alterar status
    │   ├── mark-unfeasible.ts      # Marcar como inviável
    │   └── link-resource.ts        # Vincular a Resource
    └── types.ts                    # Types compartilhados
```

### 7.2 Padrão de Drawer (seguindo CrudEditDrawer)

Todos os drawers seguem o padrão do projeto:

```tsx
// request-create-drawer.tsx
import { CrudEditDrawer } from '@/components/admin/crud/crud-edit-drawer'

interface RequestCreateDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RequestCreateDrawer({ open, onOpenChange, onSuccess }: RequestCreateDrawerProps) {
  const [step, setStep] = useState(1)

  return (
    <CrudEditDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Novo Pedido"
      subtitle="COMUNIDADE"
      icon={MessageSquarePlus}
      maxWidth="max-w-4xl"
      showFooter={false} // Footer customizado por step
    >
      <WizardSteps currentStep={step} totalSteps={3} />

      {step === 1 && <StepCategory onNext={() => setStep(2)} />}
      {step === 2 && <StepDescription onNext={() => setStep(3)} onBack={() => setStep(1)} />}
      {step === 3 && <StepReferences onSubmit={handleSubmit} onBack={() => setStep(2)} />}
    </CrudEditDrawer>
  )
}
```

### 7.2 Componente VoteProgress (Duolingo-style)

```tsx
interface VoteProgressProps {
  used: number      // Votos usados
  total: number     // Total de votos (5)
  canSuggest: boolean
}

// Visual:
// ●  ●  ●  ○  ○
// 3 de 5 usados
//
// Se canSuggest = false:
// "Vote para desbloquear sua sugestão!"
//
// Se canSuggest = true:
// "✨ Você pode sugerir!"
```

---

### 7.3 Micro-interações e Animações

**Votação com Optimistic Update:**
```tsx
// useCommunityVote.ts
const voteMutation = useMutation({
  mutationFn: voteRequest,
  onMutate: async (requestId) => {
    // Cancela queries em andamento
    await queryClient.cancelQueries(['community-requests'])

    // Snapshot do estado anterior
    const previousRequests = queryClient.getQueryData(['community-requests'])

    // Optimistic update - incrementa voto imediatamente
    queryClient.setQueryData(['community-requests'], (old) => ({
      ...old,
      requests: old.requests.map(r =>
        r.id === requestId
          ? { ...r, voteCount: r.voteCount + 1, hasVoted: true }
          : r
      ),
      userStats: {
        ...old.userStats,
        votesUsed: old.userStats.votesUsed + 1
      }
    }))

    return { previousRequests }
  },
  onError: (err, requestId, context) => {
    // Rollback em caso de erro
    queryClient.setQueryData(['community-requests'], context.previousRequests)
    toast.error('Erro ao votar. Tente novamente.')
  },
  onSuccess: () => {
    // Feedback de sucesso com animação
    confetti({ particleCount: 50, spread: 60 })
  }
})
```

**Animações CSS (tailwind + framer-motion):**
```tsx
// VoteButton com animação
<motion.button
  whileTap={{ scale: 0.95 }}
  whileHover={{ scale: 1.02 }}
  animate={hasVoted ? { backgroundColor: '#10b981' } : {}}
  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
  onClick={handleVote}
  className={cn(
    'flex items-center gap-2 px-4 py-3 rounded-xl font-bold',
    'transition-all duration-200',
    hasVoted
      ? 'bg-green-500 text-white cursor-default'
      : 'bg-primary text-primary-foreground hover:shadow-lg'
  )}
>
  {hasVoted ? (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500 }}
      >
        <Check className="h-5 w-5" />
      </motion.div>
      Votado
    </>
  ) : (
    <>
      <ThumbsUp className="h-5 w-5" />
      Votar
    </>
  )}
</motion.button>

// Counter com animação de incremento
<motion.span
  key={voteCount}
  initial={{ y: -10, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  className="text-lg font-bold tabular-nums"
>
  {voteCount}
</motion.span>
```

**Toast de desbloqueio (estilo Duolingo):**
```tsx
// Ao atingir 1 voto, libera a sugestão
if (newVotesUsed >= 1 && oldVotesUsed < 1) {
  toast.custom((t) => (
    <motion.div
      initial={{ y: 50, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -50, opacity: 0 }}
      className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-2xl shadow-xl"
    >
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Unlock className="h-8 w-8" />
        </motion.div>
        <div>
          <p className="font-bold">Sugestão Desbloqueada!</p>
          <p className="text-sm opacity-90">Agora você pode criar seu pedido</p>
        </div>
      </div>
    </motion.div>
  ), { duration: 4000 })
}
```

---

## 8. Fluxos de Usuário

### 8.1 Primeiro Acesso (Assinante)

```
1. Entra em /community
2. Vê banner explicativo "Como funciona"
3. Vê seus votos: 0/5 usados
4. Botão "Sugerir" está bloqueado com tooltip
5. Vota em um pedido
6. Feedback animado: "Voto computado! 🎉"
7. Votos atualizam: 1/5
8. Botão "Sugerir" ainda bloqueado
9. Vota em mais um
10. Toast: "🔓 Sugestão desbloqueada!"
11. Botão "Sugerir" fica ativo
```

### 8.2 Criando um Pedido

```
1. Clica em "Sugerir Material"
2. Abre drawer/modal
3. Preenche: Título, Nível, Disciplina, Descrição
4. (Opcional) Adiciona imagens de referência
5. Clica "Publicar"
6. Feedback: "Pedido publicado! 📝"
7. Pedido aparece na lista
8. Autor não pode votar no próprio pedido
```

### 8.3 Final do Mês (Job Automático)

```
1. Job roda dia 1 às 00:00 (UTC-3)
2. Seleciona top 10 com 20+ votos
3. Marca como "selected"
4. Arquiva pedidos com <10 votos
5. Mantém pedidos com 10-19 votos
6. Reseta contagem de votos dos usuários
7. Envia notificação para autores selecionados
```

---

## 9. Integrações com IA (Vercel AI SDK)

### 9.1 Dependências

```bash
npm install ai @ai-sdk/openai
```

### 9.2 Casos de Uso

| Feature | Modelo | Quando usar |
|---------|--------|-------------|
| Detecção de duplicados | `text-embedding-3-small` | Ao digitar descrição |
| Sugestão de categoria | `gpt-4o-mini` | Ao preencher descrição |
| Moderação automática | `gpt-4o-mini` | Antes de publicar |
| Geração de título | `gpt-4o-mini` | Botão "Sugerir título" |
| Template de justificativa | `gpt-4o-mini` | Admin marcando inviável |

### 9.3 API de Detecção de Duplicados

```typescript
// src/app/api/v1/community/similar/route.ts
import { openai } from '@ai-sdk/openai'
import { embed } from 'ai'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const { description } = await req.json()

  // Gera embedding da descrição
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: description,
  })

  // Busca pedidos similares usando pgvector (Supabase)
  const similar = await prisma.$queryRaw`
    SELECT id, title, description, vote_count,
           1 - (embedding <=> ${embedding}::vector) as similarity
    FROM community_request
    WHERE status = 'voting'
      AND 1 - (embedding <=> ${embedding}::vector) > 0.8
    ORDER BY similarity DESC
    LIMIT 3
  `

  return Response.json({ similar })
}
```

### 9.4 Sugestão de Categoria

```typescript
// src/app/api/v1/community/suggest-category/route.ts
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

export async function POST(req: Request) {
  const { description } = await req.json()

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: z.object({
      educationLevel: z.string(),
      subject: z.string(),
      confidence: z.number().min(0).max(1),
      reasoning: z.string(),
    }),
    prompt: `Você é um especialista em educação brasileira.

    Analise este pedido de material pedagógico e sugira:
    - Nível de ensino (Educação Infantil, Fundamental Anos Iniciais, Fundamental Anos Finais, Ensino Médio)
    - Disciplina (Português, Matemática, Ciências, História, Geografia, Artes, Ed. Física, Inglês, Interdisciplinar)

    Pedido: "${description}"

    Retorne também sua confiança (0-1) na sugestão.`
  })

  return Response.json(object)
}
```

### 9.5 Moderação Automática

```typescript
// src/app/api/v1/community/moderate/route.ts
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

export async function POST(req: Request) {
  const { title, description } = await req.json()

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: z.object({
      isAppropriate: z.boolean(),
      issues: z.array(z.string()),
      suggestedAction: z.enum(['approve', 'review', 'reject']),
    }),
    prompt: `Analise se este pedido de material pedagógico é apropriado para uma plataforma educacional de professoras:

    Título: "${title}"
    Descrição: "${description}"

    Verifique:
    - É um pedido válido de material educacional?
    - Não contém spam ou propaganda?
    - Não solicita conteúdo adulto ou inapropriado?
    - Não viola direitos autorais óbvios (personagens, marcas)?

    Retorne se deve aprovar automaticamente, enviar para revisão manual, ou rejeitar.`
  })

  return Response.json(object)
}
```

### 9.6 Fluxo com IA no Wizard de Criação

```
STEP 2: DESCRIÇÃO
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Descreva o que você precisa                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Preciso de atividades coloridas sobre páscoa...         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  💡 IA identificou:                                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Sugestão: Ed. Infantil · Artes (92% confiança)         │    │
│  │  [Aceitar sugestão]  [Escolher manualmente]             │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ⚠️ Encontramos pedidos similares:                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  "Atividades de Páscoa - Ed. Infantil" (234 votos)      │    │
│  │  [Votar neste →]                                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Considerações Técnicas

### 10.1 Performance

- **Contador desnormalizado**: `voteCount` no pedido para evitar COUNT em queries
- **Índices otimizados**: Por mês + votos para ranking
- **Cache**: React Query com staleTime de 30s
- **Paginação**: 20 pedidos por página

### 9.2 Segurança

- **Rate limiting**: 10 votos/minuto (previne spam)
- **Validação server-side**: Verificar subscription ativa antes de votar
- **Sanitização**: Limpar HTML/XSS na descrição
- **Moderação**: Fila de revisão para pedidos reportados

### 9.3 Integrações

- **Cloudinary**: Upload de imagens de referência
- **Push Notifications**: Avisar quando pedido for selecionado
- **Analytics**: Rastrear engajamento por feature

---

## 11. Fases de Implementação

> **Dependências:** Ver [PRD-00: Infraestrutura](./00-INFRASTRUCTURE-DEPENDENCIES.md)

### Fase 1: MVP (Core)
- [ ] Schema Prisma + Migration
- [ ] API: Listar, Votar, Criar pedido
- [ ] UI: Página principal mobile
- [ ] UI: VoteProgress, RequestCard, VoteButton
- [ ] Lógica de votos (5/mês, não vota no próprio)
- [ ] Drawer de criação (wizard 3 steps)

### Fase 2: Admin
- [ ] Painel admin para moderar
- [ ] Marcar como inviável (com justificativa)
- [ ] Marcar como em produção
- [ ] Vincular Resource produzido
- [ ] Job de processamento mensal (Vercel Cron)

### Fase 3: Polish
- [ ] Desktop layout (sidebar stats)
- [ ] Imagens de referência (upload Cloudinary)
- [ ] Gamificação (confetti, animações, optimistic updates)
- [ ] Push notifications (pedido selecionado/produzido)
- [ ] Email quando pedido for selecionado

### Fase 4: IA (Opcional/Futuro)
> **Requer:** PRD-00 Fase IA

- [ ] Sugestão de categoria baseada na descrição
- [ ] Detecção de pedidos duplicados (embeddings)
- [ ] Moderação automática antes de publicar
- [ ] Sugestão de título

---

## 12. Métricas de Sucesso

| Métrica | Meta Mês 1 | Meta Mês 3 |
|---------|------------|------------|
| % assinantes que votam | 30% | 50% |
| Pedidos criados/mês | 50 | 100 |
| Votos/pedido (média) | 30 | 50 |
| Retenção de assinantes | +5% | +10% |

---

## 13. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Baixa participação | Média | Alto | Gamificação forte, email marketing |
| Pedidos duplicados | Alta | Baixo | Sugestão de similares ao criar |
| Pedidos inapropriados | Baixa | Médio | Moderação + report |
| Sobrecarga de produção | Média | Alto | Limitar top 10, priorizar |

---

## 14. FAQ

**P: E se um assinante cancelar no meio do mês?**
R: Votos dados permanecem. Perde direito de votar/sugerir até renovar.

**P: Pedidos podem ser editados?**
R: Não após publicação (evita gaming de votos).

**P: Como evitar pedidos duplicados?**
R: Ao criar, mostrar pedidos similares e sugerir votar neles.

**P: Autor pode deletar próprio pedido?**
R: Sim, mas perde o "crédito" de sugestão do mês.

**P: E se meu pedido for marcado como inviável?**
R: Você recebe uma notificação com a justificativa da equipe. Seu "crédito" de sugestão do mês é devolvido, então você pode criar um novo pedido ajustado.

**P: A equipe é obrigada a produzir os 10 mais votados?**
R: Não. Os 10 mais votados são **selecionados para avaliação**. A equipe analisa viabilidade técnica, direitos autorais, alinhamento pedagógico, etc. Pedidos inviáveis recebem justificativa.
