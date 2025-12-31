# PRD: Gerenciamento de Recursos (Admin)

**Data:** 2025-12-29
**Versão:** 1.0
**Status:** Em Desenvolvimento

---

## 1. Visão Geral

Sistema administrativo para **criar, editar, deletar e gerenciar recursos educacionais** no Kadernim.

**Escopo:**
- Operações CRUD completas em recursos
- Gerenciar arquivos (upload, delete, reordenar)
- Operações em lote
- Filtros e buscas avançadas
- Auditoria de ações

**Acesso:** Apenas usuários com role `admin` e permissão `manage:resources`

---

## 2. Objetivos

1. **Simplificar gestão de conteúdo** - Interface amigável para adicionar/editar recursos
2. **Escalabilidade** - Suportar upload de arquivos em lote
3. **Auditoria** - Rastrear quem criou/modificou recursos
4. **Integridade** - Validar dados antes de salvar
5. **Performance** - Carregar apenas dados necessários

---

## 3. Arquitetura de Dados

### Modelo Resource (Existente - Sem Mudanças)
```typescript
model Resource {
  id              String             @id @default(cuid())
  title           String             // Título do recurso
  description     String?            // Descrição completa
  thumbUrl        String?            // URL da thumbnail
  educationLevel  EducationLevel     // Ensino Infantil, Fundamental I/II, Médio
  subject         Subject            // Português, Matemática, etc
  externalId      Int             @unique  // ID no sistema externo (Yampi, etc)
  isFree          Boolean         @default(false)  // Se é gratuito
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  files           ResourceFile[]     // Arquivos associados
  accessEntries   UserResourceAccess[]  // Quem tem acesso
}

model ResourceFile {
  id          String       @id @default(cuid())
  name        String       // Nome original do arquivo
  url         String       // URL do arquivo (S3, Supabase)
  resourceId  String       // FK para Resource
  resource    Resource     @relation(fields: [resourceId], references: [id], onDelete: Cascade)
  createdAt   DateTime     @default(now())
}
```


---

## 4. Rotas API (Backend)

### Base: `/api/v1/admin/resources`

#### 4.1 Listar Recursos
```
GET /api/v1/admin/resources

Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20, max: 100)
  - q: string (busca por título/descrição)
  - educationLevel: EducationLevel (filtrar por nível)
  - subject: Subject (filtrar por matéria)
  - isFree: boolean (filtrar por tipo)
  - sortBy: 'title' | 'createdAt' | 'updatedAt' (default: 'updatedAt')
  - order: 'asc' | 'desc' (default: 'desc')

Response (200 OK):
{
  "data": [
    {
      "id": "cuid",
      "title": "Tabuada de Multiplicação",
      "description": "Material para ensinar tabuada",
      "educationLevel": "ELEMENTARY_SCHOOL_I",
      "subject": "MATHEMATICS",
      "externalId": 12345,
      "isFree": false,
      "thumbUrl": "https://...",
      "fileCount": 3,
      "accessCount": 245,
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-20T14:45:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 152,
    "totalPages": 8,
    "hasMore": true
  }
}

Errors:
  - 401 Unauthorized (sem sessão)
  - 403 Forbidden (role não é admin)
  - 429 Rate Limited
```

#### 4.2 Obter Recurso em Detalhes
```
GET /api/v1/admin/resources/:id

Response (200 OK):
{
  "id": "cuid",
  "title": "Tabuada de Multiplicação",
  "description": "Material completo para ensinar tabuada...",
  "educationLevel": "ELEMENTARY_SCHOOL_I",
  "subject": "MATHEMATICS",
  "externalId": 12345,
  "isFree": false,
  "thumbUrl": "https://...",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-20T14:45:00Z",
  "files": [
    {
      "id": "file_id_1",
      "name": "tabuada-completa.pdf",
      "url": "https://...",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "stats": {
    "totalUsers": 245,
    "accessGrants": 10,  // Concessões individuais
    "subscriberAccess": 235
  }
}

Errors:
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found
```

#### 4.3 Criar Recurso
```
POST /api/v1/admin/resources

Headers:
  - Content-Type: application/json

Body:
{
  "title": "Tabuada de Multiplicação",
  "description": "Material completo para ensinar tabuada...",
  "educationLevel": "ELEMENTARY_SCHOOL_I",  // Obrigatório
  "subject": "MATHEMATICS",                 // Obrigatório
  "externalId": 12345,                      // Obrigatório (unique)
  "isFree": false,                          // Obrigatório
  "thumbUrl": "https://..."                 // Opcional
}

Response (201 Created):
{
  "id": "new_resource_id",
  "title": "Tabuada de Multiplicação",
  ... // mesmo objeto de GET detalhes
}

Validation Errors (400 Bad Request):
{
  "error": "Validation failed",
  "issues": {
    "title": ["Campo obrigatório"],
    "externalId": ["Já existe um recurso com este externalId"]
  }
}

Errors:
  - 401 Unauthorized
  - 403 Forbidden
  - 409 Conflict (externalId duplicado)
```

