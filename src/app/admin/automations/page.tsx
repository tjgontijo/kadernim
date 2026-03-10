import { AutomationsPageClient } from '@/components/dashboard/automations/automations-page-client'

export const metadata = {
    title: 'Automações | Admin',
    description: 'Gerencie gatilhos e reações automáticas do sistema.',
}

export default function AutomationsPage() {
    return <AutomationsPageClient />
}
