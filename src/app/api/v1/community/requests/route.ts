import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { prisma } from '@/lib/db'
import { getCommunityRequests, createCommunityRequest } from '@/services/community/request-service'
import { CommunityFilterSchema, CommunityRequestSchema } from '@/lib/schemas/community'

/**
 * GET /api/v1/community/requests
 * Lists community requests with filters.
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers })
        const userId = session?.user?.id

        const searchParams = request.nextUrl.searchParams
        const parsed = CommunityFilterSchema.safeParse({
            page: searchParams.get('page') ?? undefined,
            limit: searchParams.get('limit') ?? undefined,
            status: searchParams.get('status') ?? undefined,
            votingMonth: searchParams.get('votingMonth') ?? undefined,
            educationLevelId: searchParams.get('educationLevelId') ?? undefined,
            subjectId: searchParams.get('subjectId') ?? undefined,
            q: searchParams.get('q') ?? undefined,
            educationLevelSlug: searchParams.get('educationLevelSlug') ?? undefined,
            gradeSlug: searchParams.get('gradeSlug') ?? undefined,
            subjectSlug: searchParams.get('subjectSlug') ?? undefined,
        })

        if (!parsed.success) {
            return NextResponse.json({ error: 'Parâmetros inválidos', details: parsed.error.format() }, { status: 400 })
        }

        const result = await getCommunityRequests({
            ...parsed.data,
            currentUserId: userId
        })

        return NextResponse.json({ success: true, data: result })
    } catch (error) {
        console.error('[Community GET] Error:', error)
        return NextResponse.json({ success: false, error: 'Erro ao buscar pedidos' }, { status: 500 })
    }
}

import { uploadCommunityReference } from '@/server/clients/cloudinary/community-client'

/**
 * POST /api/v1/community/requests
 * Creates a new community request.
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Get user with role
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        })

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
        }

        // 2. Parse FormData
        const formData = await request.formData()

        const body = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            hasBnccAlignment: formData.get('hasBnccAlignment') === 'true',
            educationLevelId: formData.get('educationLevelId') as string || undefined,
            gradeId: formData.get('gradeId') as string || undefined,
            subjectId: formData.get('subjectId') as string || undefined,
            bnccSkillCodes: formData.getAll('bnccSkillCodes') as string[],
        }

        const parsed = CommunityRequestSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.format() }, { status: 400 })
        }

        // 3. Process Attachments
        const attachments = formData.getAll('attachments') as File[]
        const uploadResults = []

        if (attachments.length > 0) {
            // Usamos um ID temporário ou o timestamp para a pasta, já que o RequestId ainda não existe
            // O ideal é salvar o request e depois fazer o upload, ou usar um UUID pré-gerado
            const tempFolderId = `temp_${Date.now()}`

            for (const file of attachments) {
                const result = await uploadCommunityReference(file, 'community/uploads', tempFolderId)
                uploadResults.push({
                    cloudinaryPublicId: result.publicId,
                    url: result.url,
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                })
            }
        }

        const result = await createCommunityRequest(
            session.user.id,
            user.role as any,
            parsed.data,
            uploadResults
        )

        return NextResponse.json({ success: true, data: result })
    } catch (error: any) {
        console.error('[Community POST] Error:', error)
        return NextResponse.json({
            success: false,
            error: error.message || 'Erro ao criar pedido'
        }, { status: 400 })
    }
}