#### 4.4 Editar Recurso
```
PUT /api/v1/admin/resources/:id

Headers:
  - Content-Type: application/json

Body: (todos os campos são opcionais)
{
  "title": "Novo Título",
  "description": "Nova descrição",
  "educationLevel": "ELEMENTARY_SCHOOL_II",
  "subject": "PORTUGUESE",
  "isFree": true,
  "thumbUrl": "https://nova-url.com/thumb.jpg"
}

Response (200 OK):
{
  "id": "resource_id",
  ... // objeto atualizado
}

Errors:
  - 400 Bad Request (validação)
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found
  - 409 Conflict (externalId duplicado)
```

#### 4.5 Deletar Recurso
```
DELETE /api/v1/admin/resources/:id

Response (204 No Content): (sem body)

Errors:
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found
```

#### 4.6 Gerenciar Arquivos do Recurso
```
POST /api/v1/admin/resources/:id/files
PUT /api/v1/admin/resources/:id/files/:fileId
DELETE /api/v1/admin/resources/:id/files/:fileId
```
(Documentação separada - Ver 4.7)

#### 4.7 Upload de Arquivo
```
POST /api/v1/admin/resources/:id/files

Headers:
  - Content-Type: multipart/form-data

Body:
  - file: File (binary)

Response (201 Created):
{
  "id": "file_id",
  "name": "tabuada-completa.pdf",
  "url": "https://..."
  "createdAt": "2025-01-15T10:30:00Z"
}

Errors:
  - 400 Bad Request (arquivo muito grande, tipo inválido)
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found
```

#### 4.8 Deletar Arquivo
```
DELETE /api/v1/admin/resources/:id/files/:fileId

Response (204 No Content)

Errors:
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found
```

#### 4.9 Operações em Lote (Bulk)
```
POST /api/v1/admin/resources/bulk/update

Body:
{
  "ids": ["resource_id_1", "resource_id_2"],
  "updates": {
    "isFree": true,
    "educationLevel": "HIGH_SCHOOL"
  }
}

Response (200 OK):
{
  "updated": 2,
  "failed": 0,
  "errors": []
}

Errors:
  - 400 Bad Request (validação)
  - 401 Unauthorized
  - 403 Forbidden
```

#### 4.10 Deletar em Lote
```
POST /api/v1/admin/resources/bulk/delete

Body:
{
  "ids": ["resource_id_1", "resource_id_2"]
}

Response (200 OK):
{
  "deleted": 2,
  "failed": 0,
  "errors": []
}
```

---

## 5. Services (Backend - `src/services/resources/`)

### 5.1 `createResourceService.ts`
```typescript
interface CreateResourceInput {
  title: string
  description?: string
  educationLevel: EducationLevel
  subject: Subject
  externalId: number
  isFree: boolean
  thumbUrl?: string
  adminId: string
}

async function createResource(input: CreateResourceInput): Promise<Resource>
  - Valida entrada
  - Checa se externalId já existe
  - Cria recurso
  - Invalida cache
  - Retorna recurso criado
```

### 5.2 `updateResourceService.ts`
```typescript
interface UpdateResourceInput {
  id: string
  title?: string
  description?: string
  educationLevel?: EducationLevel
  subject?: Subject
  isFree?: boolean
  thumbUrl?: string
  adminId: string
}

async function updateResource(input: UpdateResourceInput): Promise<Resource>
  - Valida entrada
  - Checa se recurso existe
  - Atualiza recurso
  - Invalida cache
  - Retorna recurso atualizado
```

### 5.3 `deleteResourceService.ts`
```typescript
async function deleteResource(id: string, adminId: string): Promise<void>
  - Checa se recurso existe
  - Apaga todos os arquivos associados
  - Apaga todos os UserResourceAccess
  - Apaga o recurso
  - Invalida cache
```

### 5.4 `fileService.ts`
```typescript
interface FileUploadInput {
  file: File
  resourceId: string
  adminId: string
}

async function uploadFile(input: FileUploadInput): Promise<ResourceFile>
  - Valida tipo de arquivo (whitelist)
  - Valida tamanho (max 50MB)
  - Faz upload para Supabase/S3
  - Salva referência no banco
  - Retorna ResourceFile

async function deleteFile(fileId: string, adminId: string): Promise<void>
  - Checa se arquivo existe
  - Deleta do storage (Supabase/S3)
  - Apaga registro do banco
```

