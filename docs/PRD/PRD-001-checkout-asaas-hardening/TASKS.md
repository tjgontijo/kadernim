# Tasks de implementação

## T0 - Decidir estratégia de segurança para cartão e escopo PCI

Estimativa: 0.5 a 1 dia.

Problema:

O checkout atual coleta número de cartão e CVV no app e envia esses dados para o backend. Isso aumenta o escopo de segurança e PCI do Kadernim.

Localização técnica:

- `src/components/dashboard/billing/checkout-form.tsx`
- `src/app/api/v1/billing/checkout/route.ts`
- `src/app/api/v1/billing/checkout-guest/route.ts`
- `src/lib/billing/services/payment.service.ts`
- Documentação Asaas sobre checkout hospedado, tokenização e campos seguros, a confirmar.

O que fazer:

- Mapear exatamente onde PAN, CVV, CPF e token guest trafegam.
- Decidir entre:
  - manter cartão cru temporariamente,
  - migrar para checkout hospedado do Asaas,
  - migrar para tokenização/campos seguros sem PAN/CVV no backend,
  - pausar cartão e manter PIX até a solução segura.
- Registrar a decisão no PRD ou em ADR.
- Se mantiver cartão cru, abrir tasks obrigatórias de hardening antes de escalar tráfego.

Critérios de aceitação:

- Existe decisão escrita sobre a estratégia de cartão.
- O time sabe se o backend continuará recebendo PAN/CVV.
- Riscos e responsabilidades estão documentados.
- A implementação futura não trata segurança como detalhe opcional.
- Se a decisão for "manter cartão cru temporariamente", definir prazo máximo explícito para migração — sem prazo, "temporário" vira permanente. Documentar no ADR.

Como testar:

- Revisar payloads no browser, API route e `PaymentService`.
- Confirmar que nenhuma decisão depende de suposição sem validar documentação Asaas.

## T1 - Bloquear captura, logs e vazamento de dados sensíveis

Estimativa: 4 a 8 horas.

Problema:

Dados de cartão, CPF, payload PIX e tokens podem vazar por logs, analytics, session replay, error tracking ou mensagens de erro públicas.

Localização técnica:

- `src/components/dashboard/billing/checkout-form.tsx`
- `src/components/analytics/gtm-wrapper.tsx`
- `src/app/api/v1/billing/checkout/route.ts`
- `src/app/api/v1/billing/checkout-guest/route.ts`
- `src/app/api/v1/auth/verify-checkout-token/route.ts`
- `src/lib/billing/services/logger.ts`, se existir.
- Integrações de analytics/error tracking, a confirmar.

O que fazer:

- Excluir `/checkout` na lista de exclusão de `GTMWrapper` em `src/components/analytics/gtm-wrapper.tsx`. Adicionar `pathname?.startsWith('/checkout')` à condição `isLoggedArea`. Fazer isso antes de qualquer outra mudança — é uma linha.
- Garantir que campos de cartão tenham atributos ou configuração para mascaramento em ferramentas de replay, quando houver.
- Nunca enviar PAN, CVV, CPF completo ou payload PIX completo para GTM/analytics.
- Remover `details: error.message` de respostas públicas em produção nos dois routes:
  - `src/app/api/v1/billing/checkout/route.ts`
  - `src/app/api/v1/billing/checkout-guest/route.ts`
- Manter detalhes técnicos apenas em log interno sanitizado.
- Revisar `billingLog` para impedir metadata sensível.

Critérios de aceitação:

- Nenhum log conhecido inclui número de cartão ou CVV.
- Nenhum evento de analytics recebe dados sensíveis.
- Erros públicos de checkout são genéricos em produção.
- Logs internos preservam `invoiceId`, `asaasId`, `userId` e status, sem dados sensíveis.

Como testar:

- Forçar erro de checkout e verificar resposta HTTP.
- Inspecionar network tab para eventos GTM/analytics.
- Revisar logs gerados durante checkout falso.

## T2 - Adicionar rate limit nos endpoints transacionais

Estimativa: 4 a 8 horas.

Problema:

Não há rate limit visível nos endpoints mais sensíveis do checkout.

Localização técnica:

- `src/app/api/v1/billing/checkout/route.ts`
- `src/app/api/v1/billing/checkout-guest/route.ts`
- `src/app/api/v1/auth/verify-checkout-token/route.ts`
- `src/app/api/v1/billing/pix-checkout/[invoiceId]/resend/route.ts`
- `src/server/utils/rate-limit.ts`

O que fazer:

