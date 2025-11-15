# PRD – Tela de Recursos (`/resources`)

## 1. Contexto e Objetivo

A tela `/resources` funciona como o catálogo principal de recursos didáticos do Kadernim. Ela deve:

- **Listar recursos** com paginação ou infinite scroll
- **Respeitar regras de acesso** (free, assinante, acessos individuais, admin)
- **Permitir busca e filtros** (texto, nível de ensino, disciplina)
- **Organizar a experiência em abas** (`Todos`, `Meus Recursos`, `Gratuitos`)

Este documento descreve o contrato de dados entre front-end e API e define a arquitetura de services que atenderá toda a lógica da tela por meio de uma única rota.

---

## 2. Arquitetura de Services no Backend

### 2.1 Objetivo da Arquitetura

Estabelecer um padrão que:

- Utilize **apenas uma rota HTTP** para entregar todos os dados necessários para a tela
- Centralize **regras de acesso, listagem, ordenação, paginação e metadados**
- Permita **testes independentes** e **reuso de lógica** em outras partes do sistema
- Elimine **rotas derivadas** ou **endpoints fragmentados**

### 2.2 Princípios

A rota HTTP deve apenas:

- Autenticar o usuário
- Validar e interpretar query params
- Delegar a services de domínio
- Retornar o payload final

Não serão criadas rotas específicas para counts, metadados, checagem de acesso ou variações de listagem. Toda a lógica será atendida pela rota única:

```http
GET /api/v1/resources/summary
```

### 2.3 Services Internos Sugeridos

A lógica de domínio será encapsulada em services como:

- `AccessService`: determina `hasAccess`
- `ResourceListService`: aplica filtros, ordenação e paginação
- `ResourceCountService`: retorna counts por aba
- `ResourceMetaService`: fornece labels, enums, dados do usuário
- `ResourceSummaryService`: orquestra os serviços acima e compõe o payload

**Estrutura de diretórios sugerida:**

- `src/server/services/accessService.ts`
- `src/server/services/resourceListService.ts`
- `src/server/services/resourceCountService.ts`
- `src/server/services/resourceMetaService.ts`
- `src/server/services/resourceSummaryService.ts`

A rota ficará em:

- `app/api/v1/resources/summary/route.ts`

### 2.4 Benefícios

- **Performance** com menos chamadas HTTP e possibilidade de cache
- **Testabilidade** através de services independentes
- **Consistência de regras** entre telas
- **Reaproveitamento da lógica** em jobs, webhooks e ferramentas internas

---

## 3. Abas e Comportamento

### 3.1 Abas Disponíveis

- **Aba Todos (`tab = "all"`)**  
  Lista todo o catálogo (recursos gratuitos e pagos), respeitando filtros e ordenação. Prioriza na ordenação os recursos aos quais o usuário possui acesso.

- **Aba Meus Recursos (`tab = "mine"`)**  
  Lista apenas recursos **não gratuitos** (`isFree = false`) aos quais o usuário tem `hasAccess` igual a `true`. Ou seja, considera:
  - Recursos pagos liberados por assinatura ativa
  - Recursos pagos com acesso individual válido
  - Para admin, todos os recursos pagos (admin tem acesso irrestrito), ainda excluindo os gratuitos desta aba.

- **Aba Gratuitos (`tab = "free"`)**  
  Lista somente itens com `isFree` igual a `true`. Esta é a única aba exclusiva dos recursos gratuitos.

### 3.2 Aba Padrão

Ao abrir `/resources`, a aba inicial é a `all`.

---

## 4. Contrato da API – `/api/v1/resources/summary`

### 4.1 Endpoint

- **Método:** `GET`
- **URL:** `/api/v1/resources/summary`

### 4.2 Query Params

| Param            | Tipo   | Obrigatório | Padrão | Descrição                                          |
|------------------|--------|------------|--------|----------------------------------------------------|
| `page`           | number | não        | 1      | Página atual (1-based)                             |
| `limit`          | number | não        | 20     | Itens por página (máx. 100)                        |
| `tab`            | string | não        | all    | `all`, `mine` ou `free`                            |
| `q`              | string | não        | -      | Busca textual no título, mínimo 2 caracteres úteis |
| `educationLevel` | string | não        | -      | Filtro por nível de ensino                         |
| `subject`        | string | não        | -      | Filtro por disciplina                              |

Validação via `ResourceFilterSchema` (Zod).

### 4.3 Retorno de Sucesso

