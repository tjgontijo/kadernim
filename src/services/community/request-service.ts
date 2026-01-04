import { prisma } from '@/lib/db'
import { CommunityFilters, CommunityRequestInput } from '@/lib/schemas/community'
import { getCurrentYearMonth } from '@/lib/utils/date'
import { emitEvent } from '@/lib/events/emit'

const MAX_VOTES_PER_MONTH = 5
const MAX_REQUESTS_PER_MONTH = 1

/**
 * Lists community requests with pagination and filters.
 */
export async function getCommunityRequests(filters: CommunityFilters & { currentUserId?: string }) {
    const { page, limit, status, votingMonth, educationLevelId, subjectId, currentUserId } = filters
    const skip = (page - 1) * limit
    const currentMonth = votingMonth || getCurrentYearMonth()

    const where: any = {
        votingMonth: currentMonth,
    }

    if (status) where.status = status
    if (educationLevelId) where.educationLevelId = educationLevelId
    if (subjectId) where.subjectId = subjectId

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
 * Enforces: 1 request per month, and must have voted at least once.
 */
export async function createCommunityRequest(userId: string, data: CommunityRequestInput) {
    const currentMonth = getCurrentYearMonth()

    // 1. Check if user has already made a request this month
    const existingRequest = await prisma.communityRequest.findFirst({
        where: {
            userId,
            votingMonth: currentMonth,
        },
    })

    if (existingRequest) {
        throw new Error('Você já criou um pedido este mês.')
    }

    // 2. Check if user has voted at least once this month
    const hasVoted = await prisma.communityRequestVote.findFirst({
        where: {
            userId,
            votingMonth: currentMonth,
        },
    })

    if (!hasVoted) {
        throw new Error('Você precisa votar em pelo menos um pedido antes de sugerir o seu.')
    }

    const request = await prisma.communityRequest.create({
        data: {
            ...data,
            userId,
            votingMonth: currentMonth,
            status: 'voting', // Pedidos criados já entram em votação
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
 * Enforces: 5 votes per month total, 1 vote per request.
 */
export async function voteForRequest(userId: string, requestId: string) {
    const currentMonth = getCurrentYearMonth()

    return await prisma.$transaction(async (tx) => {
        // 1. Check total votes this month
        const totalVotes = await tx.communityRequestVote.count({
            where: {
                userId,
                votingMonth: currentMonth,
            },
        })

        if (totalVotes >= MAX_VOTES_PER_MONTH) {
            throw new Error(`Você já atingiu seu limite de ${MAX_VOTES_PER_MONTH} votos este mês.`)
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

        // 3. Create vote
        await tx.communityRequestVote.create({
            data: {
                requestId,
                userId,
                votingMonth: currentMonth,
            },
        })

        // 4. Increment counter in Request
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
