import { NextRequest, NextResponse } from 'next/server'
import { getCommunityRequests, createCommunityRequest } from '@/services/community/request-service'
import { getUserRole } from '@/services/users/get-user-role'
import {
    communityServerError,
    getCommunitySession,
    parseCommunityFilters,
    parseCommunityRequestBody,
    uploadCommunityAttachments,
} from './route-support'

/**
 * GET /api/v1/community/requests
 * Lists community requests with filters.
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getCommunitySession(request)
        const userId = session?.user?.id

        const parsed = parseCommunityFilters(request)
        if (parsed instanceof NextResponse) {
            return parsed
        }

        const result = await getCommunityRequests({
            ...parsed,
            currentUserId: userId
        })

        return NextResponse.json({ success: true, data: result })
    } catch (error) {
        return communityServerError('[Community GET] Error:', error)
    }
}

/**
 * POST /api/v1/community/requests
 * Creates a new community request.
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getCommunitySession(request)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userRole = await getUserRole(session.user.id)
        const parsed = await parseCommunityRequestBody(request)
        if ('error' in parsed) {
            return parsed.error
        }

        const attachments = parsed.formData.getAll('attachments') as File[]
        const uploadResults = await uploadCommunityAttachments(attachments)

        const result = await createCommunityRequest(
            session.user.id,
            userRole as any,
            parsed.data,
            uploadResults
        )

        return NextResponse.json({ success: true, data: result })
    } catch (error: any) {
        if (error instanceof Error && error.message === 'User not found') {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
        }

        return communityServerError('[Community POST] Error:', error, 400)
    }
}
