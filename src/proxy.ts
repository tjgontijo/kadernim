import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AB_TEST_CONFIG, MarketingVariant } from '@/config/ab-tests'

function looksLikeSessionCookie(v?: string) {
  if (!v) return false
  if (v.length < 20) return false
  return true
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas que não precisam de validação
  const isApiOrStaticRoute = pathname.startsWith('/api') ||
    pathname.includes('/_next/') ||
    pathname.includes('/static/') ||
    pathname === '/login' ||
    pathname.startsWith('/images/') ||
    pathname.includes('favicon.ico')

  if (isApiOrStaticRoute) {
    return NextResponse.next()
  }

  const AUTH_ROUTES = ['/dashboard', '/account']
  const PUBLIC_ROUTES = ['/', '/login', '/plans', '/lp', '/checkout']

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

  // --- Lógica de Teste A/B/C ---
  const url = request.nextUrl.clone()
  const variantParam = url.searchParams.get('variant')
  
  // 1. Sobrescrita manual via Query Param (?variant=1) - Global para facilitar
  if (variantParam && ['1', '2', '3'].includes(variantParam)) {
    const selectedVariant = `v${variantParam}` as MarketingVariant
    const response = NextResponse.redirect(new URL(pathname, request.url)) // Mantém na mesma página
    response.cookies.set(AB_TEST_CONFIG.cookieName, selectedVariant, { maxAge: AB_TEST_CONFIG.cookieMaxAge })
    return response
  }

  // 2. Determinar variante (apenas para persistência aqui, a lógica de sorteio é no /plans)
  let variant = request.cookies.get(AB_TEST_CONFIG.cookieName)?.value as MarketingVariant
  if (!variant || !AB_TEST_CONFIG.variants[variant]) {
    const variants = Object.keys(AB_TEST_CONFIG.variants) as MarketingVariant[]
    variant = variants[Math.floor(Math.random() * variants.length)]
  }
  // -----------------------------

  // Se está na home (SaaS Homepage - Estática)
  if (pathname === '/') {
    if (hasPlausibleCookie) {
      return NextResponse.redirect(new URL('/resources', request.url))
    }
    return NextResponse.next()
  }

  // Se está na landing page de campanha (Teste A/B/C)
  if (pathname === '/lp') {
    const response = NextResponse.next()
    
    // Se não tinha cookie de variante, define agora para persistir a experiência
    if (!request.cookies.has(AB_TEST_CONFIG.cookieName)) {
      response.cookies.set(AB_TEST_CONFIG.cookieName, variant, { maxAge: AB_TEST_CONFIG.cookieMaxAge })
    }
    return response
  }

  // Se for uma rota de autenticação (Dashboard/Conta) e não tem cookie, vai para o login
  if (isAuthRoute) {
    if (!hasPlausibleCookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  // Allow access to protected routes with checkout token
  const hasCheckoutToken = url.searchParams.has('token')
  if (hasCheckoutToken && (pathname === '/resources' || pathname.startsWith('/resources/'))) {
    return NextResponse.next()
  }

  // Qualquer outra rota é protegida por padrão
  if (!hasPlausibleCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// Configuração para o Proxy
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*.js|.*.css|.*.woff2).*)',
  ],
}
