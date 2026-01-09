import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ResourceDetailSchema } from '@/lib/schemas/resource'
import { auth } from '@/server/auth/auth'
import { isStaff } from '@/lib/auth/roles'

import {
  computeHasAccessForResource,
  type SubscriptionContext,
  type UserAccessContext,
} from '@/services/auth/access-service'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = session?.user?.id
    const role = session?.user?.role ?? null

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await ctx.params

    if (!id) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const resource = await prisma.resource.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        // thumbUrl removed
        educationLevel: { select: { slug: true } },
        subject: { select: { slug: true } },
        isFree: true,
        files: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
        images: {
          select: {
            id: true,
            alt: true,
            order: true,
            url: true,
          },
          orderBy: { order: 'asc' },
        },
        videos: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            duration: true,
            order: true,
            url: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    }) as any

    if (!resource) {
      return NextResponse.json(
        { error: 'Recurso não encontrado' },
        { status: 404 }
      )
    }

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { id: true },
    })

    const userContext: UserAccessContext = {
      userId,
      isAdmin: isStaff(role as any),
    }

    const subscriptionContext: SubscriptionContext = {
      hasActiveSubscription: Boolean(activeSubscription),
    }

    const hasAccess = await computeHasAccessForResource(
      userContext,
      subscriptionContext,
      {
        resourceId: resource.id,
        isFree: resource.isFree,
      }
    )

    const parsed = ResourceDetailSchema.parse({
      ...resource,
      educationLevel: resource.educationLevel.slug,
      subject: resource.subject.slug,
      hasAccess,
      thumbUrl: resource.images?.[0]?.url || null,
      files: resource.files.map((file: any) => ({
        id: file.id,
        name: file.name,
        createdAt: file.createdAt.toISOString(),
      })),
      images: resource.images.map((img: any) => ({
        id: img.id,
        alt: img.alt,
        order: img.order,
        url: img.url,
      })),
      videos: (resource.videos || []).map((vid: any) => ({
        id: vid.id,
        title: vid.title,
        thumbnail: vid.thumbnail,
        duration: vid.duration,
        order: vid.order,
        url: vid.url,
      })),
    })

    return NextResponse.json(
      { data: parsed },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
          'CDN-Cache-Control': 'public, max-age=300',
        },
      }
    )
  } catch (error) {
    console.error('Erro ao buscar recurso:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar o recurso' },
      { status: 500 }
    )
  }
}
