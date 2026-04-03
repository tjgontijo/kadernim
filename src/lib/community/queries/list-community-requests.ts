import { prisma } from '@/server/db'
import { getCurrentYearMonth } from '@/lib/utils/date'
import type { CommunityListFilters, CommunityRequestListResponse } from '@/lib/community/types'

export async function listCommunityRequests(
  filters: CommunityListFilters
): Promise<CommunityRequestListResponse> {
  const {
    page,
    limit,
    status,
    votingMonth,
    educationLevelId,
    subjectId,
    educationLevelSlug,
    gradeSlug,
    subjectSlug,
    q,
    currentUserId,
    mine,
  } = filters

  const skip = (page - 1) * limit
  const currentMonth = votingMonth || getCurrentYearMonth()

  const where: any = {
    votingMonth: currentMonth,
  }

  if (status) where.status = status
  if (educationLevelId) where.educationLevelId = educationLevelId
  if (subjectId) where.subjectId = subjectId
  if (educationLevelSlug) where.educationLevel = { slug: educationLevelSlug }
  if (gradeSlug) where.grade = { slug: gradeSlug }
  if (subjectSlug) where.subject = { slug: subjectSlug }
  if (mine && currentUserId) where.userId = currentUserId

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
        votes: currentUserId
          ? {
              where: { userId: currentUserId },
              take: 1,
            }
          : false,
      },
    }),
    prisma.communityRequest.count({ where }),
  ])

  return {
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      voteCount: item.voteCount,
      hasVoted: currentUserId ? item.votes.length > 0 : false,
      hasBnccAlignment: item.hasBnccAlignment,
      bnccSkillCodes: item.bnccSkillCodes,
      createdAt: item.createdAt.toISOString(),
      user: {
        name: item.user.name,
        image: item.user.image,
      },
      educationLevel: item.educationLevel ? { name: item.educationLevel.name } : null,
      subject: item.subject ? { name: item.subject.name } : null,
      grade: item.grade ? { name: item.grade.name } : null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}
