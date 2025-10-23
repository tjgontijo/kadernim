import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/auth'
import { normalizeWhatsApp, validateWhatsApp } from '@/lib/masks/whatsapp'

// Schema de validação
const whatsappSchema = z.object({
  whatsapp: z.string().min(10).max(20)
})

export async function POST(request: Request) {
  try {
    // Validar payload
    const body = await request.json()
    const result = whatsappSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'WhatsApp inválido', details: result.error.format() },
        { status: 400 }
      )
    }
    
    const { whatsapp } = result.data
    
    // Validar formato antes de normalizar
    const cleanWhatsapp = whatsapp.replace(/\D/g, '')
    if (!validateWhatsApp(cleanWhatsapp)) {
      return NextResponse.json(
        { error: 'Formato de WhatsApp inválido. Deve ter 10 ou 11 dígitos.' },
        { status: 400 }
      )
    }
    
    // Normalizar após validar
    const normalizedWhatsapp = normalizeWhatsApp(whatsapp)
    
    console.log('[whatsapp-login] Buscando usuário:', { whatsapp, normalizedWhatsapp })
    
    // Buscar usuário pelo WhatsApp
    const user = await prisma.user.findFirst({
      where: { whatsapp: normalizedWhatsapp }
    })
    
    if (!user) {
      console.log('[whatsapp-login] Usuário não encontrado')
      return NextResponse.json(
        { error: 'Usuário não encontrado com esse WhatsApp' },
        { status: 404 }
      )
    }
    
    console.log('[whatsapp-login] Usuário encontrado:', { 
      userId: user.id,
      email: user.email
    })
    
    // Gerar magic link via Better Auth
    try {
      console.log('[whatsapp-login] Chamando signInMagicLink para:', user.email)
      
      // Chamar a API do Better Auth para gerar o magic link
      await auth.api.signInMagicLink({
        body: {
          email: user.email,
          callbackURL: '/resources'
        },
        headers: {}
      })
      
      console.log('[whatsapp-login] Magic link gerado com sucesso')
            
      // O envio do WhatsApp já acontece automaticamente no callback do plugin
      return NextResponse.json({
        success: true,
        message: 'Link de acesso enviado com sucesso'
      })
    } catch (signInError) {
      console.error('[whatsapp-login] Erro ao chamar signInMagicLink:', signInError)
      return NextResponse.json(
        { error: 'Erro ao gerar link de acesso', details: String(signInError) },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[whatsapp-login] Erro ao processar solicitação:', error)
    return NextResponse.json(
      { error: 'Erro interno no servidor', details: String(error) },
      { status: 500 }
    )
  }
}
