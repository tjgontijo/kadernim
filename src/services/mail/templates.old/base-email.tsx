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
    Font,
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
 * Base email template wrapper.
 * Use this to wrap dynamic content from the admin panel
 * with the Kadernim branded header/footer.
 */
export const BaseEmail = ({
    preheader = '',
    htmlContent,
}: BaseEmailProps) => (
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
        {preheader && <Preview>{preheader}</Preview>}
        <Body style={main}>
            <Container style={container}>
                {/* Clean Masthead Header */}
                <Section style={header}>
                    <Text style={headerTitle}>Kadernim <em>·</em></Text>
                    <Text style={headerSubtitle}>Recursos Educacionais de Elite</Text>
                    <div style={headerDivider} />
                </Section>

                {/* Main Content - injected HTML */}
                <Section style={content}>
                    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                </Section>

                {/* Footer */}
                <Section style={footer}>
                    <div style={footerDivider} />

                    {/* Support Box */}
                    <Section style={supportBox}>
                        <Text style={supportTitle}>Precisa de ajuda com o material?</Text>
                        <Text style={supportText}>
                           Fale com o nosso suporte humanizado:
                        </Text>
                        <Text style={supportText}>
                            📞 <Link href="https://wa.me/556198698704" style={linkStyle}>(61) 99869-8704</Link>
                        </Text>
                        <Text style={supportText}>
                            ✉️ <Link href="mailto:contato@kadernim.com.br" style={linkStyle}>contato@kadernim.com.br</Link>
                        </Text>
                    </Section>

                    <Hr style={hr} />

                    {/* Warning */}
                    <Section style={warningBox}>
                        <Text style={warningText}>
                            <strong>⏰ Aviso Importante:</strong> Se você não solicitou este contato, por favor desconsidere. Valorizamos sua privacidade.
                        </Text>
                    </Section>

                    {/* Security Notice */}
                    <Text style={securityText}>
                        🔒 <strong>Segurança em primeiro lugar:</strong> Nunca forneça seu código de acesso ou senha para ninguém, nem mesmo para nosso suporte.
                    </Text>

                    <Text style={footerText}>
                        © {new Date().getFullYear()} Kadernim. Feito com carinho para professores.
                    </Text>
                    <Text style={footerSmall}>
                        Este é um envio automático. Por favor, não responda a este endereço.
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

/**
 * Renders the base email template with dynamic content.
 */
export async function renderBaseEmail({
    htmlContent,
    preheader = '',
}: BaseEmailProps): Promise<string> {
    const html = await render(
        React.createElement(BaseEmail, { htmlContent, preheader })
    )
    return html
}

// ============ STYLES (Kadernim Design System) ============

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
    padding: '32px 40px',
    fontSize: '16px',
    lineHeight: '1.6',
    color: emailColors.text.primary,
}

const footer = {
    padding: '0 40px 48px 40px',
}

const footerDivider = {
    margin: '0 0 32px 0',
    borderTop: `1px dashed ${emailColors.border.default}`,
}

const hr = {
    borderColor: emailColors.border.light,
    margin: '32px 0',
}

const supportBox = {
    background: emailColors.background.muted,
    borderRadius: '12px',
    padding: '24px',
    margin: '16px 0',
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
    fontSize: '14px',
    color: emailColors.text.secondary,
    margin: '4px 0',
    lineHeight: '1.5',
}

const linkStyle = {
    color: emailColors.primary.main,
    fontWeight: '600',
}

const footerText = {
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
    margin: '4px 0',
}

const unsubscribeLink = {
    color: emailColors.text.muted,
    textDecoration: 'underline',
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