- O utilitário `checkRateLimit` em `src/server/utils/rate-limit.ts` usa `Map` em memória. Em ambiente serverless (Vercel), cada instância tem memória isolada — o rate limit não é compartilhado entre invocações. Para ser efetivo em produção, precisar de backend persistente (Redis/Upstash). Avaliar se um limite por-instância já oferece proteção suficiente no curto prazo ou se precisa de store externo.
- Adicionar `checkRateLimit` por IP nos routes de checkout, checkout-guest e verify-checkout-token.
- Para guest checkout, considerar também rate limit por e-mail do payload.
- Para usuário logado, considerar `userId`.
- Para reenvio PIX, o controle por banco de dados já existe e funciona em serverless — manter.
- Retornar `429` com mensagem segura, sem `details` interno.

Critérios de aceitação:

- Abuso básico de checkout retorna `429`.
- Reenvio PIX não dispara spam.
- Verify token tem proteção contra brute force.
- Rate limit funciona com proxy confiável (header `x-forwarded-for`).
- Rate limit é efetivo em produção serverless — não em memória por instância.

Como testar:

- Fazer múltiplas chamadas consecutivas para cada endpoint.
- Verificar que a resposta muda para `429`.
- Confirmar que fluxos normais não são bloqueados.
- Confirmar que `429` persiste quando chamadas vêm de diferentes processos Node (simula múltiplas instâncias serverless).

Nota de implementação:

Se usar Upstash Redis via `@upstash/ratelimit`, o padrão sliding window por IP é adequado. Alternativa mais simples: usar Edge Config da Vercel como store de contadores, se já disponível no projeto. Não usar `Map` em memória — não funciona em serverless.

## T3 - Bloquear sucesso de cartão sem status pago

Estimativa: 2 a 4 horas.

Problema:

O checkout de cartão redireciona para `/resources?checkout=success` mesmo quando `data.status` não é `RECEIVED` ou `CONFIRMED`.

Localização técnica:

- `src/components/dashboard/billing/checkout-form.tsx`

O que fazer:

- Criar helper local ou utilitário para classificar status de checkout.
- Redirecionar para sucesso somente quando o status for pago.
- Para status pendente ou análise, renderizar estado próprio no checkout.
- Para status recusado ou inesperado, manter usuário no formulário e mostrar mensagem clara.

Snippet orientativo:

```ts
const paidStatuses = ['RECEIVED', 'CONFIRMED']

if (paidStatuses.includes(data.status ?? '')) {
  toast.success('Pagamento aprovado!')
  window.location.href = getPostCheckoutUrl(data.checkoutAuthToken)
  return
}

setCardPaymentState({
  status: data.status ?? 'UNKNOWN',
  invoiceId: data.invoiceId,
})
```

Critérios de aceitação:

- Cartão aprovado redireciona para `/resources?checkout=success`.
- Cartão pendente não redireciona para sucesso.
- Cartão em análise não redireciona para sucesso.
- Cartão recusado exibe erro e permite tentar novamente.
- Nenhum estado não pago mostra "Pagamento aprovado".

Como testar:

- Mockar resposta da API com `RECEIVED`.
- Mockar resposta da API com `PENDING`.
- Mockar resposta da API com `AWAITING_RISK_ANALYSIS`.
- Mockar erro 500 e validar toast de falha.

## T4 - Criar estado visual para cartão pendente, análise e falha

Estimativa: 3 a 5 horas.

Problema:

O checkout não tem uma tela ou bloco dedicado para estados intermediários de cartão.

Localização técnica:

- `src/components/dashboard/billing/checkout-form.tsx`

O que fazer:

- Criar estado client-side para resultado de cartão.
- Exibir bloco de "Pagamento em análise" quando status for `AWAITING_RISK_ANALYSIS`.
- Exibir bloco de "Pagamento pendente" quando status for `PENDING`.
- Exibir bloco de falha quando a API retornar erro conhecido.
- Oferecer ação para tentar novamente.

Critérios de aceitação:

- Usuário entende que ainda não tem acesso quando o pagamento não está confirmado.
- Botão de nova tentativa limpa o estado e volta ao formulário.
- Texto evita prometer acesso imediato em status pendente.

Como testar:

- Teste manual com respostas simuladas no client.
- Teste visual em mobile e desktop.

## T5 - Implementar estado pós-checkout em `/resources?checkout=success`

Estimativa: 3 a 5 horas.

Problema:

`resources/page.tsx` ignora completamente o parâmetro `checkout=success`. O `CheckoutAuthHandler` no layout do dashboard processa o token guest mas não verifica assinatura nem exibe nenhum feedback. O usuário chega à página sem saber se a compra foi concluída.

Localização técnica:

- `src/app/(dashboard)/resources/page.tsx`
- `src/components/dashboard/checkout-auth-handler.tsx`
- `src/lib/auth/use-checkout-token.ts`
- Guards ou queries de subscription, a confirmar.

