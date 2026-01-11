import { prisma } from '@/lib/db'
import { CommunityFilters, CommunityRequestInput } from '@/lib/schemas/community'
import { getCurrentYearMonth } from '@/lib/utils/date'
import { emitEvent } from '@/lib/events/emit'
import { getCommunityConfig, getVoteLimitByRole } from '@/services/config/system-config'
import { type UserRoleType } from '@/types/user-role'

/**
 * Lists community requests with pagination and filters.
 */
export async function getCommunityRequests(filters: CommunityFilters & { currentUserId?: string }) {
    const {
        page, limit, status, votingMonth,
        educationLevelId, subjectId,
        educationLevelSlug, gradeSlug, subjectSlug,
        q, currentUserId
    } = filters
    const skip = (page - 1) * limit
    const currentMonth = votingMonth || getCurrentYearMonth()

    const where: any = {
        votingMonth: currentMonth,
    }

    if (status) where.status = status
    if (educationLevelId) where.educationLevelId = educationLevelId
    if (subjectId) where.subjectId = subjectId

    // Slugs Filters (Cascading)
    if (educationLevelSlug) where.educationLevel = { slug: educationLevelSlug }
    if (gradeSlug) where.grade = { slug: gradeSlug }
    if (subjectSlug) where.subject = { slug: subjectSlug }

    if (q) {
        where.OR = [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
        ]
    }

    const [items, total] = await Promise.all([
        prisma.communityRequest.findMany({
            where,
            orderBy: [
                { voteCount: 'desc' },
                { createdAt: 'asc' },
            ],
            skip,
            take: limit,
            include: {
                user: {
                    select: { name: true, image: true },
                },
                educationLevel: { select: { name: true } },
                subject: { select: { name: true } },
                grade: { select: { name: true } },
                _count: {
                    select: { votes: true },
                },
                votes: currentUserId ? {
                    where: { userId: currentUserId },
                    take: 1
                } : false
            },
        }),
        prisma.communityRequest.count({ where }),
    ])

    return {
        items: items.map(item => ({
            ...item,
            hasVoted: currentUserId ? item.votes.length > 0 : false,
            votes: undefined // Remove array from output
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    }
}

/**
 * Creates a new community request.
 * Enforces: configurable request limit per month, and must have voted minimum times.
 */
export async function createCommunityRequest(userId: string, userRole: UserRoleType, data: CommunityRequestInput) {
    const currentMonth = getCurrentYearMonth()
    const config = await getCommunityConfig()

    // 1. Check if user can create (role check)
    if (userRole === 'user') {
        throw new Error('Você precisa ser assinante para criar solicitações.')
    }

    // 2. Check if user has already made max requests this month
    const existingRequests = await prisma.communityRequest.count({
        where: {
            userId,
            votingMonth: currentMonth,
        },
    })

    if (existingRequests >= config.requests.limit) {
        throw new Error(`Você já criou ${config.requests.limit} pedido(s) este mês.`)
    }

    // 3. Check if user has voted enough this month
    const voteCount = await prisma.communityRequestVote.count({
        where: {
            userId,
            votingMonth: currentMonth,
        },
    })

    if (voteCount < config.requests.minVotes) {
        throw new Error(`Você precisa votar em pelo menos ${config.requests.minVotes} pedido(s) antes de sugerir o seu.`)
    }

    const request = await prisma.communityRequest.create({
        data: {
            title: data.title,
            description: data.description,
            hasBnccAlignment: data.hasBnccAlignment,
            educationLevelId: data.hasBnccAlignment ? data.educationLevelId : null,
            gradeId: data.hasBnccAlignment ? data.gradeId : null,
            subjectId: data.hasBnccAlignment ? data.subjectId : null,
            bnccSkillCodes: data.bnccSkillCodes || [],
            userId,
            votingMonth: currentMonth,
            status: 'voting',
        },
    })

    // Emit Event
    await emitEvent({
        type: 'community.request.created',
        payload: {
            requestId: request.id,
            userId: request.userId,
            title: request.title,
        },
    })

    return request
}

/**
 * Casts a vote for a community request.
 * Enforces: configurable votes per month by role, 1 vote per request, cannot vote on own request.
 */
export async function voteForRequest(userId: string, userRole: UserRoleType, requestId: string) {
    const currentMonth = getCurrentYearMonth()
    const config = await getCommunityConfig()

    // Get vote limit based on user role
    const maxVotes = getVoteLimitByRole(userRole, config)

    if (maxVotes === 0) {
        throw new Error('Você precisa ser assinante para votar.')
    }

    return await prisma.$transaction(async (tx) => {
        // 1. Check total votes this month
        const totalVotes = await tx.communityRequestVote.count({
            where: {
                userId,
                votingMonth: currentMonth,
            },
        })

        if (totalVotes >= maxVotes) {
            throw new Error(`Você já atingiu seu limite de ${maxVotes} votos este mês.`)
        }

        // 2. Check if already voted for THIS request
        const existingVote = await tx.communityRequestVote.findUnique({
            where: {
                requestId_userId: {
                    requestId,
                    userId,
                },
            },
        })

        if (existingVote) {
            throw new Error('Você já votou neste pedido.')
        }

        // 3. Check if user is trying to vote on their own request
        const request = await tx.communityRequest.findUnique({
            where: { id: requestId },
            select: { userId: true }
        })

        if (request?.userId === userId) {
            throw new Error('Você não pode votar na sua própria solicitação.')
        }

        // 4. Create vote
        await tx.communityRequestVote.create({
            data: {
                requestId,
                userId,
                votingMonth: currentMonth,
            },
        })

        // 5. Increment counter in Request
        const updatedRequest = await tx.communityRequest.update({
            where: { id: requestId },
            data: {
                voteCount: { increment: 1 },
            },
        })

        // Emit Event
        await emitEvent({
            type: 'community.request.voted',
            payload: {
                requestId,
                userId,
                newVoteCount: updatedRequest.voteCount,
            },
        })

        return updatedRequest
    })
}
