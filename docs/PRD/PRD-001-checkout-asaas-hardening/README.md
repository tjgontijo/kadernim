# PRD-001 - Checkout proprio com Asaas, hardening e conversao

## Resumo executivo

Este PRD cobre o endurecimento do checkout proprio do Kadernim Pro, implementado em Next.js e integrado ao Asaas via API. O objetivo é reduzir risco de segurança no tratamento de dados sensíveis, garantir que o usuário só veja sucesso real quando o pagamento estiver confirmado, ativar assinatura de forma confiável pelo webhook, e medir conversão por origem e variante de landing page.

Status da documentação: pronta para implementação.

Severidade geral: crítica, porque o fluxo envolve dados de cartão, CPF, pagamento, criação de usuário, autenticação de comprador convidado e liberação de acesso Pro.

## Escopo

Inclui:

- Checkout próprio em `src/app/checkout/page.tsx`.
- Formulário em `src/components/dashboard/billing/checkout-form.tsx`.
- APIs `/api/v1/billing/checkout` e `/api/v1/billing/checkout-guest`.
- Criação de cobranças em `src/lib/billing/services/payment.service.ts`.
- Webhook Asaas em `src/lib/billing/services/webhook.handler.ts`.
- Login pós-compra via `CheckoutAuthTokenService`.
- Polling de PIX em `src/components/dashboard/billing/checkout-pix-qrcode.tsx`.
- Atribuição futura de conversão por LP e `hp_variant`.
- Decisão de segurança sobre escopo PCI, cartão cru, tokenização ou checkout hospedado.
- Rate limit, redução de vazamento de erros e proteção contra captura de dados sensíveis por logs, analytics e session replay.
- GTM ativo na rota `/checkout` (não está na lista de exclusão de `gtm-wrapper.tsx`).

Fora do escopo:

- Redesenho visual completo do checkout.
- Troca de gateway de pagamento.
- Refatoração ampla do billing.
- Mudanças em preços ou catálogo.

## Problemas identificados

| ID | Problema | Severidade | Impacto |
|---|---|---|---|
| P0 | Cartão cru e CVV trafegam pelo browser e backend do app | Crítica | Aumenta escopo PCI e responsabilidade de segurança |
| P1 | Cartão redireciona para `checkout=success` mesmo quando status não é pago | Crítica | Promessa de sucesso incorreta |
| P2 | Guest recebe token de login logo após criar checkout, antes da confirmação | Alta | Pode autenticar comprador não pago, depende de guards corretos |
| P3 | Sucesso em `/resources?checkout=success` não parece validar assinatura ativa | Alta | UX e métricas podem indicar falso sucesso |
| P4 | Falta rate limit e hardening em endpoints transacionais | Alta | Abuso, fraude, brute force e custo operacional |
| P5 | Falta rastreio estruturado do funil por variante de LP | Alta | Não é possível saber qual LP converte |
| P6 | Estados de cartão pendente, análise de risco e recusa não estão claros no front | Média | Suporte e abandono aumentam |
| P7 | Webhook e criação inicial de pagamento podem divergir em status e assinatura | Média | Risco operacional e difícil auditoria |

## Fases

| Fase | Entrega | Estimativa |
|---|---|---|
| 0 | Decidir e documentar estratégia de segurança, PCI e dados sensíveis | 0.5 a 1 dia |
| 1 | Corrigir comportamento de sucesso e estados do cartão | 0.5 a 1 dia |
| 2 | Fortalecer autorização pós-checkout guest e endpoints transacionais | 1 dia |
| 3 | Validar sucesso real no dashboard/resources | 0.5 dia |
| 4 | Instrumentar eventos de checkout e conversão | 1 dia |
| 5 | Testes e simulação de webhooks Asaas | 1 dia |

Estimativa total: 4 a 5 dias, sem incluir eventual migração para checkout hospedado ou campos seguros de pagamento.

## Arquivos principais

- `src/app/checkout/page.tsx`
- `src/components/dashboard/billing/checkout-form.tsx`
- `src/components/dashboard/billing/checkout-pix-qrcode.tsx`
- `src/app/api/v1/billing/checkout/route.ts`
- `src/app/api/v1/billing/checkout-guest/route.ts`
- `src/app/api/v1/billing/checkout/[invoiceId]/status/route.ts`
- `src/app/api/v1/auth/verify-checkout-token/route.ts`
- `src/lib/billing/services/checkout.service.ts`
- `src/lib/billing/services/payment.service.ts`
- `src/lib/billing/services/webhook.handler.ts`
- `src/lib/billing/services/checkout-auth-token.service.ts`
- `src/config/ab-tests.ts`
- `src/app/lp/page.tsx`
- `src/components/analytics/gtm-wrapper.tsx`
- `.env.example`

## Como começar

Comece pela T0 em `TASKS.md`. Ela define se o produto continuará processando cartão cru no app ou se vai migrar para uma alternativa que reduza escopo PCI.

Se a decisão temporária for manter checkout próprio com cartão cru, implemente imediatamente as tasks de hardening. Depois corrija sucesso real e só então conecte eventos de conversão. Métrica antes de corrigir estado de pagamento vai medir ruído.

## Matriz resumida de risco

| Problema | Severidade | Probabilidade | Risco | Esforço |
|---|---|---|---|---|
| Cartão cru e CVV trafegam pelo app | Alto | Alta | CRÍTICO | Alto |
| Redirecionamento de cartão sem pagamento confirmado | Alto | Média | CRÍTICO | Baixo |
| Token guest emitido antes do pagamento | Alto | Média | CRÍTICO | Médio |
| Sucesso visual sem assinatura ativa | Alto | Média | CRÍTICO | Baixo |
| Endpoints transacionais sem rate limit visível | Alto | Média | CRÍTICO | Médio |
| Conversão sem atribuição de LP | Médio | Alta | MÉDIO | Médio |
| Estados de pagamento incompletos | Médio | Alta | MÉDIO | Médio |
