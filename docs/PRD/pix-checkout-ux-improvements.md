# PRD: PIX Checkout UX Improvements

**Data de Criação:** 2026-04-15  
**Versão:** 1.0  
**Status:** Draft  
**Prioridade:** Média  

---

## 1. Visão Geral

Atualmente, o QR Code PIX é exibido **apenas na tela do navegador**. Se o usuário fechar a aba, perder a internet ou quer pagar de outro device, precisa voltar ao checkout do zero.

Este PRD melhora a experiência permitindo que o usuário receba o QR Code por **email e WhatsApp**, com opção de reenvio.

---

## 2. Problema

### 2.1 Situação Atual
- ❌ QR Code é exibido **só no navegador**
- ❌ Se fechar a aba, **precisa voltar ao checkout**
- ❌ Sem email com código para pagar depois
- ❌ Sem WhatsApp com QR Code para escanear rápido
- ❌ Sem possibilidade de reenvio
- ❌ Usuário quer pagar de outro device (celular)

### 2.2 Impacto
- Taxa de conversão reduzida (abandono por inconveniência)
- Usuários não conseguem pagar porque o QR expirou e fechou browser
- Suporte recebe "perdi meu QR Code"
- Experiência móvel ruim (smartphone → escanear em PC)

### 2.3 Dados Técnicos Atuais
```typescript
// Fluxo atual:
1. Usuário clica "Pagar com PIX"
2. Asaas gera QR Code (payload + imagem base64)
3. Exibido APENAS em checkout-pix-qrcode.tsx
4. Countdown do tempo de expiração
5. Polling a cada 3s para confirmar pagamento

// O QR expira quando:
- Prazo de expiração do Asaas é atingido (duração: vide Asaas docs)
- Usuário fecha a aba / perde internet
- Sessão expira
```

---

## 3. Objetivos

1. **Persistência** - Usuário recebe QR Code por email/WhatsApp
2. **Multi-device** - Pode pagar pelo celular mesmo que abriu no PC
3. **Recuperação** - Se perdeu o QR, consegue reenviar
4. **Segurança** - Código não fica perdido em cache/história
5. **Velocidade** - WhatsApp entrega em segundos

---

## 4. Solução Proposta

### 4.1 Fluxo Melhorado

```
Usuário clica "Pagar com PIX"
         ↓
Asaas gera QR Code (payload + image)
         ↓
┌─────────────────────────────────┐
│ Exibir em tempo real no browser  │ (como hoje)
├─────────────────────────────────┤
│ + Enviar por Email              │ (novo)
│ + Enviar por WhatsApp (15s)     │ (novo)
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│ Usuário pode:                   │
│ - Escanear no PC (QR visual)    │
│ - Copiar código (copia e cola)  │
│ - Usar código do email          │
│ - Escanear no celular           │
│ - Pedir reenvio                 │
└─────────────────────────────────┘
         ↓
Polling confirma pagamento
```

### 4.2 Email com PIX

**Template:** `src/services/mail/templates/pix-checkout-email.tsx`

```
┌─────────────────────────────────────────┐
│ Seu Código PIX está pronto!             │
├─────────────────────────────────────────┤
│                                         │
│ 🔐 CÓDIGO PIX (Copia e Cola):          │
│ [Código em monospace, fácil copiar]    │
│                                         │
│ 📱 OU escaneie este QR Code:           │
│ [QR Code como imagem]                  │
│                                         │
│ 💰 Valor a pagar: R$ 99,90             │
│ ⏰ Válido por: [X minutos]              │
│                                         │
│ [PAGAR AGORA] (link volta ao checkout) │
│                                         │
│ ℹ️ Se o QR expirar, volte ao checkout  │
│ para gerar um novo.                    │
│                                         │
└─────────────────────────────────────────┘
```

### 4.3 WhatsApp com PIX

**Template:** `src/services/whatsapp/template/pix-checkout.ts`

```
Olá {nome}! 👋

Seu código PIX está pronto para pagar sua assinatura Kadernim Pro! 🎉

💰 *Valor:* R$ 99,90

📱 *Escaneie este QR ou copie o código abaixo:*

{QR_CODE_COMO_IMAGEM}

🔐 *Copia e Cola:*
{CODIGO_PIX_MONOSPACE}

⏰ *Válido por: {X minutos}*

🏦 Abra seu app do banco e escolha PIX

❓ Dúvidas? Responda este chat!
```

