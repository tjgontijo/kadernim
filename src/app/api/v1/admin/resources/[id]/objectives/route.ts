import { NextRequest, NextResponse } from 'next/server'
import {
  adminResourceNotFound,
  adminResourceServerError,
  authorizeAdminResourceRequest,
  parseWithSchema,
  resolveRouteId,
} from '../../route-support'
import { PedagogicalObjectivesSchema } from '@/lib/resources/schemas/pedagogical-schemas'
import {
  getResourceObjectives,
  updateResourceObjectives,
} from '@/lib/resources/services/admin/resource-objectives-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authorizeAdminResourceRequest(request, {
      key: 'admin:resources:objectives:get',
      limit: 60,
    })
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const id = await resolveRouteId(params)
    const objectives = await getResourceObjectives(id)

    return NextResponse.json({ objectives })
  } catch (error) {
    if (error instanceof Error && error.message === 'RESOURCE_NOT_FOUND') {
      return adminResourceNotFound()
    }
    return adminResourceServerError('[GET /api/v1/admin/resources/:id/objectives]', error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authorizeAdminResourceRequest(request, {
      key: 'admin:resources:objectives:update',
      limit: 30,
    })
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const id = await resolveRouteId(params)
    const body = await request.json()

    const parsed = parseWithSchema(
      PedagogicalObjectivesSchema,
      body,
      'Invalid objectives payload'
    )
    if (parsed instanceof NextResponse) {
      return parsed
    }

    const objectives = await updateResourceObjectives(id, parsed)

    return NextResponse.json({ objectives }, { status: 200 })
  } catch (error) {
    if (error instanceof Error && error.message === 'RESOURCE_NOT_FOUND') {
      return adminResourceNotFound()
    }
    return adminResourceServerError('[PUT /api/v1/admin/resources/:id/objectives]', error)
  }
}
