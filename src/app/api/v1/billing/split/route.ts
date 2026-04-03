import { NextRequest, NextResponse } from 'next/server'
import { SplitUpdateSchema } from '@/lib/billing/schemas'
import { SplitService } from '@/lib/billing/services/split.service'
import { billingLog } from '@/lib/billing/services/logger'
import { auth } from '@/server/auth/auth'

/**
 * GET: Retrieves the current active split configuration
 * Restricted to Admins
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers })

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const config = await SplitService.getConfig()

        return NextResponse.json(config || { error: 'No active split configuration' }, { status: config ? 200 : 404 })
    } catch (error: any) {
        billingLog('error', 'Split configuration GET failed', { error: error.message })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

/**
 * PUT: Updates/Creates the active split configuration
 * Restricted to Admins
 */
export async function PUT(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers })

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const parsed = SplitUpdateSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json({
                error: 'Invalid data',
                details: parsed.error.format()
            }, { status: 400 })
        }

        const updated = await SplitService.updateConfig(parsed.data, session.user.id)

        return NextResponse.json(updated, { status: 200 })
    } catch (error: any) {
        billingLog('error', 'Split configuration PUT failed', { error: error.message })
        const status = error.message === 'A carteira de split nao pode ser a mesma carteira principal.'
            || error.message === 'Wallet ID do split inválido.'
            ? 400
            : 500

        return NextResponse.json({
            error: status === 400 ? error.message : 'Internal Server Error'
        }, { status })
    }
}
