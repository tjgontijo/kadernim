// src/app/api/v1/cron/subscription-expiry/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { SubscriptionExpiryService } from '@/lib/cron/subscription-expiry'

export async function POST(request: NextRequest) {
  try {
    // Verificar se a requisição vem de um cron job autorizado
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Processar subscriptions expiradas
    const result = await SubscriptionExpiryService.processExpiredSubscriptions()
    
    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Erro no cron job de expiração:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autorização
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Retornar estatísticas
    const stats = await SubscriptionExpiryService.getSubscriptionStats()
    const expiringSoon = await SubscriptionExpiryService.getExpiringSubscriptions()
    
    return NextResponse.json({
      stats,
      expiringSoon: expiringSoon.length
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}