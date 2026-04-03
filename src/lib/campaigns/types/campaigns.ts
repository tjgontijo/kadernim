import type { CampaignInput, CampaignTrackInput } from '@/lib/campaigns/schemas'

export type { CampaignInput, CampaignTrackInput }

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

export interface CampaignAnalyticsData {
  kpis: {
    totalCampaigns: number
    sentCampaigns: number
    totalSent: number
    totalClicked: number
    ctr: string
    topCampaign: {
      title: string
      totalSent: number
      totalClicked: number
      ctr: string
    } | null
  }
  daily: Array<{
    date: string
    sent: number
    clicked: number
  }>
  campaigns: Array<{
    id: string
    title: string
    totalSent: number
    totalClicked: number
    ctr: string
    sentAt: string
  }>
}
