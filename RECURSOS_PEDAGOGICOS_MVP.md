# Design MVP - Recursos Pedagógicos KADERNIN

## Visão Geral
Este documento apresenta o design simplificado para o MVP da plataforma de recursos pedagógicos KADERNIN, focando apenas nos elementos essenciais para o lançamento inicial.

## 🎨 Elementos Essenciais

### Estrutura Básica
```
┌─────────────────────────────────────────┐
│  🔍 Busca                                   │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ [Tabs Deslizantes]                           │
│ Infantil | Fundamental I | Fundamental II     │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 📚 Disciplina ▼                           │
└─────────────────────────────────────────┘
┌─────────────────────┐  ┌─────────────────────┐
│  📦 CARD 1          │  │  📦 CARD 2          │
│  [Imagem]           │  │  [Imagem]           │
│  Título             │  │  Título             │
│  [Tag: Premium]      │  │  [Tag: Gratuito]    │
└─────────────────────┘  └─────────────────────┘
```

---

## 🎯 Sistema de Categorização Simplificado

### 1. Tabs Principais (Nível de Ensino)

| Tab | Descrição |
|-----|-----------|
| **Infantil** | Recursos para Educação Infantil (0-5 anos) |
| **Fundamental I** | Recursos para Ensino Fundamental I (6-10 anos) |
| **Fundamental II** | Recursos para Ensino Fundamental II (11-14 anos) |

### 2. Filtros por Disciplina
- Língua Portuguesa
- Matemática
- Ciências
- História
- Geografia
- Artes
- Educação Física
- Inglês

---

## 🃏 Design dos Cards

### Card - Recurso (Padrão)
```
┌─────────────────────────────┐
│                             │
│         [Imagem]            │
│                             │
├─────────────────────────────┤
│ Título do Recurso           │
│ Disciplina | Faixa Etária   │
│ [Tag: Gratuito] (opcional)  │
└─────────────────────────────┘
```

### Card - Recurso Premium
```
┌─────────────────────────────┐
│                             │
│         [Imagem]            │
│         🔒                  │
│                             │
├─────────────────────────────┤
│ Título do Recurso           │
│ Disciplina | Faixa Etária   │
│ [Premium]                   │
└─────────────────────────────┘
```

---

## 📱 Telas Principais

### 1. Tela Principal
- Barra de busca no topo
- Tabs deslizantes para alternar entre níveis de ensino (Infantil, Fundamental I, Fundamental II)
- Lista suspensa para filtrar por disciplina
- Grid de cards dos recursos (misturando gratuitos e premium)
- Indicação visual para diferenciar recursos gratuitos e premium
- Banner/botão para assinatura premium (R$ 147,00)

### 2. Tela de Detalhes do Recurso
- Imagem em destaque
- Título e descrição
- Informações: Disciplina, Faixa Etária
- Botão para download/acesso (se disponível)
- Botão para assinar premium (se for recurso premium)

---

## 🔄 Modelo de Dados Simplificado

### Schema Prisma

```prisma
// Educational Resource model
model Resource {
  id          String      @id @default(cuid())
  title       String
  description String      @db.Text
  imageUrl    String
  featured    Boolean     @default(false)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  isFree      Boolean     @default(false)
  externalId  String?     @unique  // SKU da Yampi
  externalProductId String? // ID do produto na Yampi
  
  // Relationships
  subjectId   String
  subject     Subject     @relation(fields: [subjectId], references: [id])
  
  educationLevelId String
  educationLevel   EducationLevel @relation(fields: [educationLevelId], references: [id])
  
  files       ResourceFile[]
  accesses    UserResourceAccess[]
  
  @@index([subjectId])
  @@index([educationLevelId])
  @@index([isFree])
}

// Resource files (multiple files per resource)
model ResourceFile {
  id          String    @id @default(cuid())
  fileName    String
  fileType    String
  // For Google Drive links initially
  externalUrl String?
  // For future S3/Supabase storage
  storageKey  String?
  createdAt   DateTime  @default(now())
  
  // Relationship
  resourceId  String
  resource    Resource  @relation(fields: [resourceId], references: [id], onDelete: Cascade)
  
  @@index([resourceId])
}

// Subject model (customizable)
model Subject {
  id          String     @id @default(cuid())
  name        String     @unique
  slug        String     @unique
  iconName    String?    // For UI display
  resources   Resource[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

// Education Level model (customizable)
model EducationLevel {
  id          String     @id @default(cuid())
  name        String     @unique
  slug        String     @unique
  sortOrder   Int        @default(0) // For ordering in UI
  ageRange    String?    // e.g., "0-5 years"
  resources   Resource[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

// User access to resources
model UserResourceAccess {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  resourceId  String
  resource    Resource  @relation(fields: [resourceId], references: [id])
  grantedAt   DateTime  @default(now())
  metadata    Json?     // Dados da transação (orderId, transactionId, etc)
  
  @@unique([userId, resourceId])
  @@index([userId])
  @@index([resourceId])
}

// Premium subscription
model Subscription {
  id          String    @id @default(cuid())
  userId      String    @unique
  user        User      @relation(fields: [userId], references: [id])
  isActive    Boolean   @default(true)
  purchaseDate DateTime  @default(now())
  // Lifetime access, no expiration date needed
  transactionId String?  // For payment reference
}

// Add to existing User model
model User {
  // ... existing fields
  resourceAccess   UserResourceAccess[]
  subscription     Subscription?
  temporaryPassword String?   // Senha temporária para primeiro acesso
  phone       String?    // Número de telefone para WhatsApp
  cpf         String?    // CPF do usuário (recebido da Yampi)
}
```

