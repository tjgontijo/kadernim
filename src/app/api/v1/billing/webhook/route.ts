import { NextRequest } from 'next/server'
import { WebhookHandler } from '@/lib/billing/services/webhook.handler'

/**
 * Public Asaas Webhook Endpoint
 * 
 * Securely processes external events from Asaas and updates local 
 * database state. Retries are handled by Asaas by returning status 500.
 */
export async function POST(request: NextRequest) {
    return await WebhookHandler.process(request)
}
