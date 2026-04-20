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
import { render } from '@react-email/render'
import * as React from 'react'
import { emailColors } from './email-colors'

interface BaseEmailProps {
    preheader?: string
    /**
     * HTML content to be injected in the main area.
     * This comes from the admin template editor.
     */
    htmlContent: string
}

/**
 * Base email template wrapper optimized for deliverability.
 */
export const BaseEmail = ({
    preheader = '',
    htmlContent,
}: BaseEmailProps) => (
    <Html>
        <Head />
        {preheader && <Preview>{preheader}</Preview>}
        <Body style={main}>
            <Container style={container}>
                {/* Header */}
                <Section style={header}>
                    <Text style={headerTitle}>Kadernim</Text>
                    <Text style={headerSubtitle}>Recursos Educacionais</Text>
                </Section>

                {/* Main Content */}
                <Section style={content}>
                    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                </Section>

                {/* Footer */}
                <Section style={footer}>
                    <Hr style={hr} />

                    <Section style={supportBox}>
                        <Text style={supportTitle}>Suporte ao Professor</Text>
                        <Text style={supportText}>
                            WhatsApp: <Link href="https://wa.me/5561998698704" style={linkStyle}>(61) 99869-8704</Link>
                        </Text>
                        <Text style={supportText}>
                            E-mail: <Link href="mailto:contato@kadernim.com.br" style={linkStyle}>contato@kadernim.com.br</Link>
                        </Text>
                    </Section>

                    <Hr style={hr} />

                    <Section style={warningBox}>
                        <Text style={warningText}>
                            <strong>Aviso:</strong> Se você não solicitou este contato, por favor desconsidere este e-mail.
                        </Text>
                    </Section>

                    <Text style={footerText}>
                        © {new Date().getFullYear()} Kadernim. Brasília, DF.
                    </Text>
                    <Text style={footerSmall}>
                        Este é um envio automático. Por favor, não responda.
                    </Text>
                    <Text style={footerSmall}>
                        <Link href="{{unsubscribe_url}}" style={unsubscribeLink}>
                            Descadastrar-se das comunicações
                        </Link>
                    </Text>
                </Section>
            </Container>
        </Body>
    </Html>
)

export default BaseEmail

export async function renderBaseEmail({
    htmlContent,
    preheader = '',
}: BaseEmailProps): Promise<string> {
    const html = await render(
        React.createElement(BaseEmail, { htmlContent, preheader })
    )
    return html
}

// ============ STYLES (Otimizados para Entrega) ============

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
    letterSpacing: '-0.5px',
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
    fontSize: '16px',
    lineHeight: '1.5',
    color: emailColors.text.primary,
}

const footer = {
    padding: '0 40px 40px 40px',
}

const hr = {
    borderColor: emailColors.border.light,
    margin: '32px 0',
}

const supportBox = {
    background: emailColors.background.muted,
    borderRadius: '8px',
    padding: '20px',
    margin: '16px 0',
}

const supportTitle = {
    fontSize: '15px',
    color: emailColors.text.primary,
    fontWeight: 'bold' as const,
    margin: '0 0 10px 0',
}

const supportText = {
    fontSize: '13px',
    color: emailColors.text.secondary,
    margin: '4px 0',
}

const linkStyle = {
    color: emailColors.primary.main,
    fontWeight: 'bold' as const,
    textDecoration: 'none',
}

const footerText = {
    fontSize: '12px',
    color: emailColors.text.muted,
    textAlign: 'center' as const,
    margin: '32px 0 8px 0',
}

const footerSmall = {
    fontSize: '11px',
    color: emailColors.text.muted,
    textAlign: 'center' as const,
    margin: '4px 0',
}

const unsubscribeLink = {
    color: emailColors.text.muted,
    textDecoration: 'underline',
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
},
    lineHeight: '1.6',
}