### 4.4 Endpoint de Reenvio

**POST** `/api/v1/billing/pix-checkout/{invoiceId}/resend`

```typescript
Request:
{
  channel: 'email' | 'whatsapp' // Qual canal reenviar
}

Response:
{
  success: boolean
  message: string
  nextRetryAt?: string // Tempo mínimo até próximo reenvio
}

Regras:
- Max 3 reenvios por hora
- Respeita rate limit por user
- Cada reenvio registra em audit
```

### 4.5 Dados a Persistir

Adicionar campos ao banco para rastrear envios:

```typescript
model Invoice {
  // ... campos existentes ...
  
  // Novo: rastreamento de envios PIX
  pixQrCodePayload: String?           // Código copia e cola
  pixQrCodeImage: String?             // QR Code em base64
  pixExpirationDate: DateTime?        // Quando expira
  pixEmailSentAt: DateTime?           // Email enviado quando
  pixWhatsappSentAt: DateTime?        // WhatsApp enviado quando
  pixResendCount: Int @default(0)     // Quantas vezes reenviou
  pixLastResendAt: DateTime?          // Último reenvio
}
```

---

## 5. User Experience

### 5.1 Cenário 1: Usuário em PC
```
1. Clica "Pagar com PIX"
2. Vê QR Code na tela + código copia e cola
3. Recebe email com mesmo código
4. Pode:
   - Escanear QR visual (PC → câmera)
   - Copiar código na tela
   - Voltar ao email em qualquer hora se fechar aba
   - Reenviar email se perdeu
```

### 5.2 Cenário 2: Usuário em Smartphone
```
1. Clica "Pagar com PIX" (mobile)
2. Vê QR Code (grande, fácil escanear)
3. Recebe WhatsApp com QR (segundos depois)
4. Pode:
   - Escanear QR da tela mesmo no mobile
   - Copiar código
   - Usar WhatsApp que chegou
   - Abrir app do banco diretamente
```

### 5.3 Cenário 3: Perdeu o QR
```
1. Usuário já estava no checkout
2. Fechou a aba / perdeu internet
3. Email dele tem o QR Code
4. WhatsApp dele tem o QR Code
5. Se expirou:
   - Clica "Pagar com PIX" novamente
   - Gera novo QR
   - Envia novo email + WhatsApp
```

---

## 6. Implementação

### 6.1 Fase 1: Email com PIX (5h)

**Arquivos:**
```
src/services/mail/templates/pix-checkout-email.tsx
  └─ Template React Email com QR Code
  
src/services/delivery/types.ts
  └─ Estender com tipo 'pix-checkout'
  
src/services/delivery/get-email.ts
  └─ Adicionar case para 'pix-checkout'
  
src/lib/billing/services/payment.service.ts
  └─ Chamar authDeliveryService.send() após gerar QR
```

**Processo:**
1. Após gerar QR Code no Asaas
2. Chamar `authDeliveryService.send()`
3. Com tipo `pix-checkout`
4. Email é síncrono (< 2s)

### 6.2 Fase 2: WhatsApp com PIX (5h)

**Arquivos:**
```
src/services/whatsapp/template/pix-checkout.ts
  └─ Template WhatsApp com código
  
src/services/delivery/get-whatsapp.ts
  └─ Adicionar case para 'pix-checkout'
```

**Nota:** WhatsApp não suporta QR Code como imagem via UAZAPI
- Enviar código PIX em texto
- Orientar "use app do banco ou link abaixo"
- Link volta ao checkout (mostra QR visual)

### 6.3 Fase 3: Endpoint de Reenvio (6h)

**Arquivos:**
```
src/app/api/v1/billing/pix-checkout/{invoiceId}/resend/route.ts
  └─ Endpoint POST
  
src/lib/billing/services/pix-checkout.service.ts
  └─ Lógica de reenvio (rate limit, etc)
```

**Regras de Rate Limiting:**
- Max 3 reenvios por invoice
- Min 5 min entre reenvios
- Se expirou: gerar novo QR em Asaas

### 6.4 Fase 4: Persistência no Banco (4h)

