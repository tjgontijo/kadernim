import { EmailTemplatesPageClient } from '@/components/dashboard/templates/email-templates-page-client'

export const metadata = {
    title: 'Templates de Email | Admin',
    description: 'Configure os modelos de email para notificações e automações.',
}

export default function EmailTemplatesPage() {
    return <EmailTemplatesPageClient />
}
