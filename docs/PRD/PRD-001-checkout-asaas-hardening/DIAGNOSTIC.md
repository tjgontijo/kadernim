# Diagnóstico

## Resumo executivo

O checkout próprio está funcional, mas ainda mistura estados críticos e processa dados sensíveis dentro do app. O principal risco de segurança é que número de cartão e CVV trafegam pelo browser e backend do Kadernim. O principal bug de produto é que o fluxo de cartão redireciona para sucesso mesmo quando a resposta do backend não confirma pagamento. O webhook já existe e é a fonte correta da verdade, mas o front precisa respeitar melhor os estados intermediários.

O fluxo PIX está mais robusto, porque exibe QR Code e só chama sucesso quando o status vira `RECEIVED`, `CONFIRMED` ou `ACTIVE`. O cartão precisa receber tratamento equivalente para status pago, pendente, análise e falha.

## Problemas críticos

### P0 - Cartão cru e CVV trafegam pelo app

Local:

- `src/components/dashboard/billing/checkout-form.tsx`
- `src/app/api/v1/billing/checkout/route.ts`
- `src/app/api/v1/billing/checkout-guest/route.ts`
- `src/lib/billing/services/payment.service.ts`

Comportamento atual:

O front coleta `number`, `expiryMonth`, `expiryYear` e `ccv` e envia esses dados para APIs internas. O backend repassa os dados ao Asaas.

Risco:

- Aumenta o escopo PCI do app.
- Qualquer log, exception tracker, session replay, tag manager ou proxy mal configurado pode capturar dado de cartão.
- CVV/CCV é dado altamente sensível e não deve ser persistido nem registrado.
- Uma falha XSS ou terceiro script na página de checkout pode capturar cartão digitado.
- **GTM está ativo na rota `/checkout`.** `GTMWrapper` exclui áreas autenticadas por prefixo de pathname, mas `/checkout` não está na lista de exclusão. Qualquer tag ou listener configurado no GTM pode capturar eventos de formulário com dados de cartão.

Comportamento desejado:

- Preferir checkout hospedado, campos seguros ou tokenização onde PAN/CVV não passem pelo backend do Kadernim.
- Se mantiver temporariamente o cartão cru, aplicar hardening e documentar a decisão.
- Garantir bloqueio de captura por analytics/session replay e mascaramento de logs.
- Excluir `/checkout` no `GTMWrapper` imediatamente, independente da decisão de arquitetura de cartão.

### P1 - Cartão redireciona para sucesso sem pagamento confirmado

Local:

- `src/components/dashboard/billing/checkout-form.tsx`

Comportamento atual:

Após `createBillingCheckout()`, se o método não é PIX, o código mostra toast apenas quando `data.status` é `RECEIVED` ou `CONFIRMED`, mas sempre executa:

```ts
window.location.href = getPostCheckoutUrl(data.checkoutAuthToken)
```

Risco:

- Usuário pode cair em `/resources?checkout=success` com pagamento pendente, em análise ou recusado.
- Métrica de sucesso fica contaminada.
- Suporte recebe casos em que o usuário acha que pagou, mas não tem acesso.

Comportamento desejado:

- Redirecionar para sucesso somente com `RECEIVED` ou `CONFIRMED`.
- Mostrar estado específico para `PENDING` e `AWAITING_RISK_ANALYSIS`.
- Mostrar erro acionável para recusa ou status inesperado.

### P2 - Token de checkout guest é emitido antes da confirmação do pagamento

Local:

- `src/app/api/v1/billing/checkout-guest/route.ts`
- `src/lib/billing/services/checkout-auth-token.service.ts`
- `src/app/api/v1/auth/verify-checkout-token/route.ts`

Comportamento atual:

O token de login do comprador convidado é criado logo após iniciar o checkout, não após confirmação do pagamento.

Risco:

