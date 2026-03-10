# PRD: Integração Ativa de Assinaturas (Asaas - Pix Automático & Cartão)

## 1. Visão Geral
### Objetivo
Implementar um **Checkout Transparente** (dentro do Kadernim) utilizando a infraestrutura do Asaas. O objetivo é remover a dependência de plataformas externas de pagamento, reduzir o churn e oferecer a experiência de **Pix Automático** (recorrência nativa) e **Cartão de Crédito**.

---

## 2. Alinhamento com Guardrails (Skills)

Embora o projeto tenha raízes organizadas (`src/services`, `src/app/(client)`), esta implementação será o marco de adoção total dos **Next.js Execution Guardrails**.

### 2.1. Regras Aplicadas
- **Server-First Dashboard**: A nova página `/dashboard/billing` deve ser um **Server Component**. O estado inicial da assinatura será buscado via Service no servidor, evitando "waterfalls" de `useQuery`.
- **Zero useEffect para Fluxo de Dados**: A captura dos dados do cartão e o disparo do Pix serão feitos via **Handlers Explícitos** ou **Server Actions**. Polling de status será feito via **TanStack Query** (com `refetchInterval`).
- **Arquitetura de Domínio**:
  - `src/services/billing/`: Core da lógica de integração.
  - `src/components/dashboard/billing/`: Componentes de UI (Checkout, Gestão de Cartão).
  - `src/app/api/v1/billing/`: Endpoints técnicos.

---

## 3. O Checkout Transparente

Diferente do modelo atual, o usuário **não sai do Kadernim**.

### 3.1. Fluxo: Cartão de Crédito
1. **Coleta**: O formulário coleta os dados do cartão (número, CVV, nome, validade).
2. **Tokenização**: Os dados são enviados para o Asaas para gerar um `creditCardToken`.
   - *PCI Compliance*: Os dados sensíveis nunca tocam nosso banco de dados.
3. **Criação da Assinatura**: O token é enviado para nosso backend, que chama `/v3/subscriptions` no Asaas.
4. **Confirmação**: A resposta retorna o sucesso e o acesso é liberado via Webhook.

### 3.2. Fluxo: Pix Automático
O Pix Automático do Asaas permite que o usuário autorize o débito recorrente uma única vez.
1. **Solicitação**: O usuário escolhe Pix Automático.
2. **Geração de Autorização**: Chamamos `/v3/pix/automatic/authorizations`.
3. **Exibição**: O sistema exibe um **QR Code de Autorização**.
4. **Autorização**: O usuário escaneia no app do banco e confirma o "agendamento recorrente".
5. **Ativação**: O Asaas nos notifica via webhook (`PIX_AUTOMATIC_RECURRING_AUTHORIZATION_ACTIVATED`) e a primeira cobrança é processada.

---

## 4. Detalhamento Técnico e Estrutura

### 4.1. Camada de Dados (Prisma)
Alterar `model Subscription` em `prisma/schema.prisma`:
```prisma
model Subscription {
  // ... campos atuais
  asaasCustomerId    String?   @index
  asaasSubscriptionId String?   @unique
  paymentMethod       PaymentMethod?
  status              SubscriptionStatus @default(INACTIVE)
  cardLast4           String?   // Para exibir "Cartão final XXXX" na UI
  cardBrand           String?
  nextBillingDate     DateTime?
}

enum PaymentMethod {
  CREDIT_CARD
  PIX_AUTOMATIC
}

enum SubscriptionStatus {
  ACTIVE
  OVERDUE
  CANCELED
  INACTIVE
  AWAITING_AUTHORIZATION // Específico para Pix Automático
}
```

### 4.2. Camada de Serviço (`src/services/billing/`)
1. **asaas-client.ts**: Cliente Axios/Fetch configurado com chaves de sandbox/produção e tratamento de erros padronizado.
2. **subscription.service.ts**:
   - `startCardSubscription(userId, token)`
   - `startPixAutomatic(userId)`
3. **webhook.handler.ts**:
   - Mapeia eventos do Asaas para ações no Prisma.
   - Eventos Críticos:
     - `PAYMENT_RECEIVED`: Atualiza `expiresAt`.
     - `SUBSCRIPTION_DELETED`: Limpa o acesso.
     - `PIX_AUTOMATIC_RECURRING_AUTHORIZATION_ACTIVATED`: Ativa o fluxo de recorrência.

---

## 5. Requisitos de UI/UX (Dashboard)

- **Página de Billing**: Exibir status atual, forma de pagamento cadastrada e histórico de faturas (via leitura do Asaas em Server Component).
- **Feedback de Erro**: O Asaas retorna erros específicos (cartão recusado, saldo insuficiente). A UI deve traduzir esses erros de forma amigável para o professor (usuário final).
- **Loading States**: Uso de `loading.tsx` para a página principal e `PendingState` do TanStack para o processamento do pagamento.

---

## 6. Plano de Migração
- O endpoint antigo `/api/v1/enroll/subscriber` será mantido **apenas como legado** (Read-Only) até que todos os usuários antigos sejam migrados ou suas assinaturas expirem.
- Usuários novos entrarão obrigatoriamente pelo fluxo transparente.

---

## 7. Critérios de Aceite
- [ ] O usuário consegue assinar via Cartão sem sair do domínio `kadernim.com.br`.
- [ ] O QR Code de autorização do Pix Automático é gerado e exibido corretamente.
- [ ] Webhooks são validados com HMAC/Token de Segurança.
- [ ] Nenhuma logica de banco de dados ou integração está dentro dos arquivos em `src/app/api/`.
- [ ] A página `/dashboard/billing` carrega os dados do banco/Asaas no lado do servidor (Server-First).
