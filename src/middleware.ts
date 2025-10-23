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
                           pathname.includes('/static/') ||
                           pathname.includes('/auth/')
  
  const isPWAFile = pathname === '/sw.js' || 
                    pathname === '/manifest.json' ||
                    pathname === '/manifest.webmanifest' ||
                    pathname === '/icon.png' ||
                    pathname === '/apple-icon.png' ||
                    pathname.startsWith('/images/icons/')
  
  // Rotas de autenticação
  const isAuthRoute = pathname.startsWith('/login') || 
                     pathname.startsWith('/register')
  
  // Rotas públicas explícitas
  const isPublicRoute = pathname === '/'
  
  // Não precisa validação: API, static, PWA, auth e home
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
  
  // Home é pública
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  // Qualquer outra rota é protegida por padrão
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
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
