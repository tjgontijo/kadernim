import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { toggleSaveResource, planResource, getUserInteraction } from '@/lib/resources/services/catalog/interaction-service'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ data: null })
    }

    const { id } = await ctx.params
    const interaction = await getUserInteraction(session.user.id, id)
    return NextResponse.json({ data: interaction })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch interaction' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await ctx.params
    const body = await req.json()
    const { action } = body

    let result
    if (action === 'save') {
      result = await toggleSaveResource(session.user.id, id)
    } else if (action === 'plan') {
      const plannedFor = body.plannedFor ? new Date(body.plannedFor) : null
      result = await planResource(session.user.id, id, plannedFor)
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Interaction error:', error)
    return NextResponse.json({ error: 'Failed to process interaction' }, { status: 500 })
  }
}