**Migration Prisma:**
```sql
ALTER TABLE "Invoice" 
  ADD COLUMN "pixQrCodePayload" TEXT,
  ADD COLUMN "pixQrCodeImage" TEXT,
  ADD COLUMN "pixExpirationDate" TIMESTAMP,
  ADD COLUMN "pixEmailSentAt" TIMESTAMP,
  ADD COLUMN "pixWhatsappSentAt" TIMESTAMP,
  ADD COLUMN "pixResendCount" INTEGER DEFAULT 0,
  ADD COLUMN "pixLastResendAt" TIMESTAMP;
```

### 6.5 Timeline Total

| Fase | O Quê | Tempo |
|------|-------|-------|
| 1 | Email com PIX | 5h |
| 2 | WhatsApp com PIX | 5h |
| 3 | Reenvio endpoint | 6h |
| 4 | Persistência BD | 4h |
| **Total** | | **20h** |

---

## 7. Arquitetura Técnica

### 7.1 Fluxo no Payment Service

```typescript
// src/lib/billing/services/payment.service.ts

static async createPixSubscription(params: { ... }) {
  // ... código existente ...
  
  const qrCode = await AsaasClient.get(...)
  const subscription = await upsertCheckoutSubscription(...)
  const invoice = await upsertInvoice({
    pixQrCode: qrCode,
    // ... outros ...
  })

  // ✅ NOVO: Enviar email e WhatsApp
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { email: true, name: true, phone: true }
  })

  void authDeliveryService.send({
    email: user.email,
    type: 'pix-checkout',
    data: {
      pixPayload: qrCode.payload,
      pixImage: qrCode.encodedImage,
      pixExpirationDate: qrCode.expirationDate,
      invoiceId: invoice.id,
      amount: plan.pixAmount,
    },
    channels: ['email', 'whatsapp']
  })

  // Registrar que enviou
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      pixQrCodePayload: qrCode.payload,
      pixQrCodeImage: qrCode.encodedImage,
      pixExpirationDate: qrCode.expirationDate,
      pixEmailSentAt: new Date(),
      pixWhatsappSentAt: new Date(), // será atualizado em 15s
    }
  })

  return {
    subscriptionId: subscription.id,
    invoiceId: invoice.id,
    qrCodePayload: qrCode.payload,
    qrCodeImage: qrCode.encodedImage,
    expirationDate: qrCode.expirationDate,
    amountLabel: formatCheckoutCurrency(plan.pixAmount),
  }
}
```

### 7.2 Email Template

```typescript
// src/services/mail/templates/pix-checkout-email.tsx

interface PixCheckoutEmailProps {
  name: string
  amount: string
  pixPayload: string
  pixImage: string // base64
  expirationDate: string
  paymentUrl: string // link volta ao checkout
}

export const PixCheckoutEmail = ({
  name,
  amount,
  pixPayload,
  pixImage,
  expirationDate,
  paymentUrl,
}: PixCheckoutEmailProps) => (
  <Html>
    <Head />
    <Preview>🔐 Seu código PIX está pronto - Kadernim</Preview>
    <Body>
      <Container>
        <Section>
          <Text>Olá {name},</Text>
          
          <Text>
            Seu código PIX está pronto! Escolha a opção mais fácil para você:
          </Text>

          {/* QR Code */}
          <Section style={{ textAlign: 'center', padding: '20px' }}>
            <Text style={{ marginBottom: '10px', fontWeight: 'bold' }}>
              📱 Escaneie este QR Code
            </Text>
            <div style={{ maxWidth: '200px' }}>
              <img 
                src={`data:image/png;base64,${pixImage}`}
                alt="PIX QR Code"
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          </Section>

          {/* Código Copia e Cola */}
          <Section>
            <Text style={{ marginTop: '20px', fontWeight: 'bold' }}>
              🔐 OU copie este código PIX (Copia e Cola)
            </Text>
            <div style={{
              backgroundColor: '#f5f5f5',
              padding: '15px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              userSelect: 'all'
            }}>
              {pixPayload}
            </div>
          </Section>

          {/* Detalhes */}
          <Section style={{ marginTop: '20px' }}>
            <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <p><strong>💰 Valor:</strong> {amount}</p>
              <p><strong>⏰ Válido por:</strong> {expirationDate}</p>
            </div>
          </Section>

          {/* CTA */}
          <Section style={{ marginTop: '20px', textAlign: 'center' }}>
            <a href={paymentUrl} style={{
              display: 'inline-block',
              backgroundColor: '#059669',
              color: 'white',
              padding: '12px 30px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>
              VOLTAR AO CHECKOUT
            </a>
          </Section>

          <Text style={{ marginTop: '30px', fontSize: '12px', color: '#666' }}>
            Abra seu app do banco, escolha PIX e pronto! ✅
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)
```