O que fazer:

- Detectar `checkout=success` no search params de `resources/page.tsx` ou em componente dedicado.
- Consultar `subscription.isActive` do usuário autenticado.
- Se ativo: exibir banner/modal de boas-vindas confirmando a compra.
- Se não ativo ainda: exibir estado de processamento com instrução de aguardar e não prometer acesso imediato.
- Limpar o parâmetro da URL depois de consumir o estado.

Critérios de aceitação:

- `checkout=success` com assinatura ativa mostra confirmação de compra.
- `checkout=success` sem assinatura ativa mostra estado de processamento, não sucesso.
- Usuário sem assinatura ativa não vê mensagem de acesso liberado.
- URL é limpa após consumir o parâmetro.

Como testar:

- Criar sessão de usuário com subscription ativa e acessar `/resources?checkout=success`.
- Criar sessão de usuário sem subscription ativa e acessar a mesma URL.
- Verificar que URL é limpa em ambos os casos.

## T6 - Revisar escopo e transporte do token de checkout guest

Estimativa: 3 a 6 horas.

Problema:

Dois problemas relacionados:

1. O token é emitido antes da confirmação do pagamento.
2. O token é passado como query string na URL: `/resources?checkout=success&token=eyJ...`

O token na URL vai para histórico do browser, access logs do servidor e header `Referer` se a página carregar qualquer recurso externo. Qualquer pessoa com acesso aos logs ou ao dispositivo do usuário pode reutilizar o token dentro do TTL de 10 minutos para criar uma sessão autenticada.

Localização técnica:

- `src/app/api/v1/billing/checkout-guest/route.ts`
- `src/lib/billing/services/checkout-auth-token.service.ts`
- `src/app/api/v1/auth/verify-checkout-token/route.ts`
- `src/lib/auth/use-checkout-token.ts`
- `src/components/dashboard/billing/checkout-form.tsx` — onde monta a URL de redirecionamento

O que fazer:

- Eliminar o token da query string. Alternativas em ordem de preferência:
  - **Preferível:** trocar o redirect para um `POST` server-side que consome o token e seta o cookie antes de redirecionar para `/resources?checkout=success` sem token na URL.
  - **Alternativa:** o front faz `POST /api/v1/auth/verify-checkout-token` com o token no body, recebe o cookie na resposta, depois navega para `/resources?checkout=success`. Já é o fluxo atual em `use-checkout-token.ts` — o problema é que o token ainda fica na URL até o `history.replaceState`. Garantir que `replaceState` acontece antes de qualquer navegação ou recurso externo carregar.
- Decidir se o token deve autenticar antes ou apenas após pagamento confirmado.
- Se mantiver autenticação antes do pagamento, garantir que autorização Pro dependa de assinatura ativa.
- Considerar incluir `invoiceId` no payload do token para verificação de status pago.
- Avaliar TTL de 10 minutos para PIX — pagamento pode ocorrer depois.

Critérios de aceitação:

- Token não aparece em URL persistida no browser depois que o fluxo conclui.
- Token guest não concede acesso Pro por si só.
- Fluxo PIX guest continua funcionando após confirmação.
- Fluxo cartão guest aprovado autentica e direciona corretamente.
- Fluxo cartão não aprovado não vira sucesso.

Como testar:

- Checkout guest com cartão aprovado — verificar que URL final não contém `token=`.
- Checkout guest com cartão pendente.
- Checkout guest com PIX pago antes do TTL — verificar URL limpa após autenticação.
- Inspecionar access logs ou `Referer` após navegação pós-checkout.

## T7 - Instrumentar funil de checkout e conversão por LP

Estimativa: 1 dia.

Problema:

Hoje não dá para saber qual variante da LP converteu em pagamento confirmado.

Localização técnica:

- `src/app/lp/page.tsx`
- `src/config/ab-tests.ts`
- `src/components/marketing/variants/variant-a.tsx`
- `src/components/marketing/variants/variant-b.tsx`
- `src/components/marketing/variants/variant-c.tsx`
- `src/components/dashboard/billing/checkout-form.tsx`
- `BillingAuditService`
- `PaymentService`
- `WebhookHandler`

O que fazer:

- Propagar `lp_variant` para `/checkout`, por query ou cookie.
- Capturar `lp_variant`, `utm_source`, `utm_medium`, `utm_campaign` no checkout.
- Persistir em audit metadata no início do checkout.
- Persistir ou relacionar os dados ao `invoiceId`.
- No webhook, registrar evento de pagamento confirmado com a mesma atribuição.

Critérios de aceitação:

- Cada checkout iniciado tem `lpVariant` quando veio da LP.
- Cada pagamento confirmado pode ser agrupado por variante.
- É possível calcular `payment_confirmed / lp_view` por variante.

