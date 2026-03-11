import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/server/auth/middleware'
import { UpdateAutomationRuleSchema } from '@/schemas/automations/automation-schemas'

export interface AutomationRouteParams {
  params: Promise<{ id: string }>
}

export async function authorizeAutomationRequest(request: NextRequest) {
  return requirePermission(request, 'manage:resources')
}

export async function resolveAutomationRouteId(params: Promise<{ id: string }>) {
  const { id } = await params
  return id
}

export function parseAutomationUpdate(input: unknown) {
  const parsed = UpdateAutomationRuleSchema.safeParse(input)

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Dados inválidos', details: parsed.error.issues },
      { status: 400 }
    )
  }

  return parsed.data
}

export function automationNotFound() {
  return NextResponse.json(
    { success: false, error: 'Automação não encontrada' },
    { status: 404 }
  )
}

export function automationServerError(message: string, error: unknown) {
  console.error(message, error)
  return NextResponse.json(
    { success: false, error: 'Erro interno ao processar automação' },
    { status: 500 }
  )
}

export function automationSuccess<T>(data: T) {
  return NextResponse.json({ success: true, data })
}
