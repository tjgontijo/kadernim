import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { CheckoutStatusTokenService } from '@/services/billing/checkout-status-token.service'
import { PixAutomaticService } from '@/services/billing/pix-automatic.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ authorizationId: string }> },
) {
  try {
    const { authorizationId } = await params
    if (!authorizationId) {
      return NextResponse.json({ error: 'Authorization ID is required' }, { status: 400 })
    }

    const session = await auth.api.getSession({ headers: request.headers })
    const authStatus = session?.user
      ? await PixAutomaticService.getAuthorizationStatusForUser(authorizationId, session.user.id)
      : await getGuestAuthorizationStatus(request, authorizationId)

    return NextResponse.json({
      id: authStatus.asaasId,
      status: authStatus.status,
    })
  } catch (error: any) {
    if (error.message === 'Authorization not found') {
      return NextResponse.json({ error: 'Authorization not found' }, { status: 404 })
    }

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

async function getGuestAuthorizationStatus(request: NextRequest, authorizationId: string) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token || !CheckoutStatusTokenService.verifyAuthorizationToken(token, authorizationId)) {
    throw new Error('Unauthorized')
  }

  return PixAutomaticService.getAuthorizationStatusById(authorizationId)
}
