export interface PushCampaign {
    id: string
    name: string
    title: string
    body: string
    url: string | null
    status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED'
    scheduledAt: string | null
    sentAt: string | null
    totalSent: number
    totalClicked: number
    createdAt: string
}