### 5.5 `bulkOperationsService.ts`
```typescript
interface BulkUpdateInput {
  ids: string[]
  updates: Partial<UpdateResourceInput>
  adminId: string
}

async function bulkUpdateResources(input: BulkUpdateInput): Promise<BulkOperationResult>
  - Valida IDs (max 100 por operação)
  - Loop através de cada recurso
  - Chama updateResourceService
  - Coleta sucessos e erros
  - Retorna resumo

async function bulkDeleteResources(ids: string[], adminId: string): Promise<BulkOperationResult>
  - Valida IDs (max 100 por operação)
  - Loop através de cada recurso
  - Chama deleteResourceService
  - Coleta sucessos e erros
  - Retorna resumo
```

### 5.6 `listResourcesService.ts`
```typescript
interface ListResourcesFilters {
  page?: number
  limit?: number
  q?: string
  educationLevel?: EducationLevel
  subject?: Subject
  isFree?: boolean
  sortBy?: 'title' | 'createdAt' | 'updatedAt'
  order?: 'asc' | 'desc'
}

async function listResources(filters: ListResourcesFilters): Promise<ListResult>
  - Valida filtros
  - Constrói query Prisma
  - Aplica paginação
  - Retorna dados com metadata
```

---

## 6. Validações (Zod Schemas - `src/lib/schemas/`)

### 6.1 `createResourceSchema`
```typescript
z.object({
  title: z.string().min(3).max(255),
  description: z.string().max(5000).optional(),
  educationLevel: z.enum(EDUCATION_LEVELS),
  subject: z.enum(SUBJECTS),
  externalId: z.number().int().positive(),
  isFree: z.boolean(),
  thumbUrl: z.string().url().optional()
})
```

### 6.2 `updateResourceSchema`
```typescript
z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().max(5000).optional(),
  educationLevel: z.enum(EDUCATION_LEVELS).optional(),
  subject: z.enum(SUBJECTS).optional(),
  isFree: z.boolean().optional(),
  thumbUrl: z.string().url().optional()
})
```

### 6.3 `listResourcesFilterSchema`
```typescript
z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  q: z.string().max(100).optional(),
  educationLevel: z.enum(EDUCATION_LEVELS).optional(),
  subject: z.enum(SUBJECTS).optional(),
  isFree: z.boolean().optional(),
  sortBy: z.enum(['title', 'createdAt', 'updatedAt']).default('updatedAt'),
  order: z.enum(['asc', 'desc']).default('desc')
})
```

### 6.4 `bulkUpdateSchema`
```typescript
z.object({
  ids: z.array(z.string().cuid()).min(1).max(100),
  updates: z.object({
    title: z.string().min(3).max(255).optional(),
    educationLevel: z.enum(EDUCATION_LEVELS).optional(),
    subject: z.enum(SUBJECTS).optional(),
    isFree: z.boolean().optional(),
    thumbUrl: z.string().url().optional()
  })
})
```

---

## 7. Rate Limiting

- **GET /api/v1/admin/resources** - 60 req/min por admin
- **GET /api/v1/admin/resources/:id** - 60 req/min por admin
- **POST /api/v1/admin/resources** - 10 req/min por admin
- **PUT /api/v1/admin/resources/:id** - 30 req/min por admin
- **DELETE /api/v1/admin/resources/:id** - 10 req/min por admin
- **POST /api/v1/admin/resources/bulk/** - 5 req/min por admin
- **POST /api/v1/admin/resources/:id/files** - 20 req/min por admin

---

## 8. Cache Invalidation

Após qualquer operação de escrita (POST, PUT, DELETE):
- Invalidar tag: `admin:resources`
- Invalidar tag: `resources:*` (todas as queries de usuários)

```typescript
revalidateTag('admin:resources')
revalidateTag('resources') // Para limpar cache público também
```

---

## 9. Segurança

- ✅ Requerer role `admin`
- ✅ Requerer permission `manage:resources`
- ✅ Validar entrada com Zod
- ✅ Rate limiting por admin
- ✅ Validar tipos de arquivo (upload)
- ✅ Limitar tamanho de arquivo (50MB max)
- ✅ Sanitizar dados antes de salvar
- ✅ Usar Prisma (SQL injection prevention)

---

## 10. Próximas Fases (Fora do Escopo)

- [ ] Interface admin (UI) - Próximo PRD
- [ ] Gerenciamento de usuários admin
- [ ] Gerenciamento de subscrições
- [ ] Dashboard com estatísticas
- [ ] Relatórios
- [ ] Export de dados

---

## 11. Dependências

- Prisma (já existe)
- Zod (já existe)
- Better-Auth (já existe)
- Supabase/S3 para storage (configurar)

---

## 12. Estimativa

- [ ] Helper de proteção de rotas: 1-2h
- [ ] Schemas Zod: 1h
- [ ] Services (CRUD): 3-4h
- [ ] Rotas API: 3-4h
- [ ] Testes: 2-3h
- [ ] Total: ~11-14h

---

## 13. Approval

**Pronto para implementação?** ☐ Sim ☐ Não ☐ Com mudanças

Comentários:
