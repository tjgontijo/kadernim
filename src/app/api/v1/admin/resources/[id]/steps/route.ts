import { NextRequest, NextResponse } from 'next/server'
import {
  adminResourceNotFound,
  adminResourceServerError,
  authorizeAdminResourceRequest,
  parseWithSchema,
  resolveRouteId,
} from '../../route-support'
import { PedagogicalStepsSchema } from '@/lib/resources/schemas/pedagogical-schemas'
import {
  getResourceSteps,
  updateResourceSteps,
} from '@/lib/resources/services/admin/resource-steps-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authorizeAdminResourceRequest(request, {
      key: 'admin:resources:steps:get',
      limit: 60,
    })
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const id = await resolveRouteId(params)
    const steps = await getResourceSteps(id)

    return NextResponse.json({ steps })
  } catch (error) {
    if (error instanceof Error && error.message === 'RESOURCE_NOT_FOUND') {
      return adminResourceNotFound()
    }
    return adminResourceServerError('[GET /api/v1/admin/resources/:id/steps]', error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authorizeAdminResourceRequest(request, {
      key: 'admin:resources:steps:update',
      limit: 30,
    })
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const id = await resolveRouteId(params)
    const body = await request.json()

    const parsed = parseWithSchema(PedagogicalStepsSchema, body, 'Invalid steps payload')
    if (parsed instanceof NextResponse) {
      return parsed
    }

    const steps = await updateResourceSteps(id, parsed)

    return NextResponse.json({ steps }, { status: 200 })
  } catch (error) {
    if (error instanceof Error && error.message === 'RESOURCE_NOT_FOUND') {
      return adminResourceNotFound()
    }
    return adminResourceServerError('[PUT /api/v1/admin/resources/:id/steps]', error)
  }
}
