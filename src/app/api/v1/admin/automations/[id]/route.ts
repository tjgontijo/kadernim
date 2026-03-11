import { NextRequest, NextResponse } from 'next/server'
import { AutomationService } from '@/services/automations/automation.service'
import {
  automationNotFound,
  automationServerError,
  automationSuccess,
  authorizeAutomationRequest,
  AutomationRouteParams,
  parseAutomationUpdate,
  resolveAutomationRouteId,
} from '../route-support'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: AutomationRouteParams) {
  try {
    const authResult = await authorizeAutomationRequest(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const rule = await AutomationService.getById(await resolveAutomationRouteId(params))
    if (!rule) {
      return automationNotFound()
    }

    return automationSuccess(rule)
  } catch (error) {
    return automationServerError('[GET /api/v1/admin/automations/[id]]', error)
  }
}

export async function PATCH(request: NextRequest, { params }: AutomationRouteParams) {
  try {
    const authResult = await authorizeAutomationRequest(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const parsed = parseAutomationUpdate(await request.json())
    if (parsed instanceof NextResponse) {
      return parsed
    }

    return automationSuccess(
      await AutomationService.update(await resolveAutomationRouteId(params), parsed)
    )
  } catch (error) {
    return automationServerError('[PATCH /api/v1/admin/automations/[id]]', error)
  }
}

export async function DELETE(request: NextRequest, { params }: AutomationRouteParams) {
  try {
    const authResult = await authorizeAutomationRequest(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    await AutomationService.delete(await resolveAutomationRouteId(params))

    return NextResponse.json({
      success: true,
      message: 'Automação excluída com sucesso',
    })
  } catch (error) {
    return automationServerError('[DELETE /api/v1/admin/automations/[id]]', error)
  }
}