Como testar:

- Acessar `/lp` com cookie `hp_variant=v1`.
- Clicar CTA e verificar query/cookie no checkout.
- Criar checkout e verificar audit metadata.
- Simular webhook e verificar evento final.

## T8 - Fortalecer audit trail transacional

Estimativa: 4 a 6 horas.

Problema:

A auditoria atual existe, mas precisa ser suficiente para reconstruir a jornada do pagamento.

Localização técnica:

- `src/lib/billing/services/payment.service.ts`
- `src/lib/billing/services/webhook.handler.ts`
- `src/lib/billing/services/audit.service.ts`

O que fazer:

- Padronizar eventos:
  - `CHECKOUT_STARTED`
  - `CHECKOUT_PAYMENT_CREATED`
  - `CHECKOUT_PAYMENT_PENDING`
  - `CHECKOUT_PAYMENT_APPROVED`
  - `CHECKOUT_PAYMENT_FAILED`
  - `CHECKOUT_WEBHOOK_RECEIVED`
- Incluir `userId`, `invoiceId`, `asaasPaymentId`, `asaasSubscriptionId`, `planId`, `paymentMethod`, `status`, `lpVariant`.

Critérios de aceitação:

- Um pagamento pode ser rastreado do início até webhook.
- Eventos duplicados de webhook continuam idempotentes.
- Logs não contêm dados sensíveis de cartão.

Como testar:

- Criar checkout de PIX.
- Criar checkout de cartão.
- Simular webhook duplicado.
- Confirmar que não há PAN, CVV ou dados sensíveis no audit metadata.

## T9 - Adicionar testes de regressão do checkout

Estimativa: 1 dia.

Problema:

O fluxo é crítico e precisa de testes focados em estado de pagamento.

Localização técnica:

- Testes existentes a confirmar.
- `src/lib/billing/services/payment.service.ts`
- `src/lib/billing/services/webhook.handler.ts`
- `src/components/dashboard/billing/checkout-form.tsx`

O que fazer:

- Testar classificação de status.
- Testar que cartão não pago não redireciona.
- Testar que webhook ativa assinatura em `PAYMENT_RECEIVED` e `PAYMENT_CONFIRMED`.
- Testar idempotência de webhook duplicado.
- Testar que respostas públicas não vazam detalhes internos em produção.
- Testar rate limit dos endpoints transacionais, se houver helper testável.

Critérios de aceitação:

- Build passa.
- Testes cobrem status pago e não pago.
- Cenário de webhook duplicado não ativa ou duplica efeitos indevidos.

Comandos:

```bash
npm run build
```

Se houver suite de testes configurada, executar também o comando correspondente.

## T10 - Auditoria de XSS e supply chain na página de checkout

Estimativa: 3 a 5 horas.

Problema:

GTM excluído da rota `/checkout` elimina uma superfície, mas não é a única. Se existir qualquer XSS no app — em componentes carregados na página de checkout, em dependências de terceiros ou em campos de texto próximos ao formulário — um script injetado pode ler `ccNumber`, `ccv` e outros campos diretamente do DOM antes do submit, sem passar pelo GTM.

Esse risco existe independentemente de manter cartão cru ou migrar para hosted checkout.

O que fazer:

- Mapear todas as dependências JavaScript carregadas na rota `/checkout`:
  - Scripts de terceiros diretos (além do GTM).
  - Pacotes npm que renderizam na página de checkout com acesso ao DOM.
- Verificar se campos de cartão têm `autocomplete` configurado corretamente para não persistir em keystroke loggers de extensões.
- Revisar se há output de dados do usuário renderizado sem escape próximo ao formulário (possíveis pontos de XSS refletido).
- Executar `npm audit` e verificar vulnerabilidades críticas em dependências do checkout.
- Confirmar que CSP (Content Security Policy) está configurada e bloqueia inline scripts e origens não autorizadas na rota `/checkout`. Verificar em `next.config` ou headers do Vercel.

Critérios de aceitação:

- Lista de scripts de terceiros na página de checkout está documentada e justificada.
- `npm audit` não retorna vulnerabilidades críticas em dependências que afetam o checkout.
- CSP existe e cobre a rota `/checkout`, ou há decisão documentada de por que não é viável.
- Nenhum dado de input do usuário é renderizado sem escape em componentes do checkout.

Como testar:

- Abrir DevTools → Network → filtrar por `script` na rota `/checkout` e listar origens.
- Executar `npm audit --audit-level=critical`.
- Verificar response headers de `/checkout` para `Content-Security-Policy`.
- Inspecionar componentes do formulário por uso de `dangerouslySetInnerHTML` ou `innerHTML`.
