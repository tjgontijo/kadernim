import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { BillingMainWalletUpdateSchema } from '@/schemas/billing/wallet-schemas'
import { BillingWalletService } from '@/services/billing/wallet.service'
import { billingLog } from '@/services/billing/logger'

async function requireAdmin(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session || session.user.role !== 'admin') {
    return null
  }

  return session
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin(request)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const config = await BillingWalletService.getConfig()

    return NextResponse.json(config)
  } catch (error: any) {
    billingLog('error', 'Billing wallet GET failed', { error: error.message })
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin(request)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parsed = BillingMainWalletUpdateSchema.safeParse(await request.json())

    if (!parsed.success) {
      return NextResponse.json({
        error: 'Invalid data',
        details: parsed.error.format(),
      }, { status: 400 })
    }

    const updated = await BillingWalletService.updateMainWallet(parsed.data)

    return NextResponse.json(updated, { status: 200 })
  } catch (error: any) {
    billingLog('error', 'Billing wallet PUT failed', { error: error.message })
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
