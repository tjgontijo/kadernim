import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionCookie } from "better-auth/cookies"

export async function middleware(request: NextRequest) {  
  const sessionCookie = getSessionCookie(request)
  const isLoggedIn = !!sessionCookie
  
  const { pathname } = request.nextUrl
    
  // Rotas que não precisam de validação
  const isApiOrStaticRoute = pathname.startsWith('/api') || 
                           pathname.includes('/_next/') || 
                           pathname.includes('/static/')
  
  const isPWAFile = pathname === '/sw.js' || 
                    pathname === '/manifest.json' ||
                    pathname === '/manifest.webmanifest' ||
                    pathname === '/icon.png' ||
                    pathname === '/apple-icon.png'
  
  // Rotas de autenticação
  const isAuthRoute = pathname.startsWith('/login') || 
                     pathname.startsWith('/register')
  
  // Rotas públicas (página institucional)
  const isPublicRoute = pathname === '/'
  
  // Rotas protegidas (dashboard e subpáginas)
  const isProtectedRoute = pathname.startsWith('/dashboard')
  
  if (isApiOrStaticRoute || isPWAFile) {
    return NextResponse.next()
  }
  
  // Se está em rota de auth e está logado, redireciona para resources
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/resources', request.url))
    }
    return NextResponse.next()
  }
  
  // Se está em rota protegida e NÃO está logado, redireciona para login
  if (isProtectedRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }
  
  // Rotas públicas sempre passam
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  return NextResponse.next()
}

// Configuração para o Edge Runtime
export const runtime = 'nodejs'

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|sw.js|manifest).*)'] 
}
