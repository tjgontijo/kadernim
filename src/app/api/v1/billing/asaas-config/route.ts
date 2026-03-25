import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { BillingAsaasSettingsUpdateSchema } from '@/schemas/billing/asaas-settings-schemas'
import { BillingAsaasConfigService } from '@/services/billing/asaas-config.service'
import { billingLog } from '@/services/billing/logger'

async function requireAdmin(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  return !session || session.user.role !== 'admin' ? null : session
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const config = await BillingAsaasConfigService.getAdminConfig()
    return NextResponse.json(config)
  } catch (error: any) {
    billingLog('error', 'Billing Asaas config GET failed', { error: error.message })
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin(request)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const parsed = BillingAsaasSettingsUpdateSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.format() }, { status: 400 })
    }

    const updated = await BillingAsaasConfigService.updateConfig(parsed.data)
    return NextResponse.json(updated)
  } catch (error: any) {
    billingLog('error', 'Billing Asaas config PUT failed', { error: error.message })
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
