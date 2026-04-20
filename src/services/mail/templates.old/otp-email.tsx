import {
  Body,
  Container,
  Font,
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
    <Preview>🔐 Seu código de segurança - Kadernim</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Text style={headerTitle}>Kadernim <em>·</em></Text>
          <Text style={headerSubtitle}>Recursos de Elite para Professores</Text>
          <div style={headerDivider} />
        </Section>

        {/* Content */}
        <Section style={content}>
          <Text style={greeting}>
            Olá, <strong>{name}</strong>!
          </Text>

          <Text style={paragraph}>
            Aqui está seu código de verificação para acessar sua conta com segurança no Kadernim:
          </Text>

          {/* OTP Display */}
          <Section style={codeContainer}>
            <div style={codeBox}>
              <Text style={codeText}>{otp}</Text>
            </div>
          </Section>

          <Text style={expirationMessage}>
            Este código expira em breve, em <strong>{expiresIn} minutos</strong>.
          </Text>

          <Hr style={hr} />

          {/* Warning */}
          <Section style={warningBox}>
            <Text style={warningText}>
              <strong>⏰ Aviso:</strong> Se você não solicitou este código, por favor ignore este e-mail. Nenhuma ação será tomada na sua conta.
            </Text>
          </Section>

          {/* Security Notice */}
          <Text style={securityText}>
            🔒 <strong>Segurança:</strong> Jamais forneça este código a terceiros. Nossa equipe nunca entrará em contato pedindo seu código de segurança.
          </Text>

          {/* Support */}
          <Section style={supportBox}>
            <Text style={supportTitle}>Portal do Professor</Text>
            <Text style={supportText}>
              📞 WhatsApp: <Link href="https://wa.me/556198698704" style={linkStyleSupport}>(61) 99869-8704</Link>
            </Text>
            <Text style={supportText}>
              ✉️ E-mail: <Link href="mailto:contato@kadernim.com.br" style={linkStyleSupport}>contato@kadernim.com.br</Link>
            </Text>
          </Section>

          <div style={footerDivider} />

          {/* Footer */}
          <Text style={footer}>
            © {new Date().getFullYear()} Kadernim. Qualidade editorial em cada página.
          </Text>
          <Text style={footerSmall}>
            Este é um comunicado automático de segurança.
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
  const subject = '🔐 Seu código de acesso - Kadernim'

  const text = [
    `Olá, ${name}!`,
    '',
    `Seu código de acesso ao Kadernim é: ${otp}`,
    '',
    `Este código é válido por ${expiresIn} minutos. Mantenha-o em segurança.`,
    '',
    'Precisa de ajuda?',
    'WhatsApp: (61) 99869-8704',
    'E-mail: contato@kadernim.com.br',
  ].join('\n')

  const htmlRaw = await render(
    React.createElement(OtpEmail, { name, otp, expiresIn })
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

const codeContainer = {
  textAlign: 'center' as const,
  margin: '32px 0 40px',
}

const codeBox = {
  border: `1px dashed ${emailColors.primary.main}`,
  background: emailColors.background.muted,
  padding: '20px 48px',
  borderRadius: '12px',
  display: 'inline-block',
}

const codeText = {
  fontSize: '44px',
  fontWeight: '600',
  color: emailColors.text.primary,
  margin: 0,
  letterSpacing: '8px',
  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
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
    borderRadius: '12px',
    padding: '20px',
    margin: '24px 0',
}

const warningText = {
    fontSize: '14px',
    color: emailColors.status.warning.text,
    margin: '0',
    lineHeight: '1.5',
}

const securityText = {
    fontSize: '13px',
    color: emailColors.text.secondary,
    margin: '24px 0',
    lineHeight: '1.6',
}

const supportBox = {
    background: emailColors.background.muted,
    borderRadius: '12px',
    padding: '24px',
    margin: '24px 0',
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
