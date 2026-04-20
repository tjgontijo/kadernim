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

interface PixFailureEmailProps {
  name?: string
  failureReason: string
  retryUrl: string
  nextRetryDate?: string
}

export const PixFailureEmail = ({
  name = 'Professor(a)',
  failureReason,
  retryUrl,
  nextRetryDate = 'alguns dias',
}: PixFailureEmailProps) => {
  const reasons: Record<string, { title: string; description: string }> = {
    FAILED_DEBIT: {
      title: 'Saldo Insuficiente',
      description: 'Não foi possível processar o pagamento. Verifique o saldo da sua conta vinculada ao PIX.',
    },
    EXPIRED: {
      title: 'O código PIX expirou',
      description: 'O tempo para realizar o pagamento encerrou antes da conclusão da transação.',
    },
    DENIED: {
      title: 'Transação não autorizada',
      description: 'Seu banco não permitiu a conclusão do pagamento. Entre em contato com o gerente da sua conta.',
    },
    CANCELED_BY_USER: {
      title: 'Pagamento cancelado',
      description: 'A transação foi interrompida antes de ser finalizada no seu aplicativo bancário.',
    },
    OTHER: {
      title: 'Houve um imprevisto técnico',
      description: 'Ocorreu um erro inesperado ao processar sua transação via PIX.',
    },
  }

  const reasonDetails = reasons[failureReason] || reasons.OTHER

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
      </Head>
      <Preview>⚠️ Informação sobre seu pagamento no Kadernim</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerTitle}>Kadernim <em>·</em></Text>
            <Text style={headerSubtitle}>Atualização sobre seu acesso</Text>
            <div style={headerDivider} />
          </Section>

          <Section style={content}>
            <Text style={greeting}>Olá, <strong>{name}</strong>!</Text>

            <Section style={alertBox}>
              <Text style={alertTitle}>⚠️ {reasonDetails.title}</Text>
              <Text style={alertDescription}>{reasonDetails.description}</Text>
            </Section>

            <Text style={paragraph}>
              Não se preocupe: <strong>seu acesso continua ativo</strong> por enquanto. Tentaremos uma nova cobrança automática em <strong>{nextRetryDate}</strong>, mas você pode tentar concluir agora:
            </Text>

            <Section style={ctaContainer}>
              <Link href={retryUrl} style={ctaButton}>
                Tentar Novamente
              </Link>
            </Section>

            <Hr style={hr} />

            <Section style={infoBox}>
              <Text style={infoTitle}>O que você precisa saber:</Text>
              <Text style={infoItem}>✓ Seu material pedagógico continua disponível.</Text>
              <Text style={infoItem}>✓ Novas tentativas de cobrança serão feitas automaticamente.</Text>
              <Text style={infoItem}>✓ Você pode trocar a forma de pagamento a qualquer momento.</Text>
            </Section>

            <Hr style={hr} />

            <Section style={supportBox}>
              <Text style={supportTitle}>Precisa de suporte com o pagamento?</Text>
              <Text style={supportText}>
                📞 WhatsApp: <Link href="https://wa.me/5561998698704" style={linkStyleSupport}>(61) 99869-8704</Link>
              </Text>
              <Text style={supportText}>
                ✉️ E-mail: <Link href="mailto:contato@kadernim.com.br" style={linkStyleSupport}>contato@kadernim.com.br</Link>
              </Text>
            </Section>

            <div style={footerDivider} />

            <Text style={footer}>© {new Date().getFullYear()} Kadernim. Editoria e Educação em harmonia.</Text>
            <Text style={footerSmall}>Este é um e-mail informativo enviado pelo sistema.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export async function generatePixFailureEmail({
  name = 'Professor(a)',
  failureReason,
  retryUrl,
  nextRetryDate = '3 dias',
}: PixFailureEmailProps) {
  const subject = '⚠️ Seu pagamento PIX foi recusado - Kadernim Pro'

  const text = [
    `Olá, ${name}!`,
    '',
    `Identificamos um problema com seu pagamento via PIX.`,
    `Motivo: ${failureReason}`,
    '',
    `Seu acesso ao Kadernim continua ativo.`,
    `Tentaremos uma nova cobrança automática em ${nextRetryDate}.`,
    '',
    `Para tentar pagar agora, acesse: ${retryUrl}`,
  ].join('\n')

  const htmlRaw = await render(
    React.createElement(PixFailureEmail, {
      name,
      failureReason,
      retryUrl,
      nextRetryDate,
    })
  )
  const html = await pretty(htmlRaw)

  return { subject, text, html }
}

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

const alertBox = {
  background: emailColors.status.warning.background,
  border: `1px solid ${emailColors.status.warning.border}`,
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
}

const alertTitle = {
  fontSize: '16px',
  color: emailColors.status.warning.text,
  fontWeight: '600',
  margin: '0 0 8px 0',
  fontFamily: '"Fraunces", Georgia, serif',
}

const alertDescription = {
  fontSize: '14px',
  color: emailColors.status.warning.text,
  margin: '0',
  lineHeight: '1.5',
}

const paragraph = {
  fontSize: '16px',
  color: emailColors.text.primary,
  margin: '24px 0',
  lineHeight: '1.6',
}

const ctaContainer = {
  textAlign: 'center' as const,
  margin: '32px 0 40px',
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

const hr = {
    borderColor: emailColors.border.light,
    margin: '32px 0',
}

const infoBox = {
    background: emailColors.status.success.background,
    border: `1px solid ${emailColors.status.success.border}`,
    borderRadius: '12px',
    padding: '24px',
    margin: '24px 0',
}

const infoTitle = {
    fontSize: '16px',
    color: emailColors.status.success.text,
    fontWeight: '600',
    margin: '0 0 12px 0',
    fontFamily: '"Fraunces", Georgia, serif',
}

const infoItem = {
    fontSize: '14px',
    color: emailColors.status.success.text,
    margin: '8px 0',
    lineHeight: '1.5',
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
