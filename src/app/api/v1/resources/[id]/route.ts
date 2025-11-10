import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ResourceDetailSchema } from '@/lib/schemas/resource'
import { auth } from '@/lib/auth/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = session?.user?.id

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
        thumbUrl: true,
        educationLevel: true,
        subject: true,
        isFree: true,
        files: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
      },
    })

    if (!resource) {
      return NextResponse.json(
        { error: 'Recurso não encontrado' },
        { status: 404 }
      )
    }

    let hasAccess = resource.isFree

    if (!hasAccess) {
      const activeSubscription = await prisma.subscription.findFirst({
        where: {
          userId,
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        select: { id: true },
      })

      hasAccess = Boolean(activeSubscription)

      if (!hasAccess) {
        const accessEntry = await prisma.userResourceAccess.findFirst({
          where: {
            userId,
            resourceId: resource.id,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
          select: { id: true },
        })
        hasAccess = Boolean(accessEntry)
      }
    }

    const parsed = ResourceDetailSchema.parse({
      ...resource,
      hasAccess,
      files: resource.files.map((file) => ({
        id: file.id,
        name: file.name,
        createdAt: file.createdAt.toISOString(),
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