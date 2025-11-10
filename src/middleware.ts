import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/auth'

export async function middleware(request: NextRequest) {  
  const dest = request.headers.get('sec-fetch-dest')
  const isDocument = dest === 'document'
  const { pathname } = request.nextUrl
    
  // Rotas que não precisam de validação
  const isApiOrStaticRoute = pathname.startsWith('/api') || 
                           pathname.includes('/_next/') || 
                           pathname.includes('/static/') ||
                           pathname.includes('/login/')
  
  const isPWAFile = pathname === '/sw.js' || 
                    pathname === '/manifest.json' ||
                    pathname === '/manifest.webmanifest' ||
                    pathname === '/icon.png' ||
                    pathname === '/apple-icon.png' ||
                    pathname.startsWith('/images/icons/')
  
  const AUTH_ROUTES = ['/']
  const PUBLIC_ROUTES = ['/login/otp', '/login/magic-link', '/login/magic-link/sent', '/offline']

  const matchesRoute = (route: string) =>
    pathname === route || pathname.startsWith(`${route}/`)

  // Rotas de autenticação
  const isAuthRoute = AUTH_ROUTES.some(matchesRoute)
  
  // Rotas públicas explícitas
  const isPublicRoute = PUBLIC_ROUTES.some(matchesRoute)
  
  // Não precisa validação: API, static, PWA, auth e home
  if (isApiOrStaticRoute || isPWAFile) {
    return NextResponse.next()
  }
  
  // Validar sessão apenas em navegações de documento para reduzir consultas
  if (!isDocument) {
    return NextResponse.next()
  }

  const session = await auth.api.getSession({ headers: request.headers })
  const isLoggedIn = !!session?.user?.id

  // Se está em rota de auth e está logado, redireciona para resources; caso contrário, envia para login
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/resources', request.url))
    }
    return NextResponse.redirect(new URL('/login/otp', request.url))
  }
  
  // Rotas públicas
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  // Qualquer outra rota é protegida por padrão
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login/otp', request.url))
  }
  
  return NextResponse.next()
}

// Configuração para o Edge Runtime
export const runtime = 'nodejs'

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|sw.js|manifest|icon.png|apple-icon.png|.*.js|.*.css|.*.woff2).*)' 
  ]
}
