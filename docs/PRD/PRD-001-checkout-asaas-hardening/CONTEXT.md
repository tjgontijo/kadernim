# Contexto - Checkout proprio com Asaas

## O que é

O checkout do Kadernim Pro é um fluxo próprio hospedado no app, onde o usuário informa dados pessoais, CPF, forma de pagamento e dados de cartão quando aplicável. O backend cria cobranças, assinaturas ou pagamentos no Asaas e mantém os registros locais em `Subscription` e `Invoice`.

Este fluxo é diferente de um checkout externo hospedado pelo gateway. A responsabilidade de UX, estado, autenticação, liberação de acesso, auditoria, segurança do fluxo de pagamento e medição do funil fica no Kadernim.

## O que não é

Não é apenas uma página de redirecionamento para Asaas. Também não é apenas um formulário visual. É uma esteira transacional:

- cria ou resolve usuário,
- cria customer no Asaas quando necessário,
- envia cobrança ao Asaas,
- salva invoice local,
- acompanha status,
- recebe webhook,
- ativa assinatura,
- autentica comprador convidado,
- libera acesso Pro.

Também não é um fluxo fora de escopo de segurança. Como o formulário coleta número de cartão e CVV no app, o browser e o backend do Kadernim participam do caminho de dados sensíveis.

## Fluxo atual

1. O usuário acessa `src/app/checkout/page.tsx`.
2. A página busca o catálogo por `getBillingCheckoutCatalog()`.
3. Se houver sessão, preenche `prefilledUser`.
4. O componente `GuestCheckoutForm` renderiza plano, dados pessoais e pagamento.
5. Usuário escolhe cartão ou PIX.
6. O front chama `createBillingCheckout()`.
7. Usuário logado usa `/api/v1/billing/checkout`.
8. Usuário convidado usa `/api/v1/billing/checkout-guest`.
9. `CheckoutService.createCheckout()` decide entre PIX, PIX Automático ou cartão.
10. `PaymentService` cria pagamento, assinatura ou parcelamento no Asaas.
11. O sistema salva ou atualiza `Subscription` e `Invoice`.
12. Para PIX, o front exibe QR Code e faz polling.
13. Para cartão, o front redireciona após a resposta.
14. O webhook do Asaas consolida a verdade final.
15. Quando pago, `activateSubscriptionForPayment()` ativa assinatura e `onSubscriptionChange()` sincroniza o papel/acesso.

## Dados sensíveis no fluxo

Dados coletados ou trafegados:

- Nome completo.
- E-mail.
- Telefone/WhatsApp.
- CPF.
- Número de cartão.
- Nome impresso no cartão.
- Mês e ano de expiração.
- CVV/CCV.
- QR Code e payload PIX.
- Token de autenticação pós-checkout guest.
- IDs de invoice, subscription, customer e payment no Asaas.

Classificação operacional:

- CPF, telefone e e-mail são dados pessoais.
- Número de cartão, expiração e CVV/CCV são dados de pagamento sensíveis.
- CVV/CCV não deve ser persistido, logado, enviado para analytics, session replay ou ferramenta de suporte.
- O fato de não salvar cartão no banco não elimina o risco, porque o app ainda processa e transmite esses dados.
- GTM está ativo na rota `/checkout`. O `GTMWrapper` exclui áreas autenticadas por pathname, mas `/checkout` não está na lista de exclusão. Qualquer tag GTM configurada pode capturar eventos do formulário de cartão.

## Decisão obrigatória de segurança

Antes de implementar mudanças de UX, o time precisa decidir a estratégia para cartão:

1. Manter checkout próprio com cartão cru temporariamente.
2. Migrar para checkout hospedado do Asaas.
3. Usar tokenização/campos seguros, se disponível de forma que PAN/CVV não passem pelo backend do Kadernim.
4. Remover cartão do checkout próprio e manter apenas PIX enquanto a solução segura é definida.

Critério recomendado:

- Preferir uma arquitetura onde PAN e CVV não passem pelo backend do Kadernim.
- Se isso não for possível no curto prazo, tratar a manutenção do cartão cru como decisão temporária, documentada e acompanhada de hardening mínimo.

## Segurança mínima esperada

O checkout deve garantir:

