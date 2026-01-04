# PRD - Engine de Automação e Eventos (Kadernim Automation)

## 1. Visão Geral
O Kadernim Automation é um sistema de **Arquitetura Orientada a Eventos (EDA)** projetado para desacoplar a lógica de negócio das ações disparadas por ela. Em vez de codificar "enviar e-mail" dentro de cada função, o sistema emite eventos que são capturados por uma engine centralizadora, permitindo que administradores configurem fluxos de trabalho (workflows) através de um painel, sem tocar no código.

### Objetivos:
- **Desacoplamento Técnico**: Separar a ação (Trigger) da reação (Action).
- **Flexibilidade de Negócio**: Permitir que a equipe mude templates de e-mail ou canais de notificação via painel.
- **Resiliência**: Garantir que se um serviço externo (e-mail, webhook) cair, a ação seja re-tentada automaticamente.
- **Auditoria**: Ter um log centralizado de tudo o que aconteceu no sistema.

---

## 2. Conceitos Core

### 2.1 Gatilhos (Triggers / Events)
Pontos de entrada emitidos pelo sistema. Exemplos:
- `community.request.created`
- `community.request.unfeasible`
- `community.month_end.processed`
- `resource.published`
- `user.subscription.trial_ending`

### 2.2 Ações (Actions / Handlers)
Reações que podem ser executadas quando um gatilho é disparado:
- `EMAIL_SEND`: Envia um e-mail usando um provedor (Resend, SendGrid).
- `PUSH_NOTIFICATION`: Envia notificação via web/mobile.
- `WEBHOOK_CALL`: Envia um POST JSON para uma URL externa.
- `SLACK_LOG`: Envia uma mensagem para um canal da equipe.
- `DB_UPDATE`: Altera outro registro no banco de dados.

- *Exemplo*: "QUANDO `community.request.unfeasible` OCORRER, ENVIE `EMAIL_SEND` com o template 'X' E `PUSH_NOTIFICATION`".

---

## 3. Gestão de Templates e Variáveis

Para que o sistema seja flexível, as mensagens não ficam no código.

### 3.1 Modelagem de Templates
Os templates são polimórficos e suportam variáveis no formato Handlebars (`{{variable}}`).
1. **Templates de E-mail**: Suportam Subject (Assunto) e Body (HTML/Markdown).
2. **Templates de WhatsApp**: Focados em texto puro com suporte a variáveis.
3. **Webhooks**: Configuração de URL, Headers e mapeamento de campos (Payload Mapping).

### 3.2 Injeção de Dados (Hydration)
Cada Gatilho define um **Data Schema**. Ao configurar uma automação, o Admin vê apenas as variáveis disponíveis para aquele gatilho específico.
- *Evento `user.created`*: Variáveis `{{user.name}}`, `{{user.email}}`.
- *Evento `request.voted`*: Variáveis `{{request.title}}`, `{{voter.name}}`, `{{current_votes}}`.

---

## 4. Implementação Técnica das Actions (Handlers)

Cada tipo de ação possui um `Handler` dedicado seguindo uma interface padrão:

```typescript
interface ActionHandler {
  type: string;
  execute(config: ActionConfig, payload: any): Promise<void>;
}
```

- **Resiliência (Retries)**: Se o Handler de E-mail falhar, a Engine deve usar uma estratégia de *Exponential Backoff* (tentar em 1min, 5min, 30min).
- **Rate Limiting**: O Handler de WhatsApp deve respeitar limites de disparos por minuto para evitar bloqueios de conta/API.
- **Webhook Mapping**: Interface para mapear chaves do payload do gatilho para chaves customizadas no JSON de saída do Webhook.

---

## 5. Arquitetura Proposta

### Camada 1: Event Dispatcher (O Grito)
Uma função simples `emitEvent(name, payload)` espalhada pelo código. Ela apenas registra o evento.

### Camada 2: Event Bus & Queue (O Mensageiro)
Uso de **BullMQ (Redis)** ou **Inngest** para garantir processamento assíncrono. O disparo do e-mail não pode atrasar o carregamento da página do usuário.

