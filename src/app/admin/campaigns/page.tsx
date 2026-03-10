import { CampaignsPageClient } from '@/components/dashboard/campaigns/campaigns-page-client'

export const metadata = {
    title: 'Campanhas de Push | Admin',
    description: 'Gerencie campanhas de marketing via push notifications',
}

export default function CampaignsPage() {
    return <CampaignsPageClient />
}