- O usuário pode se autenticar mesmo sem pagamento confirmado.
- Isso é aceitável apenas se todas as áreas Pro verificarem `subscription.isActive` ou papel sincronizado corretamente.
- O token expira em 10 minutos, o que pode ser curto para PIX pago depois, mas ainda enviado ao front.

Comportamento desejado:

- Login guest pode existir, mas sucesso de compra e acesso Pro precisam depender de assinatura ativa.
- O token deve ter escopo claro de autenticação pós-checkout, não de autorização Pro.
- Considerar emitir token pós-confirmação ou validar invoice paga antes de criar sessão.

### P3 - Param `checkout=success` não tem tratamento na página de destino

Local:

- `src/app/(dashboard)/resources/page.tsx`
- `src/components/dashboard/checkout-auth-handler.tsx`
- `src/lib/auth/use-checkout-token.ts`

Comportamento atual observado:

`resources/page.tsx` ignora completamente o parâmetro `checkout=success`. Não há banner, modal nem mensagem de confirmação de compra. O `CheckoutAuthHandler` no layout do dashboard processa o token de autenticação guest via `useCheckoutToken`, mas apenas cria a sessão e recarrega a página — não verifica `subscription.isActive` nem exibe nenhum estado pós-checkout.

Resultado: o usuário chega em `/resources?checkout=success` e vê a lista de recursos normalmente, sem confirmação visual de compra, sem feedback de que o pagamento está sendo processado e sem verificação de assinatura ativa.

Risco:

- Usuário não sabe se a compra foi concluída.
- Se o pagamento não foi confirmado, o usuário pode ter acesso a recursos protegidos dependendo apenas do guard de assinatura e de quando ele foi sincronizado.
- Falta de feedback aumenta abandono e suporte desnecessário.

Comportamento desejado:

- Página ou componente de destino deve detectar `checkout=success` e verificar `subscription.isActive`.
- Se assinatura ativa: mostrar confirmação de compra e onboarding.
- Se não ativa ainda: mostrar estado de processamento com instrução de aguardar ou contato de suporte.

### P4 - Endpoints transacionais sem rate limit visível

Local:

- `src/app/api/v1/billing/checkout/route.ts`
- `src/app/api/v1/billing/checkout-guest/route.ts`
- `src/app/api/v1/auth/verify-checkout-token/route.ts`
- `src/app/api/v1/billing/pix-checkout/[invoiceId]/resend/route.ts`

Comportamento atual:

Rate limit não está wired nos endpoints críticos. O utilitário `checkRateLimit` existe em `src/server/utils/rate-limit.ts`, mas não é chamado nos routes de checkout, checkout-guest nem verify-checkout-token. O PIX resend usa controle próprio baseado em banco de dados.

Adicionalmente, ambos os routes de checkout retornam `details: error.message` em produção:
- `checkout/route.ts:35`: `details: error.message` em 500
- `checkout-guest/route.ts:38`: `details: error.message` em 400 e 500

Isso expõe mensagens internas de exceção a qualquer cliente.

Risco:

- Tentativas automatizadas de cartão.
- Abuso de criação de usuários e customers.
- Reenvio abusivo de PIX por e-mail/WhatsApp.
- Brute force ou replay de token de checkout.

Comportamento desejado:

- Rate limit por IP, e-mail e, quando houver, usuário.
- Mensagens de erro genéricas em produção.
- Logs internos suficientes para investigação, sem dados sensíveis.

## Problemas moderados

### P5 - Falta atribuição de conversão por variante de LP

Local:

- `src/app/lp/page.tsx`
- `src/config/ab-tests.ts`
- CTAs em `src/components/marketing/variants/*`
- checkout e billing audit

Comportamento atual:

A LP escolhe variante por cookie, mas o checkout não recebe nem persiste essa informação.

Risco:

- Não é possível responder com confiança qual LP converte.
- Decisões de marketing ficam baseadas em cliques ou percepção, não em pagamento confirmado.

