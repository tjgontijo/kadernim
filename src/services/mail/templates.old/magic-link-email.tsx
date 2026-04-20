import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Font,
} from '@react-email/components'
import { pretty, render } from '@react-email/render'
import * as React from 'react'
import { emailColors } from './email-colors'

interface MagicLinkEmailProps {
  name?: string
  magicLink: string
  expiresIn?: number
}

export const MagicLinkEmail = ({
  name = 'Professor(a)',
  magicLink,
  expiresIn = 20,
}: MagicLinkEmailProps) => (
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
    </Head>
    <Preview>🔐 Seu link de acesso exclusivo - Kadernim</Preview>
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
            Recebemos uma solicitação de acesso para sua conta. Para entrar com segurança, basta clicar no botão abaixo:
          </Text>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Button style={button} href={magicLink}>
              Acessar Minha Conta
            </Button>
          </Section>

          {/* Alternative Link */}
          <Text style={alternativeLink}>
            Ou, se preferir, copie e cole este link no seu navegador:
          </Text>
          <Section style={linkContainer}>
            <Link href={magicLink} style={linkStyle}>
                {magicLink}
            </Link>
          </Section>

          <Hr style={hr} />

          {/* Expiration Notice */}
          <Section style={warningBox}>
             <Text style={warningText}>
              <strong>⏰ Tempo Restante:</strong> Este link é temporário e expira em <strong>{expiresIn} minutos</strong>. Se você não solicitou este acesso, sua conta permanece segura e você pode ignorar este e-mail.
            </Text>
          </Section>

          {/* Security Notice */}
          <Text style={securityText}>
            🔒 <strong>Dica de Segurança:</strong> Nunca compartilhe este link. O acesso por link é pessoal e intransferível.
          </Text>

          <Section style={supportBox}>
            <Text style={supportTitle}>Suporte ao Professor</Text>
            <Text style={supportText}>
              📞 WhatsApp: <Link href="https://wa.me/5561998698704" style={linkStyleSupport}>(61) 99869-8704</Link>
            </Text>
            <Text style={supportText}>
              ✉️ E-mail: <Link href="mailto:contato@kadernim.com.br" style={linkStyleSupport}>contato@kadernim.com.br</Link>
            </Text>
          </Section>

          <div style={footerDivider} />

          {/* Footer */}
          <Text style={footer}>
            © {new Date().getFullYear()} Kadernim. Feito para inspirar a educação.
          </Text>
          <Text style={footerSmall}>
            Este é um comunicado automático enviado pelo sistema.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

export async function generateMagicLinkEmail({
  name = 'Professor(a)',
  magicLink,
  expiresIn = 20,
}: MagicLinkEmailProps) {
  const subject = '🔐 Seu link de acesso - Kadernim'

  const text = [
    `Olá, ${name}!`,
    '',
    `Use o link a seguir para acessar sua conta no Kadernim: ${magicLink}`,
    '',
    `Este link expira em ${expiresIn} minutos. Não compartilhe com ninguém por segurança.`,
    '',
    'Precisa de ajuda?',
    'WhatsApp: (61) 99869-8704',
    'E-mail: contato@kadernim.com.br',
  ].join('\n')

  const htmlRaw = await render(
    React.createElement(MagicLinkEmail, { name, magicLink, expiresIn })
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

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0 40px',
}

const button = {
  backgroundColor: emailColors.primary.main,
  color: '#ffffff',
  padding: '16px 40px',
  borderRadius: '999px', // Full rounded per Design System
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '16px',
  display: 'inline-block',
  boxShadow: '0 4px 6px rgba(217, 119, 87, 0.2)',
}

const alternativeLink = {
  fontSize: '13px',
  color: emailColors.text.muted,
  margin: '24px 0 8px',
  textAlign: 'center' as const,
}

const linkContainer = {
    textAlign: 'center' as const,
    marginBottom: '32px',
}

const linkStyle = {
  color: emailColors.primary.main,
  fontSize: '12px',
  wordBreak: 'break-all' as const,
}

const linkStyleSupport = {
    color: emailColors.primary.main,
    fontWeight: '600',
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

