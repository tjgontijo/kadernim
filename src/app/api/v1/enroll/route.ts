// src/app/api/v1/enroll/route.ts
import { NextResponse } from 'next/server'
import { EnrollmentInput } from '@/lib/schemas/enrollment'
import { EnrollmentError, enrollUser } from '@/domain/enrollment/enrollment.service'
import { isWhatsAppNumberValid } from '@/services/whatsapp/uazapi/check'
import { normalizeWhatsApp } from '@/lib/masks/whatsapp'

const API_KEY = process.env.WEBHOOK_API_KEY || ''

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey || apiKey !== API_KEY) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const json = await request.json()
    const parsed = EnrollmentInput.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Payload inválido', details: parsed.error.format() }, { status: 400 })
    }

    // Normalizar e verificar se o número de WhatsApp é válido antes de prosseguir
    if (parsed.data.whatsapp) {
      // Normalizar o número (adicionar 55 se necessário e remover caracteres não numéricos)
      const normalizedWhatsApp = normalizeWhatsApp(parsed.data.whatsapp)
      
      // Verificar se o número é válido no WhatsApp
      const isValid = await isWhatsAppNumberValid(normalizedWhatsApp)
      if (!isValid) {
        return NextResponse.json({ 
          error: 'Número de WhatsApp inválido ou inexistente', 
          code: 'invalid_whatsapp' 
        }, { status: 400 })
      }
      
      // Atualizar o número normalizado nos dados
      parsed.data.whatsapp = normalizedWhatsApp
    }

    const result = await enrollUser(parsed.data, { apiBaseUrl: process.env.NEXT_PUBLIC_APP_URL ?? '' })

    if (result.kind === 'premium') {
      const accessUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/resources`
      return NextResponse.json({
        success: true,
        userId: result.userId,
        email: result.email,
        password_temp: result.tempPassword,
        whatsapp: result.whatsapp,
        isPremium: true,
        plan: result.planName,
        isNewUser: result.isNewUser,
        accessUrl
      })
    } else {
      return NextResponse.json({
        success: true,
        userId: result.userId,
        email: result.email,
        password_temp: result.tempPassword,
        whatsapp: result.whatsapp,
        isPremium: result.hasPremium,
        isNewUser: result.isNewUser,
        resources: result.resources,
        notFoundProducts: result.notFound.length ? result.notFound : undefined
      })
    }
  } catch (e) {
    if (e instanceof EnrollmentError) {
      return NextResponse.json({ error: e.message, code: e.code }, { status: e.status })
    }

    console.error('Erro ao processar matrícula', e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
