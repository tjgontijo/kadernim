import { NextRequest, NextResponse } from 'next/server'
import { 
  authorizeAdminResourceRequest, 
  adminResourceServerError, 
  adminResourceNotFound, 
  resolveRouteId,
  parseWithSchema
} from '../../route-support'
import { 
  getPedagogicalContent, 
  updatePedagogicalContent 
} from '@/lib/resources/services/admin/pedagogy-service'
import { PedagogicalContentUpdateSchema } from '@/lib/resources/schemas/pedagogical-schemas'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authorizeAdminResourceRequest(request, {
      key: 'admin:resources:pedagogy:get',
      limit: 60,
    })
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const id = await resolveRouteId(params)
    const content = await getPedagogicalContent(id)

    return NextResponse.json({ content })
  } catch (error) {
    if (error instanceof Error && error.message === 'RESOURCE_NOT_FOUND') {
      return adminResourceNotFound()
    }
    return adminResourceServerError('[GET /api/v1/admin/resources/:id/pedagogy]', error)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authorizeAdminResourceRequest(request, {
      key: 'admin:resources:pedagogy:update',
      limit: 30,
    })
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const id = await resolveRouteId(params)
    const body = await request.json()
    
    const parsed = parseWithSchema(
      PedagogicalContentUpdateSchema,
      body,
      'Invalid pedagogical content'
    )
    if (parsed instanceof NextResponse) {
      return parsed
    }

    const updated = await updatePedagogicalContent(id, parsed)

    return NextResponse.json({ content: updated }, { status: 200 })
  } catch (error) {
    if (error instanceof Error && error.message === 'RESOURCE_NOT_FOUND') {
      return adminResourceNotFound()
    }
    return adminResourceServerError('[POST /api/v1/admin/resources/:id/pedagogy]', error)
  }
}
