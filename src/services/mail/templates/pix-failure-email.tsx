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

interface PixFailureEmailProps {
  name?: string
  failureReason: string
  retryUrl: string
  nextRetryDate?: string
}

export const PixFailureEmail = ({
  name = 'Usuário',
  failureReason,
  retryUrl,
  nextRetryDate = '3 dias',
}: PixFailureEmailProps) => {
  const reasons: Record<string, { title: string; description: string }> = {
    FAILED_DEBIT: {
      title: 'Saldo Insuficiente',
      description: 'Verifique se tem saldo para pagar sua assinatura.',
    },
    EXPIRED: {
      title: 'Código Expirou',
      description: 'O código PIX expirou antes do pagamento ser realizado.',
    },
    DENIED: {
      title: 'Autorização Negada',
      description: 'Seu banco rejeitou a transação. Verifique com seu banco.',
    },
    CANCELED_BY_USER: {
      title: 'Cancelada no Seu Banco',
      description: 'Você cancelou a autorização no app do seu banco.',
    },
    OTHER: {
      title: 'Erro na Transação',
      description: 'Ocorreu um erro ao processar seu pagamento.',
    },
  }

  const reasonDetails = reasons[failureReason] || reasons.OTHER

  return (
    <Html>
      <Head />
      <Preview>⚠️ Seu pagamento PIX foi recusado - Kadernim Pro</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerTitle}>Kadernim Pro</Text>
            <Text style={headerSubtitle}>Seu acesso continua ativado!</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Olá {name},</Text>

            <Section style={alertBox}>
              <Text style={alertTitle}>⚠️ {reasonDetails.title}</Text>
              <Text style={alertDescription}>{reasonDetails.description}</Text>
            </Section>

            <Text style={paragraph}>
              Tentaremos cobrar automaticamente novamente em <strong>{nextRetryDate}</strong>, mas você pode tentar agora mesmo:
            </Text>

            <Section style={ctaContainer}>
              <Link href={retryUrl} style={ctaButton}>
                Tentar Pagamento Agora
              </Link>
            </Section>

            <Hr style={hr} />

            <Section style={infoBox}>
              <Text style={infoTitle}>Informações Importantes:</Text>
              <Text style={infoItem}>✓ Seu acesso ao Kadernim continua ativo</Text>
              <Text style={infoItem}>✓ Tentaremos cobrar novamente automaticamente</Text>
              <Text style={infoItem}>✓ Você pode tentar manualmente a qualquer momento</Text>
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

export async function generatePixFailureEmail({
  name = 'Usuário',
  failureReason,
  retryUrl,
  nextRetryDate = '3 dias',
}: PixFailureEmailProps) {
  const subject = '⚠️ Seu pagamento PIX foi recusado - Kadernim Pro'

  const text = [
    `Olá ${name}!`,
    '',
    `Seu pagamento PIX foi recusado.`,
    `Motivo: ${failureReason}`,
    '',
    `Seu acesso ao Kadernim continua ativado.`,
    `Tentaremos cobrar novamente em ${nextRetryDate}.`,
    '',
    `Clique aqui para tentar agora: ${retryUrl}`,
    '',
    'Suporte:',
    'WhatsApp: +55 61 9869-8704',
    'Email: suporte@kadernim.com.br',
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
  backgroundColor: '#f9fafb',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const header = {
  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
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
  color: '#fed7aa',
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

const alertBox = {
  background: '#fef3c7',
  border: '1px solid #fcd34d',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0',
}

const alertTitle = {
  fontSize: '16px',
  color: '#92400e',
  fontWeight: 'bold' as const,
  margin: '0 0 8px 0',
}

const alertDescription = {
  fontSize: '14px',
  color: '#78350f',
  margin: '0',
}

const paragraph = {
  fontSize: '15px',
  color: '#374151',
  margin: '24px 0',
  lineHeight: '1.6',
}

const ctaContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const ctaButton = {
  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold' as const,
  fontSize: '16px',
  display: 'inline-block',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const infoBox = {
  background: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0',
}

const infoTitle = {
  fontSize: '15px',
  color: '#166534',
  fontWeight: 'bold' as const,
  margin: '0 0 12px 0',
}

const infoItem = {
  fontSize: '14px',
  color: '#15803d',
  margin: '8px 0',
}

const supportBox = {
  background: '#eef2ff',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0',
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
