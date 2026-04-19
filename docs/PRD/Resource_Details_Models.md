# Product Requirements Document (PRD) - Mapeamento do Design System para o Prisma Schema

## 1. Visão Geral
Este PRD detalha as mudanças necessárias no modelo de banco de dados (`prisma/schema.prisma`) para suportar a nova interface de "Detalhes do Recurso" implementada seguindo o Kadernim Design System. A nova tela inclui funcionalidades ricas como metadados detalhados de duração e páginas, habilidades BNCC, passo-a-passo de aula, avaliações, sistema de salvamento e indicações de materiais relacionados.

## 2. Análise do Schema Atual vs. Novo Design

### A. O que temos mapeado atualmente na tela:
- **`Resource`**: Possui título, descrição, `educationLevel`, `subject`, e relacionamento com mídias/files.
- **Relacionadas a usuário**: Existe apenas `ResourceUserAccess` que gerencia permissões, e faturamento completo do Asaas.

### B. Elementos da nova interface (Faltantes no Schema):
1. **Autoria e Curadoria**: A interface mostra *"por Beatriz Lisboa · curadoria Kadernim"*. O `Resource` atual não possui autoria, nem um selo de verificação de curadoria.
2. **Sistema de Avaliações (Reviews)**: "O que outras professoras disseram" contendo nota (ex: 4.8), comentários, e informações extras do perfil do usuário revisor (ex: "Prof. 2º ano", localização).
3. **Seções de Conteúdo Pedagógico Estruturado**:
    - *Objetivos de aprendizagem*: Uma lista explícita de objetivos com validações.
    - *Como conduzir a aula*: Uma timeline passo-a-passo (Aquecimento, Distribuição, etc) contendo título, duração de cada passo e texto.
4. **Habilidades BNCC**: Cada recurso mostra tags das competências BNCC atendidas (ex: EF02MA17).
5. **Metadados do Recurso**:
    - Contagem de páginas ("6 páginas").
    - Tempo total da atividade ("~ 50 min").
    - Classificação do Recurso ("Atividade imprimível").
    - Total de Downloads ("1.240" - pode ser campo cacheado).
6. **Mecanismos de Ação do Usuário**:
    - Funcionalidade "Salvar" (Favoritos). 
    - Funcionalidade "Planejar" (Adicionar ao planejador ou calendário).
7. **Motor de Recomendação ("Combina com essa aula")**: Lista de recursos relacionados ligados diretamente a um material específico.

---

## 3. Especificação das Entidades e Campos a Adicionar

### 3.1. Relacionamento de Autoria e Perfil
**Modelos:**
- Adicionar o modelo (ou usar os já existentes no `User`) para definir o autor do recurso.
- Se o autor pode ser externo, podemos criar um model `Author` isolado e referenciá-lo no `Resource`.

**Campos adicionais no User/Profile:**
- `roleTitle` (String) - ex: "Prof. 2º ano".
- `location` (String) - ex: "Belo Horizonte".

### 3.2. Metadados do Recurso (`Resource`)
**Campos no Model `Resource`:**
- `authorId` -> referenciando Auth/User.
- `isCurated` (Boolean, default: false) -> Exibe badge/flag '*curadoria Kadernim*'.
- `pagesCount` (Int?) -> Para recursos em PDF.
- `estimatedDurationMinutes` (Int?) -> Duração da atividade na vida real.
- `downloadsCount` (Int, default: 0) -> Cache para total de downs.
- `resourceType` (Enum: `PRINTABLE_ACTIVITY`, `LESSON_PLAN`, `GAME`, `ASSESSMENT`) -> Referente à tag nas recomendações.

### 3.3. Objetivos de Aprendizagem (`ResourceObjective`)
**Model `ResourceObjective`**:
- `id` (Uuid)
- `resourceId` (FK)
- `text` (String) -> ex: "Reconhecer representações pictóricas..."
- `order` (Int)