### 7.3 Reenvio Endpoint

```typescript
// src/app/api/v1/billing/pix-checkout/{invoiceId}/resend/route.ts

export async function POST(
  request: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { channel } = await request.json()

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.invoiceId },
    include: { user: true, subscription: true }
  })

  if (!invoice || invoice.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Rate limiting
  if (invoice.pixResendCount >= 3) {
    return NextResponse.json(
      { error: 'Maximum resendings reached' },
      { status: 429 }
    )
  }

  const lastResend = invoice.pixLastResendAt
    ? new Date(invoice.pixLastResendAt).getTime()
    : 0
  const now = Date.now()
  
  if (now - lastResend < 5 * 60 * 1000) { // 5 min
    return NextResponse.json(
      { error: 'Too soon. Try again in 5 minutes' },
      { status: 429 }
    )
  }

  // Se expirou, gerar novo QR
  let pixPayload = invoice.pixQrCodePayload
  let pixImage = invoice.pixQrCodeImage
  let pixExpirationDate = invoice.pixExpirationDate

  if (new Date() > new Date(pixExpirationDate!)) {
    // Gerar novo QR no Asaas
    const newQrCode = await AsaasClient.get(
      `/payments/${invoice.asaasId}/pixQrCode`
    )
    pixPayload = newQrCode.payload
    pixImage = newQrCode.encodedImage
    pixExpirationDate = newQrCode.expirationDate
  }

  // Enviar
  if (channel === 'email' || channel === 'both') {
    await authDeliveryService.send({
      email: invoice.user.email,
      type: 'pix-checkout',
      data: {
        pixPayload,
        pixImage,
        pixExpirationDate: pixExpirationDate!,
        invoiceId: invoice.id,
        amount: formatCheckoutCurrency(invoice.value),
      },
      channels: ['email']
    })
  }

  if (channel === 'whatsapp' || channel === 'both') {
    await authDeliveryService.send({
      email: invoice.user.email,
      type: 'pix-checkout',
      data: {
        pixPayload,
        pixImage,
        pixExpirationDate: pixExpirationDate!,
        invoiceId: invoice.id,
        amount: formatCheckoutCurrency(invoice.value),
      },
      channels: ['whatsapp']
    })
  }

  // Atualizar contador
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      pixResendCount: { increment: 1 },
      pixLastResendAt: new Date(),
    }
  })

  return NextResponse.json({
    success: true,
    message: 'QR Code reenviado com sucesso',
    nextRetryAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
  })
}
```

---

## 8. Critério de Aceitação

### Quando DONE?

1. **Email:** Usuário recebe email com QR + código copia e cola em < 5s
2. **WhatsApp:** Usuário recebe WhatsApp em 15s (async)
3. **Reenvio:** Botão "reenviar" funciona, respeita rate limit
4. **Persistência:** QR Code armazenado no banco
5. **Audit:** Todos os envios registrados em `pixEmailSentAt`, `pixWhatsappSentAt`, etc
6. **Testes:** Coverage >80%, manual testing OK

---

## 9. Riscos

| Risco | Mitigação |
|-------|-----------|
| Email rejeitado | Fallback para WhatsApp |
| WhatsApp falha (sem phone) | Email como primário |
| QR expirou | Gerar novo via Asaas |
| Reenvio loop | Rate limit (max 3x, 5min entre) |
| Banco lotado | Adicionar índices em `pixEmailSentAt`, `pixLastResendAt` |

---

## 10. Métricas de Sucesso

- ⬆️ **Conversão +15%** (menos abandono)
- ⬇️ **Suporte -20%** ("perdi meu QR")
- ✅ **Email delivery 99%+** (via Resend)
- ✅ **WhatsApp delivery 95%+** (UAZAPI)
- 📊 **0 emails rejeitados por spam** (boas práticas)

---

## 11. Próximos Passos

1. **Revisar** este PRD
2. **Aprovar** ou ajustar scope
3. **Implementar** na ordem: Email → WhatsApp → Reenvio → BD
4. **Testar** com sandbox Asaas
5. **Deploy** com feature flag (opt-in primeiro)

---

**Pronto para Implementação! 🚀**