### Camada 3: Workflow Engine (O Cérebro)
Lê as regras salvas no banco de dados (`AutomationRule`) e despacha as tarefas para os `Handlers` correspondentes.

---

## 4. Modelo de Dados (Prisma)

```prisma
// Definição da Automação
model AutomationRule {
  id          String   @id @default(cuid())
  name        String   // Ex: "Notificar Rejeição de Pedido"
  eventType   String   // Ex: "community.request.unfeasible"
  isActive    Boolean  @default(true)
  
  // Condições (opcional - JSON para flexibilidade)
  // Ex: { "voteCount": { "gte": 10 } }
  conditions  Json?    

  actions     AutomationAction[]
  logs        AutomationLog[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("automation_rule")
}

// Ações vinculadas à regra
model AutomationAction {
  id              String         @id @default(cuid())
  ruleId          String
  rule            AutomationRule @relation(fields: [ruleId], references: [id], onDelete: Cascade)
  
  type            String         // Ex: "EMAIL_SEND", "WEBHOOK"
  
  // Configurações específicas da ação
  // Ex: { "templateId": "rejection-v1", "subject": "Atualização do seu pedido" }
  config          Json           

  @@map("automation_action")
}

// Log de execução para auditoria e debug
model AutomationLog {
  id          String         @id @default(cuid())
  ruleId      String
  rule        AutomationRule @relation(fields: [ruleId], references: [id])
  
  status      String         // "success", "failed", "retrying"
  payload     Json           // Os dados que dispararam o evento
  error       String?        // Mensagem de erro se falhar
  
  executedAt  DateTime       @default(now())

  @@map("automation_log")
}
```

---

## 5. Casos de Uso Iniciais (MVP)

### Fluxo A: Deleção Mensal por Baixo Apoio
1. **Trigger**: `community.cleanup.deleted`
2. **Payload**: `{ userEmail: "...", userName: "...", requestTitle: "..." }`
3. **Regra de Automação**:
   - Ação: `EMAIL_SEND` (Template: `request-deleted-no-support`)

### Fluxo B: Inviabilidade de Pedido
1. **Trigger**: `community.request.unfeasible`
2. **Payload**: `{ userEmail: "...", reason: "...", requestTitle: "..." }`
3. **Regra de Automação**:
   - Ação 1: `EMAIL_SEND` (Template: `request-unfeasible`)
   - Ação 2: `PUSH_NOTIFICATION` (Mensagem: "Seu pedido foi avaliado")

---

## 6. Painel de Gestão (Admin)

### 6.1 Lista de Automações
Visualização de todas as regras ativas, com toggle de On/Off e estatísticas de sucesso/falha nas últimas 24h.

### 6.2 Editor de Automação
Interface visual para:
1. Selecionar o evento (dropdown com eventos pré-definidos).
2. Adicionar filtros e condições.
3. Empilhar ações (ex: Primeiro loga no Slack, depois envia e-mail).

### 6.3 Central de Templates (Email/WhatsApp)
1. Editor com preview em tempo real.
2. Painel lateral com "Dicionário de Variáveis" baseadas no contexto.

### 6.4 Webhook Control
1. Cadastro de URLs e Secrets.
2. Log de entregas (Response codes, Latência, Retentativas).

---

## 7. Próximos Passos Técnicos

1. **Definição do Queue Manager**: Escolher entre BullMQ (Self-hosted Redis) ou Inngest (Moderno/Managed). 
   - *Recomendação*: **Inngest** pela facilidade de debug visual de workflows.
2. **Definição do Engine de Templates**: Uso de `handlebars` para preenchimento de variáveis.
2. **Implementação do Bridge**: Criar o helper `events.emit()` que abstrai a fila.
3. **Criação dos Handlers Core**: E-mail e Log.
4. **Migração do Prisma**: Criar as tabelas de automação.

---

## 8. Glossário de Eventos Iniciais
- `user.signup`
- `subscription.created`
- `community.request.created`
- `community.request.voted`
- `community.request.selected`
- `community.request.completed`
- `community.request.unfeasible`
- `resource.published`
