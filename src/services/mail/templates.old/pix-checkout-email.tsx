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
  Font,
} from '@react-email/components'
import { pretty, render } from '@react-email/render'
import * as React from 'react'
import { emailColors } from './email-colors'

interface PixCheckoutEmailProps {
  name?: string
  amount: string
  pixPayload: string
  pixImage?: string // base64
  expirationDate: string
  paymentUrl: string
}

export const PixCheckoutEmail = ({
  name = 'Professor(a)',
  amount,
  pixPayload,
  pixImage,
  expirationDate,
  paymentUrl,
}: PixCheckoutEmailProps) => {
  return (
    <Html>
      <Head>
        <Font
            fontFamily="Fraunces"
            fallbackFontFamily="Georgia"
            webFont={{
                url: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&display=swap',
                format: 'woff2',
            }}
            fontWeight={500}
            fontStyle="normal"
        />
        <Font
            fontFamily="Instrument Sans"
            fallbackFontFamily="Arial"
            webFont={{
                url: 'https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,500&display=swap',
                format: 'woff2',
            }}
            fontWeight={400}
            fontStyle="normal"
        />
         <Font
            fontFamily="JetBrains Mono"
            fallbackFontFamily="monospace"
            webFont={{
                url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@600&display=swap',
                format: 'woff2',
            }}
            fontWeight={600}
            fontStyle="normal"
        />
      </Head>
      <Preview>🔐 Seu código PIX exclusivo está pronto - Kadernim</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerTitle}>Kadernim <em>·</em></Text>
            <Text style={headerSubtitle}>Seu acesso está a um passo!</Text>
            <div style={headerDivider} />
          </Section>

          <Section style={content}>
            <Text style={greeting}>Olá, <strong>{name}</strong>!</Text>

            <Text style={paragraph}>
              Seu código PIX foi gerado com sucesso. Use as opções abaixo para concluir seu pagamento com segurança:
            </Text>

            {pixImage && (
              <Section style={qrSection}>
                <Text style={qrLabel}>📱 Escaneie com o app do seu Banco</Text>
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
               <Text style={payloadTitle}>🔐 Ou use o código PIX Copia e Cola:</Text>
               <div style={payloadCodeBox}>
                    <Text style={payloadCode}>{pixPayload}</Text>
               </div>
            </Section>

            <Hr style={hr} />

            <Section style={detailsBox}>
               <Text style={detailItem}>💰 <strong>Valor Total:</strong> {amount}</Text>
               <Text style={detailItem}>⏰ <strong>Data de Vencimento:</strong> {expirationDate}</Text>
            </Section>

            <Section style={ctaContainer}>
              <Link href={paymentUrl} style={ctaButton}>
                Concluir no Site
              </Link>
            </Section>

            <Hr style={hr} />

            <Section style={instructionBox}>
              <Text style={instructionTitle}>Passo a passo para pagar:</Text>
              <Text style={instructionItem}>1. Abra o aplicativo do seu banco preferido.</Text>
              <Text style={instructionItem}>2. Na área PIX, escolha "Pagar via QR Code" ou "Copia e Cola".</Text>
              <Text style={instructionItem}>3. Finalize o pagamento para liberar seu acesso imediatamente.</Text>
            </Section>

            <Hr style={hr} />

            <Section style={supportBox}>
              <Text style={supportTitle}>Dúvidas sobre o material?</Text>
              <Text style={supportText}>
                📞 WhatsApp: <Link href="https://wa.me/5561998698704" style={linkStyleSupport}>(61) 99869-8704</Link>
              </Text>
              <Text style={supportText}>
                ✉️ E-mail: <Link href="mailto:contato@kadernim.com.br" style={linkStyleSupport}>contato@kadernim.com.br</Link>
              </Text>
            </Section>

            <div style={footerDivider} />

            <Text style={footer}>© {new Date().getFullYear()} Kadernim. Qualidade docente levada a sério.</Text>
            <Text style={footerSmall}>Este é um e-mail de serviço. Por favor, não responda.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export async function generatePixCheckoutEmail({
  name = 'Professor(a)',
  amount,
  pixPayload,
  pixImage,
  expirationDate,
  paymentUrl,
}: PixCheckoutEmailProps) {
  const subject = '🔐 Seu código PIX está pronto - Kadernim Pro'

  const text = [
    `Olá, ${name}!`,
    '',
    `Seu código PIX está disponível para garantir seu acesso ao Kadernim.`,
    '',
    `💰 Valor: ${amount}`,
    `⏰ Vencimento: ${expirationDate}`,
    '',
    `Código PIX (Copia e Cola):`,
    pixPayload,
    '',
    `Link direto para o checkout: ${paymentUrl}`,
    '',
    'Como pagar:',
    '1. Abra o app do seu banco',
    '2. Vá em PIX',
    '3. Escaneie o QR Code ou cole o código',
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

// Styles
const main = {
  backgroundColor: emailColors.background.page,
  fontFamily: '"Instrument Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  padding: '24px 0',
}

const container = {
    margin: '0 auto',
    backgroundColor: emailColors.background.card,
    border: `1px solid ${emailColors.border.default}`,
    borderRadius: '16px',
    maxWidth: '600px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(43, 38, 32, 0.05)',
}

const header = {
    padding: '48px 40px 10px',
    textAlign: 'center' as const,
}

const headerTitle = {
    color: emailColors.text.primary,
    margin: '0',
    fontSize: '32px',
    fontFamily: '"Fraunces", Georgia, serif',
    fontWeight: '500',
    fontStyle: 'italic',
}

const headerSubtitle = {
    color: emailColors.text.muted,
    margin: '4px 0 0 0',
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    fontWeight: '600',
}

const headerDivider = {
    margin: '24px auto 0',
    width: '40px',
    height: '2px',
    backgroundColor: emailColors.primary.main,
}

const content = {
  padding: '40px 40px',
}

const greeting = {
  fontSize: '18px',
  color: emailColors.text.primary,
  margin: '0 0 16px 0',
  lineHeight: '1.4',
  fontFamily: '"Fraunces", Georgia, serif',
  fontWeight: '500',
}

const paragraph = {
  fontSize: '16px',
  color: emailColors.text.primary,
  margin: '0 0 24px 0',
  lineHeight: '1.6',
}

const qrSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
  padding: '24px',
  background: emailColors.background.muted,
  borderRadius: '16px',
  border: `1px dashed ${emailColors.border.default}`,
}

const qrLabel = {
  fontSize: '14px',
  color: emailColors.text.primary,
  fontWeight: '600',
  margin: '0 0 16px 0',
}

const qrImage = {
  display: 'block',
  margin: '0 auto',
  border: `4px solid ${emailColors.background.card}`,
  borderRadius: '8px',
}

const payloadSection = {
  margin: '32px 0 24px',
}

const payloadTitle = {
  fontSize: '16px',
  color: emailColors.text.primary,
  fontWeight: '600',
  margin: '0 0 12px 0',
  fontFamily: '"Fraunces", Georgia, serif',
}

const payloadCodeBox = {
    backgroundColor: emailColors.background.page,
    border: `1px solid ${emailColors.border.light}`,
    borderRadius: '12px',
    padding: '16px',
}

const payloadCode = {
  fontSize: '11px',
  color: emailColors.text.secondary,
  fontFamily: '"JetBrains Mono", monospace',
  wordBreak: 'break-all' as const,
  lineHeight: '1.6',
  margin: '0',
}

const hr = {
    borderColor: emailColors.border.light,
    margin: '32px 0',
}

const detailsBox = {
    background: emailColors.status.success.background,
    border: `1px solid ${emailColors.status.success.border}`,
    borderRadius: '12px',
    padding: '20px',
    margin: '0 0 24px 0',
}

const detailItem = {
    fontSize: '14px',
    color: emailColors.status.success.text,
    margin: '6px 0',
}

const ctaContainer = {
  textAlign: 'center' as const,
  margin: '40px 0',
}

const ctaButton = {
  backgroundColor: emailColors.primary.main,
  color: '#ffffff',
  padding: '16px 40px',
  borderRadius: '999px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '16px',
  display: 'inline-block',
  boxShadow: '0 4px 6px rgba(217, 119, 87, 0.2)',
}

const instructionBox = {
    background: emailColors.background.muted,
    border: `1px solid ${emailColors.border.light}`,
    borderRadius: '12px',
    padding: '24px',
    margin: '0 0 24px 0',
}

const instructionTitle = {
    fontSize: '16px',
    color: emailColors.text.primary,
    fontWeight: '600',
    margin: '0 0 12px 0',
    fontFamily: '"Fraunces", Georgia, serif',
}

const instructionItem = {
    fontSize: '14px',
    color: emailColors.text.secondary,
    margin: '8px 0',
    lineHeight: '1.5',
}

const supportBox = {
    background: emailColors.background.muted,
    borderRadius: '12px',
    padding: '24px',
    margin: '0 0 24px 0',
    border: `1px solid ${emailColors.border.light}`,
}

const supportTitle = {
    fontSize: '16px',
    color: emailColors.text.primary,
    fontWeight: '600',
    fontFamily: '"Fraunces", Georgia, serif',
    margin: '0 0 8px 0',
}

const supportText = {
    fontSize: '13px',
    color: emailColors.text.secondary,
    margin: '4px 0',
    lineHeight: '1.5',
}

const linkStyleSupport = {
    color: emailColors.primary.main,
    fontWeight: '600',
}

const footerDivider = {
    margin: '40px 0 24px 0',
    borderTop: `1px dashed ${emailColors.border.default}`,
}

const footer = {
  fontSize: '13px',
  color: emailColors.text.muted,
  textAlign: 'center' as const,
  margin: '0 0 8px 0',
  fontWeight: '500',
}

const footerSmall = {
  fontSize: '11px',
  color: emailColors.text.muted,
  textAlign: 'center' as const,
  margin: '0',
}