- Nenhum log com número de cartão, CVV, payload completo de cartão ou token de sessão.
- Nenhuma captura desses campos por GTM, analytics, session replay ou ferramenta de erro.
- APIs públicas sem `details: error.message` em produção.
- Rate limit em checkout, checkout guest, verificação de token e reenvio PIX.
- Validação runtime de todos os payloads.
- Webhook autenticado e idempotente.
- Sessão guest separada de autorização Pro.
- Sucesso visual separado de assinatura ativa.

## Entidades principais

### `Subscription`

Modelo em `prisma/schema.prisma`.

Campos relevantes:

- `userId`
- `offerId`
- `asaasId`
- `status`
- `paymentMethod`
- `isActive`
- `purchaseDate`
- `expiresAt`
- `canceledAt`

### `Invoice`

Modelo em `prisma/schema.prisma`.

Campos relevantes:

- `userId`
- `subscriptionId`
- `offerId`
- `asaasId`
- `status`
- `paymentMethod`
- `value`
- `netValue`
- `description`
- `billingType`
- `dueDate`
- `paidAt`
- `pixQrCodePayload`
- `pixQrCodeImage`
- `pixExpirationDate`

## Estados relevantes

### Estados de invoice local

- `PENDING`
- `CONFIRMED`
- `RECEIVED`
- `OVERDUE`
- `REFUNDED`
- `AWAITING_RISK_ANALYSIS`
- demais estados de chargeback e dunning

### Estados que devem liberar sucesso de pagamento

- `RECEIVED`
- `CONFIRMED`

### Estados que não devem liberar sucesso

- `PENDING`
- `AWAITING_RISK_ANALYSIS`
- `OVERDUE`
- `REFUNDED`
- qualquer estado desconhecido

## Integração Asaas

A integração usa `AsaasClient` em `PaymentService`.

Operações atuais:

- PIX avulso via `/payments`.
- Assinatura mensal cartão via `/subscriptions`.
- Pagamento anual cartão via `/payments`.
- Parcelamento anual cartão via `/installments`.
- Consulta de pagamentos de subscription e installment.
- Webhooks para eventos `PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED`, `PAYMENT_REFUNDED`, `SUBSCRIPTION_*` e PIX Automático.

## Checkout guest

Para usuários convidados:

1. `/api/v1/billing/checkout-guest` valida payload.
2. `CheckoutCustomerService.resolveGuestCustomer()` cria ou encontra o usuário por e-mail.
3. `CheckoutService.createCheckout()` inicia a cobrança.
4. `CheckoutAuthTokenService.create()` gera token de login temporário.
5. O front redireciona para `/resources?checkout=success&token=...` quando entende que deve seguir.
6. `CheckoutAuthHandler` chama `/api/v1/auth/verify-checkout-token`.
7. A rota cria uma sessão Better Auth manualmente e seta cookie.

Esse fluxo precisa ser cuidadosamente limitado: autenticar o usuário não pode significar liberar acesso Pro se a assinatura ainda não está ativa.

## Conversão de LP

A landing page em `src/app/lp/page.tsx` escolhe uma variante com base no cookie `hp_variant`, definido por `AB_TEST_CONFIG.cookieName`. Hoje a variante renderizada não é carregada até o checkout e não há persistência clara em invoice, subscription ou eventos.

Para medir conversão real, a atribuição precisa atravessar:

- view da LP,
- clique no CTA,
- início do checkout,
- criação da cobrança,
- pagamento confirmado no webhook.

## Princípio de produto

O checkout deve separar três estados:

- usuário autenticado,
- pagamento iniciado,
- acesso Pro liberado.

O sistema só deve apresentar compra concluída quando o estado local ou webhook indicar pagamento confirmado.

## Decisão T0 (registrada em 2026-05-11)

Estratégia temporária aprovada: manter checkout próprio com cartão cru por prazo curto, com hardening obrigatório já iniciado (bloqueio GTM no checkout, redução de vazamento de erro, proteção de fluxo de sucesso, token fora da URL).

Prazo máximo para migração: até 2026-06-30 para uma abordagem que retire PAN/CVV do backend da aplicação (checkout hospedado Asaas ou tokenização/campos seguros).

Risco aceito temporariamente: escopo PCI ampliado enquanto houver tráfego de PAN/CVV no app e backend.

Condição de continuidade: não escalar investimento de tráfego pago para checkout de cartão sem concluir migração ou controles equivalentes aprovados.