### 3.4. Passo-a-passo de Aula (`ResourceStep`)
**Model `ResourceStep`**:
- `id` (Uuid)
- `resourceId` (FK)
- `title` (String)
- `durationString` (String?) -> ex: "10 min"
- `content` (Text/String)
- `order` (Int)

### 3.5. Habilidades BNCC (`BnccSkill`)
**Model `BnccSkill`**:
- `id` (Uuid)
- `code` (String, unique) -> ex: "EF02MA17"
- `description` (String)
**Mapeamento `ResourceBnccSkill`**: Tabela de relação n:n entre `Resource` e `BnccSkill`.

### 3.6. Sistema de Review e Avaliações (`Review`)
**Model `Review`**:
- `id` (Uuid)
- `resourceId` (FK)
- `userId` (FK)
- `rating` (Int 1-5)
- `comment` (String?)
- `createdAt` / `updatedAt`

*(O card de recurso deverá também ter `averageRating` (Float) e `reviewsCount` (Int) em cache para facilitar leituras rápidas, já prevendo alta volumetria).*

### 3.7. Interação de Usuário: Favoritos e Planejamento
**Model `UserSavedResource`** (Salvar/Favoritos):
- `id`
- `userId` (FK)
- `resourceId` (FK)
- `createdAt`

**Model `PlannerItem`** (Planejar):
- `id`
- `userId` (FK)
- `resourceId` (FK)
- `plannedForDate` (DateTime) -> Para visualização no "Planejador".
- `createdAt`

### 3.8. Recursos Relacionados (Self-Relation)
**Mapeamento N:N `RelatedResource`**:
Uma tabela de junção contendo o recurso principal mapeado ao recurso recomendado. Ou utilizar arrays de referências próprias se o uso da recomendação não for bidirecional estrita.

---

## 3. Status da Implementação e Próximos Passos

### ✅ 3.1. Habilidades BNCC (Restaurado)
A estrutura de BNCC foi restaurada do histórico do Git e já está presente no `schema.prisma`.
- **Modelos**: `BnccSkill` e `ResourceBnccSkill`.
- **Dados**: Scripts de semente em `prisma/seeds/seed-bncc-fundamental.ts` e `prisma/seeds/seed-bncc-infantil.ts` prontos para ler arquivos TSV e popular o banco.
- **Relacionamentos**: Recursos já podem ser vinculados a múltiplas habilidades.

### ⏳ 3.2. Metadados e Estrutura Pedagógica (Pendente no Schema)
Precisamos adicionar os seguintes campos ao modelo `Resource` e criar as tabelas de apoio:

**No Model `Resource`:**
- `isCurated` (Boolean)
- `pagesCount` (Int?)
- `estimatedDurationMinutes` (Int?)
- `downloadsCount` (Int) - Cache
- `averageRating` (Float) - Cache
- `reviewsCount` (Int) - Cache

**Novos Modelos:**
- `ResourceObjective`: Lista de strings ordenadas.
- `ResourceStep`: Timeline da aula (passo-a-passo).
- `Review`: Sistema de notas e comentários.
- `UserSavedResource` & `PlannerItem`: Persistência de ações do usuário.

---

## 4. Plano de Ação Imediato

1. **Expansão do Schema**: Aplicar os campos pendentes (Metadados, Objetivos, Steps e Reviews) no `schema.prisma`.
2. **Migration & Generate**: Rodar `prisma migrate dev` para atualizar o banco e o cliente Prisma.
3. **Data Seeding**: Atualizar os mocks de `seed-resources.ts` para incluir dados reais de objetivos e steps, permitindo testar a UI.
4. **Backend Wiring (tRPC/API)**:
    - Atualizar a rota de `fetchResourceDetail` para incluir (pelo menos facultativamente) os relacionamentos de `objectives`, `steps`, `bnccSkills` e `reviews`.
    - Implementar a lógica de "Salvar" e "Planejar".
5. **UI Update**: Substituir os dados estáticos dos componentes em `src/components/design-system/resources/` pelos dados vindos do objeto `resource` retornado pela API.