Comportamento desejado:

- Preservar `lp_variant` desde LP até webhook.
- Persistir em audit/evento ou metadado local associado a invoice.
- Medir `payment_confirmed` por variante.

### P6 - Estados de cartão insuficientes no front

Local:

- `src/components/dashboard/billing/checkout-form.tsx`

Risco:

- O usuário não sabe se o pagamento está em análise, recusado ou pendente.
- A equipe não diferencia falha real de espera de confirmação.

Comportamento desejado:

- Estado visual para aprovado.
- Estado visual para em análise.
- Estado visual para pendente.
- Estado visual para falha ou recusa.
- Mensagens sem prometer acesso quando não houve confirmação.

### P7 - Observabilidade transacional insuficiente

Local:

- `BillingAuditService`
- `PaymentService`
- `WebhookHandler`

Risco:

- Difícil reconstruir jornada de um pagamento.
- Difícil cruzar LP, checkout iniciado, invoice e webhook.

Comportamento desejado:

- Eventos estruturados com `userId`, `invoiceId`, `asaasId`, `planId`, `paymentMethod`, `status`, `lpVariant`, `utm`.

## Gaps menores não cobertos pelas tasks principais

### Webhook persiste payload externo não sanitizado

Local: `src/lib/billing/services/webhook.handler.ts:110`

Eventos desconhecidos persistem `metadata: { payload }` inteiro no audit log. O payload vem do Asaas sem sanitização. Baixo risco hoje — Asaas não inclui PAN em webhook — mas é superfície de dados externos não controlados no banco.

Fix: substituir `metadata: { payload }` por um subconjunto seguro (`{ event: eventName, eventId }`).

### `details` exposto também em 400 de validação

Local:
- `src/app/api/v1/billing/checkout/route.ts:22`
- `src/app/api/v1/billing/checkout-guest/route.ts:18`

Respostas 400 de validação Zod retornam `details: parsed.error.format()`, expondo estrutura interna do schema. Coberto em T1 mas não localizado explicitamente.

## O que está bem

- Existe separação entre checkout logado e guest.
- O webhook tem idempotência por `BillingAuditService.isDuplicate(eventId)`.
- PIX usa polling com token para guest.
- `PaymentService` centraliza criação de cobranças.
- `activateSubscription()` atualiza assinatura e papel do usuário.
- Descrição do pagamento inclui `[plan:...]` e `[billing:...]`, útil para inferência no webhook.
- Webhook valida `asaas-access-token`.
- O diagnóstico não encontrou persistência explícita de número de cartão ou CVV no Prisma.

## Matriz de risco

| Problema | Severidade | Probabilidade | Risco | Esforço |
|---|---|---|---|---|
| Cartão cru e CVV trafegam pelo app | Alto | Alta | CRÍTICO | Alto |
| Cartão redireciona sem confirmação | Alto | Média | CRÍTICO | Baixo |
| Token guest antes do pagamento | Alto | Média | CRÍTICO | Médio |
| Sucesso sem validar assinatura ativa | Alto | Média | CRÍTICO | Baixo |
| Endpoints transacionais sem rate limit visível | Alto | Média | CRÍTICO | Médio |
| Sem conversão por LP | Médio | Alta | MÉDIO | Médio |
| UX sem estados de cartão | Médio | Alta | MÉDIO | Médio |
| Audit trail incompleto | Médio | Média | MÉDIO | Médio |

## Ordem de fixação

1. Decidir estratégia de cartão e escopo PCI.
2. Bloquear captura/log de dados sensíveis e adicionar rate limit.
3. Corrigir redirecionamento incondicional do cartão.
4. Criar estados explícitos para pagamento pendente, análise e falha.
5. Garantir que sucesso no dashboard dependa de assinatura ativa.
6. Revisar token guest e seu escopo.
7. Instrumentar eventos de checkout e LP.
8. Adicionar testes de fluxo e simulação de webhook.
