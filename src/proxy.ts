import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
function looksLikeSessionCookie(v?: string) {
  if (!v) return false
  // Better-auth tokens in database mode don't necessarily have dots.
  // Just check if it's a reasonably long string.
  if (v.length < 20) return false
  return true
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas que não precisam de validação
  const isApiOrStaticRoute = pathname.startsWith('/api') ||
    pathname.includes('/_next/') ||
    pathname.includes('/static/') ||
    pathname.includes('/login/') ||
    pathname.startsWith('/images/') ||
    pathname.includes('favicon.ico')

  const isPWAFile = pathname === '/sw.js' ||
    pathname === '/manifest.json' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/icon.png' ||
    pathname === '/apple-icon.png' ||
    pathname.startsWith('/images/icons/')

  if (isApiOrStaticRoute || isPWAFile) {
    return NextResponse.next()
  }

  const AUTH_ROUTES = ['/']
  const PUBLIC_ROUTES = ['/login/otp', '/login/magic-link', '/login/magic-link/sent', '/offline']

  const matchesRoute = (route: string) =>
    pathname === route || pathname.startsWith(`${route}/`)

  const isAuthRoute = AUTH_ROUTES.some(matchesRoute)
  const isPublicRoute = PUBLIC_ROUTES.some(matchesRoute)

  // Rotas públicas explícitas
  if (isPublicRoute) {
    return NextResponse.next()
  }

  const sessionToken = request.cookies.get('better-auth.session_token')?.value
  const secureSessionToken = request.cookies.get('__Secure-better-auth.session_token')?.value
  const hasPlausibleCookie =
    looksLikeSessionCookie(sessionToken) ||
    looksLikeSessionCookie(secureSessionToken)

  // Se está na home (auth route)
  if (isAuthRoute) {
    if (hasPlausibleCookie) {
      return NextResponse.redirect(new URL('/resources', request.url))
    }
    // Se não tem cookie na home, deixa prosseguir para o login se for o caso ou redireciona
    // Aqui a home '/' no seu projeto parece ser o login ou redirecionar para ele
    return NextResponse.redirect(new URL('/login/otp', request.url))
  }

  // Qualquer outra rota é protegida por padrão
  if (!hasPlausibleCookie) {
    return NextResponse.redirect(new URL('/login/otp', request.url))
  }

  return NextResponse.next()
}

// Configuração para o Proxy
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|sw.js|manifest|icon.png|apple-icon.png|.*.js|.*.css|.*.woff2).*)',
  ],
}
