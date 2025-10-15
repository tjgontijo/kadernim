// src/app/api/v1/enroll/route.ts
import { NextResponse } from 'next/server'
import { EnrollmentInput } from '@/lib/schemas/enrollment'
import { enrollUser } from '@/domain/enrollment/enrollment.service'

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

    const result = await enrollUser(parsed.data, { apiBaseUrl: process.env.NEXT_PUBLIC_APP_URL ?? '' })

    if (result.kind === 'premium') {
      const accessUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/resources`
      return NextResponse.json({
        success: true,
        userId: result.userId,
        email: result.email,
        password_temp: result.tempPassword,
        isPremium: true,
        plan: result.planName,
        accessUrl
      })
    } else {
      return NextResponse.json({
        success: true,
        userId: result.userId,
        email: result.email,
        password_temp: result.tempPassword,
        isPremium: result.hasPremium,
        resources: result.resources,
        notFoundProducts: result.notFound.length ? result.notFound : undefined
      })
    }
  } catch (e) {
    console.error('Erro ao processar matrícula', e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
