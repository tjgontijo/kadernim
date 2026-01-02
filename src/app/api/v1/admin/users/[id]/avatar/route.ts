import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/server/auth/middleware'
import { UserRole } from '@/types/user-role'
import { checkRateLimit } from '@/server/utils/rate-limit'
import { uploadImage } from '@/server/clients/cloudinary/image-client'
import { prisma } from '@/lib/db'

/**
 * POST /api/v1/admin/users/[id]/avatar
 * Upload a new avatar for a user
 * Admin only
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: targetUserId } = await params

        // Require manage users permission
        const authResult = await requirePermission(request, 'manage:users')
        if (authResult instanceof NextResponse) {
            return authResult
        }

        const { userId: adminId } = authResult

        // Rate limiting: 20 requests per minute per admin
        const rl = checkRateLimit(`admin:users:avatar:${adminId}`, {
            windowMs: 60_000,
            limit: 20,
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

        // Get file from form data
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: 'Nenhum arquivo enviado.' },
                { status: 400 }
            )
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

        // Verify user exists
        const user = await prisma.user.findUnique({
            where: { id: targetUserId },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Usuário não encontrado.' },
                { status: 404 }
            )
        }

        // Upload to Cloudinary
        // Note: for users, we might want a different folder or tags
        const uploadResult = await uploadImage(file, `user-avatar-${targetUserId}`, 'User Avatar')

        // Update user image field
        await prisma.user.update({
            where: { id: targetUserId },
            data: {
                image: uploadResult.url,
            },
        })

        return NextResponse.json({
            url: uploadResult.url,
            publicId: uploadResult.publicId,
        })
    } catch (error) {
        console.error('[POST /api/v1/admin/users/[id]/avatar]', error)
        return NextResponse.json(
            { error: 'Failed to upload avatar' },
            { status: 500 }
        )
    }
}
