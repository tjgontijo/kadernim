import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { pretty, render } from '@react-email/render'
import * as React from 'react'

interface PixCheckoutEmailProps {
  name?: string
  amount: string
  pixPayload: string
  pixImage?: string // base64
  expirationDate: string
  paymentUrl: string
}

export const PixCheckoutEmail = ({
  name = 'Usuário',
  amount,
  pixPayload,
  pixImage,
  expirationDate,
  paymentUrl,
}: PixCheckoutEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>🔐 Seu código PIX está pronto - Kadernim</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerTitle}>Kadernim Pro</Text>
            <Text style={headerSubtitle}>Seu código PIX está pronto!</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Olá {name},</Text>

            <Text style={paragraph}>
              Seu código PIX foi gerado com sucesso! Escolha a opção mais fácil para você pagar:
            </Text>

            {pixImage && (
              <Section style={qrSection}>
                <Text style={qrTitle}>📱 Escaneie este QR Code</Text>
                <Img
                  src={`data:image/png;base64,${pixImage}`}
                  alt="QR Code PIX"
                  width="200"
                  height="200"
                  style={qrImage}
                />
              </Section>
            )}

            <Section style={payloadSection}>
              <Text style={payloadTitle}>🔐 OU copie o código PIX (Copia e Cola)</Text>
              <Text style={payloadCode}>{pixPayload}</Text>
            </Section>

            <Hr style={hr} />

            <Section style={detailsBox}>
              <Text style={detailItem}>💰 <strong>Valor:</strong> {amount}</Text>
              <Text style={detailItem}>⏰ <strong>Válido até:</strong> {expirationDate}</Text>
            </Section>

            <Section style={ctaContainer}>
              <Link href={paymentUrl} style={ctaButton}>
                VOLTAR AO CHECKOUT
              </Link>
            </Section>

            <Hr style={hr} />

            <Section style={instructionBox}>
              <Text style={instructionTitle}>Como pagar:</Text>
              <Text style={instructionItem}>1️⃣ Abra o app do seu banco</Text>
              <Text style={instructionItem}>2️⃣ Escolha a opção PIX</Text>
              <Text style={instructionItem}>3️⃣ Escaneie o QR Code ou cole o código</Text>
              <Text style={instructionItem}>4️⃣ Confirme o pagamento ✅</Text>
            </Section>

            <Hr style={hr} />

            <Section style={supportBox}>
              <Text style={supportTitle}>Precisa de ajuda?</Text>
              <Text style={supportText}>
                📞 WhatsApp: <Link href="https://wa.me/556198698704" style={linkStyle}>+55 61 9869-8704</Link>
              </Text>
              <Text style={supportText}>
                ✉️ Email: <Link href="mailto:suporte@kadernim.com.br" style={linkStyle}>suporte@kadernim.com.br</Link>
              </Text>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>© 2025 Kadernim. Todos os direitos reservados.</Text>
            <Text style={footerSmall}>Este é um email automático. Por favor, não responda.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export async function generatePixCheckoutEmail({
  name = 'Usuário',
  amount,
  pixPayload,
  pixImage,
  expirationDate,
  paymentUrl,
}: PixCheckoutEmailProps) {
  const subject = '🔐 Seu código PIX está pronto - Kadernim Pro'

  const text = [
    `Olá ${name}!`,
    '',
    `Seu código PIX está pronto para pagar sua assinatura Kadernim Pro.`,
    '',
    `💰 Valor: ${amount}`,
    `⏰ Válido até: ${expirationDate}`,
    '',
    `Código PIX (Copia e Cola):`,
    pixPayload,
    '',
    `Ou acesse o checkout: ${paymentUrl}`,
    '',
    'Como pagar:',
    '1. Abra o app do seu banco',
    '2. Escolha PIX',
    '3. Escaneie o QR Code ou cole o código',
    '4. Confirme o pagamento',
    '',
    'Suporte:',
    'WhatsApp: +55 61 9869-8704',
    'Email: suporte@kadernim.com.br',
  ].join('\n')

  const htmlRaw = await render(
    React.createElement(PixCheckoutEmail, {
      name,
      amount,
      pixPayload,
      pixImage,
      expirationDate,
      paymentUrl,
    })
  )
  const html = await pretty(htmlRaw)

  return { subject, text, html }
}

const main = {
  backgroundColor: '#f9fafb',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const header = {
  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
  padding: '40px 20px',
  textAlign: 'center' as const,
  borderRadius: '8px 8px 0 0',
}

const headerTitle = {
  color: '#ffffff',
  margin: '0',
  fontSize: '28px',
  fontWeight: 'bold' as const,
}

const headerSubtitle = {
  color: '#a7f3d0',
  margin: '8px 0 0 0',
  fontSize: '14px',
}

const content = {
  background: '#ffffff',
  padding: '40px 30px',
  borderRadius: '0 0 8px 8px',
}

const greeting = {
  fontSize: '16px',
  color: '#1f2937',
  margin: '0 0 24px 0',
}

const paragraph = {
  fontSize: '15px',
  color: '#374151',
  margin: '0 0 24px 0',
  lineHeight: '1.6',
}

const qrSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
  padding: '20px',
  background: '#f9fafb',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
}

const qrTitle = {
  fontSize: '15px',
  color: '#374151',
  fontWeight: 'bold' as const,
  margin: '0 0 16px 0',
}

const qrImage = {
  display: 'block',
  margin: '0 auto',
}

const payloadSection = {
  margin: '24px 0',
}

const payloadTitle = {
  fontSize: '15px',
  color: '#374151',
  fontWeight: 'bold' as const,
  margin: '0 0 12px 0',
}

const payloadCode = {
  fontSize: '11px',
  color: '#374151',
  background: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  padding: '12px',
  fontFamily: 'monospace',
  wordBreak: 'break-all' as const,
  lineHeight: '1.6',
  margin: '0',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const detailsBox = {
  background: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '6px',
  padding: '16px',
  margin: '0 0 24px 0',
}

const detailItem = {
  fontSize: '14px',
  color: '#166534',
  margin: '4px 0',
}

const ctaContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const ctaButton = {
  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold' as const,
  fontSize: '16px',
  display: 'inline-block',
}

const instructionBox = {
  background: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: '6px',
  padding: '16px',
  margin: '0 0 24px 0',
}

const instructionTitle = {
  fontSize: '15px',
  color: '#1e40af',
  fontWeight: 'bold' as const,
  margin: '0 0 12px 0',
}

const instructionItem = {
  fontSize: '14px',
  color: '#1d4ed8',
  margin: '8px 0',
}

const supportBox = {
  background: '#eef2ff',
  borderRadius: '6px',
  padding: '16px',
  margin: '0 0 24px 0',
}

const supportTitle = {
  fontSize: '15px',
  color: '#312e81',
  fontWeight: 'bold' as const,
  margin: '0 0 8px 0',
}

const supportText = {
  fontSize: '13px',
  color: '#4338ca',
  margin: '4px 0',
}

const linkStyle = {
  color: '#4338ca',
  fontWeight: 'bold' as const,
}

const footer = {
  fontSize: '12px',
  color: '#9ca3af',
  textAlign: 'center' as const,
  margin: '0 0 8px 0',
}

const footerSmall = {
  fontSize: '12px',
  color: '#9ca3af',
  textAlign: 'center' as const,
  margin: '0',
}
