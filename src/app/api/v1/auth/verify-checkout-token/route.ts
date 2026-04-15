import { NextRequest, NextResponse } from 'next/server'
import { CheckoutAuthTokenService } from '@/lib/billing/services/checkout-auth-token.service'
import { prisma } from '@/lib/db'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 })
    }

    const decoded = CheckoutAuthTokenService.verify(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token expirado ou inválido' }, { status: 401 })
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Create session in database (Better Auth session)
    const sessionToken = crypto.randomUUID()
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await prisma.session.create({
      data: {
        token: sessionToken,
        userId: user.id,
        expiresAt: thirtyDaysFromNow,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    // Create response
    const response = NextResponse.json({
      success: true,
      userId: user.id,
      email: user.email,
    })

    // Set the session cookie (same as Better Auth does)
    const cookieName = process.env.NODE_ENV === 'production'
      ? '__Secure-better-auth.session_token'
      : 'better-auth.session_token'

    response.cookies.set(cookieName, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('[Auth] Erro ao verificar checkout token:', error)
    return NextResponse.json(
      { error: 'Erro ao processar token de checkout' },
      { status: 500 }
    )
  }
}
