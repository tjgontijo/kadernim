import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { authorizeAdminResourceRequest } from '@/app/api/v1/admin/resources/route-support'
import { getFromR2 } from '@/lib/storage/r2'
import { generateSinglePreviewImageFromPdf } from '@/services/resources/storage-service'
import { slugify } from '@/lib/utils/string'

function extractPageNumberFromAlt(alt: string | null | undefined): number | null {
  if (!alt) return null
  const match = alt.match(/p[áa]gina\s+(\d+)/i)
  if (!match) return null
  const page = Number(match[1])
  return Number.isFinite(page) ? page : null
}

/**
 * POST /api/v1/admin/resources/:id/files/:fileId/images/generate-next
 * Generates one additional preview image for the given PDF file.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const authResult = await authorizeAdminResourceRequest(request, {
      key: 'admin:resources:file-previews:generate-next',
      limit: 60,
    })

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id: resourceId, fileId } = await params

    const file = await prisma.resourceFile.findUnique({
      where: { id: fileId },
      include: {
        resource: {
          select: {
            id: true,
            title: true,
            slug: true,
            googleDriveUrl: true,
          },
        },
        images: {
          select: {
            id: true,
            alt: true,
            order: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!file || file.resourceId !== resourceId) {
      return NextResponse.json({ error: 'Arquivo não encontrado para o recurso' }, { status: 404 })
    }

    if (!file.resource.googleDriveUrl) {
      return NextResponse.json(
        { error: 'A geração extra de preview requer link do Google Drive no recurso.' },
        { status: 400 }
      )
    }

    const isPdf = (file.fileType || '').toLowerCase().includes('pdf') || file.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      return NextResponse.json({ error: 'Prévia adicional só é suportada para PDF' }, { status: 400 })
    }

    const pdfBuffer = await getFromR2(file.cloudinaryPublicId)

    const parsedPages = file.images
      .map((img) => extractPageNumberFromAlt(img.alt))
      .filter((page): page is number => page !== null)

    const nextPage = parsedPages.length > 0
      ? Math.max(...parsedPages) + 1
      : file.images.length + 1

    const nextOrder = file.images.length

    const preview = await generateSinglePreviewImageFromPdf({
      resourceSlug: file.resource.slug || slugify(file.resource.title || file.resourceId),
      resourceTitle: file.resource.title,
      driveFolderId: 'manual',
      driveFileId: file.id,
      pdfFileName: file.name,
      pdfBuffer,
      fileDisplayName: file.name,
      pageNumber: nextPage,
      previewOrder: nextOrder + 1,
    })

    const created = await prisma.resourceFileImage.create({
      data: {
        fileId: file.id,
        cloudinaryPublicId: preview.cloudinaryPublicId,
        url: preview.url,
        alt: preview.alt,
        order: nextOrder,
      },
    })

    return NextResponse.json({
      id: created.id,
      cloudinaryPublicId: created.cloudinaryPublicId,
      url: created.url,
      alt: created.alt,
      order: created.order,
    }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao gerar nova prévia'

    if (
      message.includes('PREVIEW_PAGE_NOT_AVAILABLE') ||
      message.includes('Requested page') ||
      message.includes('page')
    ) {
      return NextResponse.json(
        { error: 'Não há mais páginas disponíveis para gerar preview.' },
        { status: 400 }
      )
    }

    console.error('[POST /api/v1/admin/resources/:id/files/:fileId/images/generate-next]', error)
    return NextResponse.json({ error: 'Erro ao gerar nova prévia' }, { status: 500 })
  }
}
