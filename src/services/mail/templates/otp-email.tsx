import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { pretty, render } from '@react-email/render'
import * as React from 'react'
import { emailColors } from './email-colors'

interface OtpEmailProps {
  name?: string
  otp: string
  expiresIn?: number
}

export const OtpEmail = ({
  name = 'Professor(a)',
  otp,
  expiresIn = 5,
}: OtpEmailProps) => (
  <Html>
    <Head />
    <Preview>🔐 Seu código de segurança - Kadernim</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Text style={headerTitle}>Kadernim</Text>
          <Text style={headerSubtitle}>Segurança do Professor</Text>
        </Section>

        {/* Content */}
        <Section style={content}>
          <Text style={greeting}>
            Olá, <strong>{name}</strong>!
          </Text>

          <Text style={paragraph}>
            Aqui está seu código de verificação para acessar sua conta no Kadernim:
          </Text>

          {/* OTP Display */}
          <Section style={codeContainer}>
            <div style={codeBox}>
              <Text style={codeText}>{otp}</Text>
            </div>
          </Section>

          <Text style={expirationMessage}>
            Este código expira em <strong>{expiresIn} minutos</strong>.
          </Text>

          <Hr style={hr} />

          {/* Warning */}
          <Section style={warningBox}>
            <Text style={warningText}>
              <strong>Aviso:</strong> Se você não solicitou este código, por favor ignore este e-mail.
            </Text>
          </Section>

          {/* Support */}
          <Section style={supportBox}>
            <Text style={supportTitle}>Suporte</Text>
            <Text style={supportText}>
              WhatsApp: <Link href="https://wa.me/556198698704" style={linkStyleSupport}>(61) 9869-8704</Link>
            </Text>
            <Text style={supportText}>
              E-mail: <Link href="mailto:contato@kadernim.com.br" style={linkStyleSupport}>contato@kadernim.com.br</Link>
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Text style={footer}>
            © {new Date().getFullYear()} Kadernim. Brasília - DF.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default OtpEmail

export async function generateOtpEmail({
  name = 'Professor(a)',
  otp,
  expiresIn = 5,
}: OtpEmailProps) {
  const subject = `🔐 ${otp} é seu código de segurança - Kadernim`

  const text = [
    `Olá, ${name}!`,
    '',
    `Seu código de acesso ao Kadernim é: ${otp}`,
    '',
    `Este código é válido por ${expiresIn} minutos.`,
    '',
    'Suporte:',
    'WhatsApp: (61) 99869-8704',
    'E-mail: contato@kadernim.com.br',
  ].join('\n')

  const htmlRaw = await render(
    React.createElement(OtpEmail, { name, otp, expiresIn })
  )
  const html = await pretty(htmlRaw)

  return { subject, text, html }
}

// Styles (Otimizados para entrega)
const main = {
  backgroundColor: emailColors.background.page,
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
  padding: '20px 0',
}

const container = {
    margin: '0 auto',
    backgroundColor: emailColors.background.card,
    border: `1px solid ${emailColors.border.default}`,
    borderRadius: '8px',
    maxWidth: '600px',
}

const header = {
    padding: '32px 40px 0px',
    textAlign: 'center' as const,
}

const headerTitle = {
    color: emailColors.text.primary,
    margin: '0',
    fontSize: '28px',
    fontWeight: 'bold' as const,
}

const headerSubtitle = {
    color: emailColors.text.muted,
    margin: '4px 0 0 0',
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
}

const content = {
  padding: '32px 40px',
}

const greeting = {
  fontSize: '18px',
  color: emailColors.text.primary,
  margin: '0 0 16px 0',
  fontWeight: 'bold' as const,
}

const paragraph = {
  fontSize: '16px',
  color: emailColors.text.primary,
  margin: '0 0 24px 0',
  lineHeight: '1.5',
}

const codeContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const codeBox = {
  border: `1px dashed ${emailColors.primary.main}`,
  background: emailColors.background.muted,
  padding: '20px 40px',
  borderRadius: '8px',
  display: 'inline-block',
}

const codeText = {
  fontSize: '40px',
  fontWeight: 'bold',
  color: emailColors.text.primary,
  margin: 0,
  letterSpacing: '8px',
  fontFamily: 'ui-monospace, Menlo, Monaco, "Cascadia Mono", "Segoe UI Mono", "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace", "Source Code Pro", "Fira Mono", "Droid Sans Mono", "Courier New", monospace',
}

const expirationMessage = {
  fontSize: '14px',
  color: emailColors.text.muted,
  margin: '24px 0',
  textAlign: 'center' as const,
}

const hr = {
    borderColor: emailColors.border.light,
    margin: '32px 0',
}

const warningBox = {
    background: emailColors.status.warning.background,
    border: `1px solid ${emailColors.status.warning.border}`,
    borderRadius: '8px',
    padding: '16px',
    margin: '24px 0',
}

const warningText = {
    fontSize: '13px',
    color: emailColors.status.warning.text,
    margin: '0',
}

const supportBox = {
    background: emailColors.background.muted,
    borderRadius: '8px',
    padding: '20px',
    margin: '24px 0',
}

const supportTitle = {
    fontSize: '15px',
    color: emailColors.text.primary,
    fontWeight: 'bold' as const,
    margin: '0 0 8px 0',
}

const supportText = {
    fontSize: '13px',
    color: emailColors.text.secondary,
    margin: '4px 0',
}

const linkStyleSupport = {
    color: emailColors.primary.main,
    fontWeight: 'bold' as const,
    textDecoration: 'none',
}

const footer = {
  fontSize: '12px',
  color: emailColors.text.muted,
  textAlign: 'center' as const,
  margin: '0',
}
