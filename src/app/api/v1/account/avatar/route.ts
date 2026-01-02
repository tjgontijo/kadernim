import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/services/auth/session-service'
import { prisma } from '@/lib/db'
import { uploadImage } from '@/server/clients/cloudinary/image-client'

export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/account/avatar
 * Upload a new avatar for the current user
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Apenas JPG e PNG são permitidos' }, { status: 400 })
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            return NextResponse.json({ error: 'A imagem deve ter no máximo 2MB' }, { status: 400 })
        }

        // Upload to Cloudinary using existing helper
        const uploadResult = await uploadImage(
            file,
            `user-avatar-${session.user.id}`,
            'User Avatar'
        )

        // Update user with new avatar URL
        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                image: uploadResult.url,
            },
            select: {
                id: true,
                image: true,
            },
        })

        return NextResponse.json({
            message: 'Avatar atualizado com sucesso',
            image: user.image,
        })
    } catch (error) {
        console.error('[POST /api/v1/account/avatar]', error)
        return NextResponse.json(
            { error: 'Erro ao atualizar avatar' },
            { status: 500 }
        )
    }
}
