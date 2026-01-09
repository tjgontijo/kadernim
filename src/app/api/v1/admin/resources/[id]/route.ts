import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/server/auth/middleware'
import { UserRole } from '@/types/user-role'
import { checkRateLimit } from '@/server/utils/rate-limit'
import { prisma } from '@/lib/db'
import {
  UpdateResourceSchema,
  ResourceDetailResponseSchema,
} from '@/lib/schemas/admin/resources'


/**
 * GET /api/v1/admin/resources/:id
 * Get resource details
 * Admin only
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require manage resources permission
    const authResult = await requirePermission(request, 'manage:resources')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { userId } = authResult
    const { id } = await params

    // Rate limiting: 60 requests per minute per admin
    const rl = checkRateLimit(`admin:resources:get:${userId}`, {
      windowMs: 60_000,
      limit: 60,
    })

    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'rate_limited' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rl.retryAfter),
          },
        }
      )
    }

    // Fetch resource with relations
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        educationLevel: true,
        subject: true,
        files: {
          select: {
            id: true,
            name: true,
            cloudinaryPublicId: true,
            url: true,
            fileType: true,
            sizeBytes: true,
            createdAt: true,
          },
        },
        images: {
          select: {
            id: true,
            cloudinaryPublicId: true,
            url: true,
            alt: true,
            order: true,
            createdAt: true,
          },
          orderBy: { order: 'asc' },
        },
        videos: {
          select: {
            id: true,
            title: true,
            cloudinaryPublicId: true,
            url: true,
            thumbnail: true,
            duration: true,
            order: true,
            createdAt: true,
          },
        },
        accessEntries: {
          select: { id: true },
        },
        grades: {
          include: {
            grade: {
              select: { slug: true }
            }
          }
        },
      },
    })

    if (!resource) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Fetch BNCC skills linked to the resource separately (to avoid Prisma include issues)
    const bnccLinks = await prisma.resourceBnccSkill.findMany({
      where: { resourceId: id },
      include: {
        bnccSkill: {
          select: { id: true, code: true, description: true }
        }
      }
    })

    // Compute stats
    const totalUsers = await prisma.resourceUserAccess.count({
      where: { resourceId: id },
    })

    const accessGrants = await prisma.resourceUserAccess.count({
      where: {
        resourceId: id,
        expiresAt: { not: null },
      },
    })

    const subscriberAccess = await prisma.resourceUserAccess.count({
      where: {
        resourceId: id,
        expiresAt: null,
      },
    })

    // Build response
    const response = {
      id: resource.id,
      title: resource.title,
      description: resource.description,
      educationLevel: resource.educationLevel?.slug,
      subject: resource.subject?.slug,
      externalId: resource.externalId,
      isFree: resource.isFree,
      thumbUrl: resource.images?.[0]?.url || null,
      grades: resource.grades.map(g => g.grade?.slug).filter(Boolean),
      createdAt: resource.createdAt.toISOString(),
      updatedAt: resource.updatedAt.toISOString(),
      files: resource.files.map(f => ({
        id: f.id,
        name: f.name,
        cloudinaryPublicId: f.cloudinaryPublicId,
        url: f.url,
        fileType: f.fileType,
        sizeBytes: f.sizeBytes,
        createdAt: f.createdAt.toISOString(),
      })),
      images: resource.images.map(img => ({
        id: img.id,
        cloudinaryPublicId: img.cloudinaryPublicId,
        url: img.url,
        alt: img.alt,
        order: img.order,
        createdAt: img.createdAt.toISOString(),
      })),
      videos: resource.videos.map(vid => ({
        id: vid.id,
        title: vid.title,
        cloudinaryPublicId: vid.cloudinaryPublicId,
        url: vid.url,
        thumbnail: vid.thumbnail,
        duration: vid.duration,
        order: vid.order,
        createdAt: vid.createdAt.toISOString(),
      })),
      stats: {
        totalUsers,
        accessGrants,
        subscriberAccess,
      },
      bnccSkills: bnccLinks.map(l => ({
        id: l.bnccSkill.id,
        code: l.bnccSkill.code,
        description: l.bnccSkill.description,
      })),
    }

    // Validate response
    const validated = ResourceDetailResponseSchema.safeParse(response)
    if (!validated.success) {
      console.error('Response validation failed:', validated.error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    return NextResponse.json(validated.data, {
      headers: {
        'Cache-Control': 'private, max-age=30',
      },
    })
  } catch (error) {
    console.error('[GET /api/v1/admin/resources/:id]', error)
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/v1/admin/resources/:id
 * Update a resource
 * Admin only
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require manage resources permission
    const authResult = await requirePermission(request, 'manage:resources')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { userId } = authResult
    const { id } = await params

    // Rate limiting: 30 requests per minute per admin
    const rl = checkRateLimit(`admin:resources:update:${userId}`, {
      windowMs: 60_000,
      limit: 30,
    })

    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'rate_limited' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rl.retryAfter),
          },
        }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const parsed = UpdateResourceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: parsed.error.format(),
        },
        { status: 400 }
      )
    }

    // Update resource
    const { updateResourceService } = await import('@/services/resources')
    await updateResourceService({
      id,
      ...parsed.data,
      adminId: userId,
    })

    // Fetch updated resource with relations
    const updated = await prisma.resource.findUnique({
      where: { id },
      include: {
        educationLevel: true,
        subject: true,
        files: {
          select: {
            id: true,
            name: true,
            cloudinaryPublicId: true,
            url: true,
            fileType: true,
            sizeBytes: true,
            createdAt: true,
          },
        },
        images: {
          take: 1,
          orderBy: { order: 'asc' },
          select: { url: true },
        },
        accessEntries: {
          select: { id: true },
        },
        grades: {
          include: {
            grade: {
              select: { slug: true }
            }
          }
        },
      },
    })

    if (!updated) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const totalUsers = await prisma.resourceUserAccess.count({
      where: { resourceId: id },
    })

    const accessGrants = await prisma.resourceUserAccess.count({
      where: {
        resourceId: id,
        expiresAt: { not: null },
      },
    })

    const subscriberAccess = await prisma.resourceUserAccess.count({
      where: {
        resourceId: id,
        expiresAt: null,
      },
    })

    const response = {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      educationLevel: updated.educationLevel.slug,
      subject: updated.subject.slug,
      externalId: updated.externalId,
      isFree: updated.isFree,
      grades: updated.grades.map(rg => rg.grade.slug),
      thumbUrl: updated.images?.[0]?.url || null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      files: updated.files.map((f) => ({
        id: f.id,
        name: f.name,
        cloudinaryPublicId: f.cloudinaryPublicId,
        url: f.url,
        fileType: f.fileType,
        sizeBytes: f.sizeBytes,
        createdAt: f.createdAt.toISOString(),
      })),
      stats: {
        totalUsers,
        accessGrants,
        subscriberAccess,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[PUT /api/v1/admin/resources/:id]', error)

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
    }

    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/v1/admin/resources/:id
 * Delete a resource
 * Admin only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require manage resources permission
    const authResult = await requirePermission(request, 'manage:resources')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { userId } = authResult
    const { id } = await params

    // Rate limiting: 10 requests per minute per admin
    const rl = checkRateLimit(`admin:resources:delete:${userId}`, {
      windowMs: 60_000,
      limit: 10,
    })

    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'rate_limited' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rl.retryAfter),
          },
        }
      )
    }

    // Delete resource
    const { deleteResourceService } = await import('@/services/resources')
    await deleteResourceService(id, userId)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[DELETE /api/v1/admin/resources/:id]', error)

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
    }

    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