### Seed Data para Níveis de Ensino

```typescript
// Initial education levels
const educationLevels = [
  {
    name: "Educação Infantil",
    slug: "educacao-infantil",
    sortOrder: 1,
    ageRange: "0-5 anos"
  },
  {
    name: "Ensino Fundamental I",
    slug: "fundamental-i",
    sortOrder: 2,
    ageRange: "6-10 anos"
  },
  {
    name: "Ensino Fundamental II",
    slug: "fundamental-ii",
    sortOrder: 3,
    ageRange: "11-14 anos"
  }
];

// Initial subjects
const subjects = [
  { name: "Língua Portuguesa", slug: "portugues", iconName: "book" },
  { name: "Matemática", slug: "matematica", iconName: "calculator" },
  { name: "Ciências", slug: "ciencias", iconName: "flask" },
  { name: "História", slug: "historia", iconName: "landmark" },
  { name: "Geografia", slug: "geografia", iconName: "globe" },
  { name: "Artes", slug: "artes", iconName: "palette" },
  { name: "Educação Física", slug: "educacao-fisica", iconName: "running" },
  { name: "Inglês", slug: "ingles", iconName: "message-square" }
];
```

---

## 🛠️ Funcionalidades Essenciais

1. Visualizar todos os recursos (gratuitos e premium) em uma única lista
2. Alternar entre níveis de ensino usando tabs deslizantes
3. Filtrar por disciplina usando lista suspensa
4. Buscar recursos por texto
5. Acessar/baixar recursos gratuitos
6. Visualizar detalhes dos recursos premium
7. Assinar plano premium (R$ 147,00) para desbloquear todos os recursos

---

## 🔗 Integração com Yampi

### Fluxo de Integração

1. **Compra na Yampi**
   - Usuário compra um recurso específico na plataforma Yampi
   - Yampi processa o pagamento e confirma a compra

2. **Webhook da Yampi**
   - Yampi envia um webhook para nossa aplicação com os dados da compra
   - Evento `order.paid` é recebido com informações do cliente e produtos

3. **Processamento do Webhook**
   - Verificar se o cliente já existe no sistema
   - Se não existir, criar novo usuário com os dados recebidos
   - Gerar senha temporária para primeiro acesso

4. **Liberação de Acesso**
   - Identificar o recurso comprado pelo SKU
   - Criar registro de acesso para o usuário ao recurso específico
   - Armazenar dados da transação para referência

5. **Notificação ao Cliente**
   - Enviar mensagem via WhatsApp com as instruções de acesso
   - Incluir link para o app e senha temporária (se for novo usuário)

### Exemplo de Webhook da Yampi

O webhook recebido da Yampi contém informações como:

- Dados do cliente (nome, email, telefone, CPF)
- Produtos comprados (SKU, título, preço)
- Informações da transação (ID, status, valor)

### Segurança

- Validar token do merchant para autenticar webhooks
- Armazenar senhas temporárias de forma segura
- Implementar verificação de acesso aos recursos

---

## 🎭 Identidade Visual

Seguir o manual de identidade visual KADERNIN já implementado, com:
- Paleta de cores KADERNIN
- Tipografia Inter/Poppins para títulos e Open Sans/Nunito Sans para textos
- Componentes com border-radius de 12px (0.75rem)
- Ícones com traço de 1.5px e cantos arredondados de 2px
