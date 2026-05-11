# Quick Start

## TL;DR

Comece pela decisão de segurança do cartão. Se o app continuar recebendo número de cartão e CVV, implemente hardening antes de escalar o checkout. Depois corrija o redirecionamento incondicional do cartão e garanta que `/resources?checkout=success` só mostre sucesso real com assinatura ativa.

## Ordem recomendada

| Ordem | Task | Motivo |
|---|---|---|
| 1 | T0 | Define se o app continuará processando cartão cru — com prazo máximo se for "temporário" |
| 2 | T1 | Bloqueia GTM no checkout, remove `details` em erros públicos |
| 3 | T2 | Rate limit com store persistente (não in-memory) |
| 4 | T3 | Remove falso sucesso no cartão |
| 5 | T4 | Dá UX correta para pendente, análise e falha |
| 6 | T5 | Implementa estado pós-checkout com verificação de assinatura |
| 7 | T6 | Remove token da URL e revisa escopo do token guest |
| 8 | T10 | Audita XSS e supply chain na página de checkout |
| 9 | T7 | Mede conversão real por LP |
| 10 | T8 | Melhora auditoria e suporte |
| 11 | T9 | Evita regressão |

## Arquivos para abrir primeiro

- `src/components/dashboard/billing/checkout-form.tsx`
- `src/lib/billing/services/payment.service.ts`
- `src/lib/billing/services/webhook.handler.ts`
- `src/app/api/v1/billing/checkout-guest/route.ts`
- `src/app/api/v1/auth/verify-checkout-token/route.ts`
- `src/app/lp/page.tsx`
- `src/config/ab-tests.ts`
- `src/components/analytics/gtm-wrapper.tsx`

## Checklist de segurança inicial

- **GTM está ativo em `/checkout`** — excluir o path no `GTMWrapper` é a primeira correção a fazer (1 linha).
- Confirmar se PAN/CVV continuarão passando pelo backend — e com prazo máximo se a decisão for "temporário".
- Confirmar que campos de cartão não são capturados por terceiros ou tags GTM.
- `details: error.message` e `details: parsed.error.format()` expostos em produção nos routes de checkout — remover.
- `checkRateLimit` usa `Map` em memória — não funciona em serverless. Precisa Redis/Upstash antes de ser efetivo em produção.
- Token de autenticação guest passa na query string da URL — vai para logs e histórico do browser. Mover para POST body.
- Confirmar que sessão guest não libera Pro sem `subscription.isActive`.
- Verificar CSP na rota `/checkout` — bloqueia scripts inline e origens não autorizadas.
- Executar `npm audit --audit-level=critical` nas dependências do checkout.

## Cenários principais de teste

### Cartão aprovado

Resultado esperado:

- API retorna `RECEIVED` ou `CONFIRMED`.
- Front mostra aprovação.
- Redireciona para `/resources?checkout=success`.
- Assinatura ativa após criação inicial ou webhook.
- Nenhum dado de cartão aparece em logs ou analytics.

### Cartão pendente ou em análise

Resultado esperado:

- Não redireciona para sucesso.
- Mostra estado de espera ou análise.
- Não promete acesso imediato.

### Cartão recusado ou erro

Resultado esperado:

- Permanece no checkout.
- Mostra erro claro.
- Permite tentar novamente.
- Resposta pública não expõe erro interno em produção.

### Abuso de endpoint

Resultado esperado:

- Múltiplas chamadas em sequência recebem `429`.
- Resposta não revela detalhes internos.
- Logs internos permitem investigar sem dados sensíveis.

### PIX iniciado

Resultado esperado:

- Mostra QR Code.
- Faz polling com `statusToken`.
- Não redireciona antes de status pago.

### PIX confirmado

Resultado esperado:

- Polling detecta `RECEIVED`, `CONFIRMED` ou `ACTIVE`.
- Redireciona para `/resources?checkout=success`.
- Guest usa token se aplicável.

### Webhook duplicado

Resultado esperado:

- Segundo evento é ignorado por idempotência.
- Assinatura não sofre efeitos duplicados.

## Comandos

```bash
npm run build
```

Para desenvolvimento manual:

```bash
npm run dev
```

## Branch sugerida

```bash
git checkout -b fix/checkout-asaas-hardening
```

## Commits sugeridos

```txt
fix(checkout): prevent card success redirect for unpaid statuses
feat(checkout): add pending and risk analysis states
fix(billing): validate checkout success against active subscription
fix(security): harden checkout sensitive data handling
feat(security): rate limit checkout transaction endpoints
feat(analytics): track checkout conversion attribution
test(billing): cover checkout payment status transitions
```

## Critério final de pronto

O checkout estará pronto quando:

- nenhum pagamento não confirmado cair em sucesso,
- dados de cartão e CVV não vazarem em logs, analytics ou erros públicos,
- endpoints transacionais tiverem rate limit,
- o webhook continuar sendo a fonte da verdade,
- usuário guest não ganhar acesso Pro sem assinatura ativa,
- PIX e cartão tiverem estados claros,
- for possível medir pagamento confirmado por variante da LP,
- `npm run build` passar.