```json
{
  "items": [
    {
      "id": "string",
      "title": "string",
      "description": "string|null",
      "thumbUrl": "string|null",
      "educationLevel": "string",
      "subject": "string",
      "isFree": true,
      "hasAccess": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "hasMore": true
  },
  "counts": {
    "all": 150,
    "mine": 14,
    "free": 32
  },
  "meta": {
    "educationLevels": [
      { "key": "infantil", "label": "Educação Infantil" },
      { "key": "fundamental_1", "label": "Fundamental 1" }
    ],
    "subjects": [
      { "key": "matematica", "label": "Matemática" },
      { "key": "ciencias", "label": "Ciências" }
    ],
    "user": {
      "role": "subscriber",
      "isAdmin": false,
      "isSubscriber": true
    }
  }
}
```

---

## 5. Regras de Negócio

### 5.1 Cálculo de `hasAccess`

Controlado exclusivamente no backend.

`hasAccess` é `true` quando:

- `isFree` é `true`
- Usuário é **assinante ativo**
- Existe **acesso individual válido** em `user_resource_access`
- Usuário tem `role` igual a `admin`

`hasAccess` é `false` quando:

- Recurso é pago e usuário **não tem assinatura**
- Não há acesso individual
- Recurso exige permissão especial e o usuário é comum

A mesma lógica deve valer para a listagem (`summary`) e para a tela de detalhe (`/resources/[id]`).

### 5.2 Ordenação

**Ordem padrão:**

1. `hasAccess = true` primeiro
2. `title` ASC
3. `id` ASC

Toda a ordenação ocorre no backend.

---

## 6. Comportamento do Front-end

### 6.1 Busca e Filtros

- Debounce de aproximadamente **450 ms** no campo de busca
- Filtros exibidos em **bottom sheet**
- Cada aba mantém filtros independentes (`filtersByTab[tab]`)
- Query `q` só é enviada com no mínimo **2 caracteres úteis**

### 6.2 Paginação e Infinite Scroll

- Implementado com `useInfiniteQuery` e `VirtuosoGrid`
- `page` e `limit` são enviados conforme avanço do scroll
- `hasMore` indica se há nova página

### 6.3 Estados de Acesso

**Quando `hasAccess` é `true`:**

- Card liberado
- Exibir badge **Gratuito** ou **Liberado**

**Quando `hasAccess` é `false`:**

- Card bloqueado com **overlay**
- CTA sugerindo **assinatura**
- Tela de detalhe também bloqueada

### 6.4 Regras por Tipo de Usuário

- **Usuário comum**  
  - Tem acesso apenas aos recursos gratuitos

- **Assinante ativo**  
  - Tem acesso a todos os recursos

- **Admin**  
  - Tem acesso irrestrito  
  - Nunca vê overlay de bloqueio

- **Usuário com acesso individual**  
  - Tem acesso aos recursos específicos mais todos os gratuitos

---

## 7. Erros e Respostas de Falha

### 401 Unauthorized

```json
{ "error": "Unauthorized" }
```

### 429 Too Many Requests

```json
{ "error": "rate_limited" }
```

### 400 Bad Request

```json
{
  "error": "Parâmetros inválidos",
  "issues": {}
}
```

### 500 Internal Server Error

```json
{ "error": "Erro ao buscar recursos" }
```

---

## 8. Pontos de Atenção

- Garantir **consistência** entre listagem e detalhe no cálculo de acesso
- Admin deve ser sempre tratado como **full access**
- Divergências de acesso devem ser logadas com `userId`, `resourceId` e resultados dos services
- Metadados podem ser **cacheados por longos períodos**
- Qualquer mudança futura nos critérios de acesso deve ocorrer **centralmente** no `AccessService`

---

## 9. Performance

- Executar listagem e counts em paralelo usando `Promise.all`
- Aplicar filtros via Prisma com **índices adequados**
- Retornar apenas **campos necessários**
- Cache de **30 a 120 segundos** por combinação de usuário e filtros
- Evitar múltiplas consultas de acesso por recurso usando **prefetch** ou **in-memory join**

---

## 10. Resumo Final

A tela `/resources` agora é servida por uma **única rota otimizada**. O backend centraliza a lógica de negócio em services especializados que garantem **performance**, **consistência** e **manutenibilidade**.

O front recebe tudo o que precisa em um **payload único** contendo:

- Listagem
- Paginação
- Counts
- Metadados
- Permissões

Resultando em uma experiência **rápida, estável e previsível**.
