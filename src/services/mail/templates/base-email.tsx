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
 * Base email template wrapper.
 * Use this to wrap dynamic content from the admin panel
 * with the Kadernim branded header/footer.
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
                {/* Header with gradient */}
                <Section style={header}>
                    <Text style={headerTitle}>Kadernim</Text>
                    <Text style={headerSubtitle}>Plataforma de Gerenciamento de Recursos Educacionais</Text>
                </Section>

                {/* Main Content - injected HTML */}
                <Section style={content}>
                    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                </Section>

                {/* Footer */}
                <Section style={footer}>
                    <Hr style={hr} />

                    {/* Support Box */}
                    <Section style={supportBox}>
                        <Text style={supportTitle}>Precisa de ajuda?</Text>
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
                            <strong>⏰ Atenção:</strong> Se você não solicitou este email, ignore-o.
                        </Text>
                    </Section>

                    {/* Security Notice */}
                    <Text style={securityText}>
                        🔒 <strong>Segurança:</strong> Nunca compartilhe códigos e senhas com outras pessoas. Nós nunca pedimos códigos e senhas.
                    </Text>

                    <Text style={footerText}>
                        © {new Date().getFullYear()} Kadernim. Todos os direitos reservados.
                    </Text>
                    <Text style={footerSmall}>
                        Este é um email automático. Por favor, não responda.
                    </Text>
                    <Text style={footerSmall}>
                        <Link href="{{unsubscribe_url}}" style={unsubscribeLink}>
                            Descadastrar-se
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
 * 
 * @param htmlContent - The HTML content from admin template (with variables already replaced)
 * @param preheader - Optional preheader text shown in inbox preview
 * @returns Rendered HTML string ready for sending
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

// ============ STYLES (usando emailColors) ============

const main = {
    backgroundColor: emailColors.background.page,
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '600px',
}

const header = {
    background: emailColors.primary.gradient,
    padding: '40px 20px',
    textAlign: 'center' as const,
    borderRadius: '8px 8px 0 0',
}

const headerTitle = {
    color: emailColors.primary.foreground,
    margin: '0',
    fontSize: '28px',
    fontWeight: 'bold' as const,
}

const headerSubtitle = {
    color: emailColors.primary.light,
    margin: '8px 0 0 0',
    fontSize: '14px',
}

const content = {
    background: emailColors.background.card,
    padding: '40px 30px',
    fontSize: '16px',
    lineHeight: '1.6',
    color: emailColors.text.primary,
}

const footer = {
    background: emailColors.background.card,
    padding: '0 30px 40px 30px',
    borderRadius: '0 0 8px 8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
}

const hr = {
    borderColor: emailColors.border.default,
    margin: '24px 0',
}

const supportBox = {
    background: emailColors.brand.supportBox,
    borderRadius: '6px',
    padding: '16px',
    margin: '16px 0',
}

const supportTitle = {
    fontSize: '15px',
    color: emailColors.brand.supportTitle,
    fontWeight: 'bold' as const,
    margin: '0 0 8px 0',
}

const supportText = {
    fontSize: '13px',
    color: emailColors.brand.supportText,
    margin: '4px 0',
    lineHeight: '1.5',
}

const linkStyle = {
    color: emailColors.text.link,
    fontWeight: 'bold' as const,
}

const footerText = {
    fontSize: '12px',
    color: emailColors.text.muted,
    textAlign: 'center' as const,
    margin: '0 0 8px 0',
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
    borderRadius: '6px',
    padding: '16px',
    margin: '24px 0',
}

const warningText = {
    fontSize: '14px',
    color: emailColors.status.warning.text,
    margin: '0',
}

const securityText = {
    fontSize: '13px',
    color: emailColors.text.secondary,
    margin: '24px 0',
    lineHeight: '1.6',
}