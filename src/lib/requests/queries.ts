import { prisma } from '@/lib/prisma'
import { ResourceRequestStatus, ResourceRequestWithRelations } from '@/types/request'

interface GetResourceRequestsParams {
  status?: ResourceRequestStatus
  educationLevelId?: string
  subjectId?: string
  myRequests?: boolean
  userId?: string
}

interface WhereClause {
  status?: ResourceRequestStatus
  educationLevelId?: string
  subjectId?: string
  userId?: string
}

export async function getResourceRequests(
  params: GetResourceRequestsParams
): Promise<ResourceRequestWithRelations[]> {
  const { status, educationLevelId, subjectId, myRequests, userId } = params

  const where: WhereClause = {}

  if (status) {
    where.status = status
  }

  if (educationLevelId) {
    where.educationLevelId = educationLevelId
  }

  if (subjectId) {
    where.subjectId = subjectId
  }

  if (myRequests && userId) {
    where.userId = userId
  }

  const requests = await prisma.resourceRequest.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      educationLevel: {
        select: {
          id: true,
          name: true,
        },
      },
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
      votes: {
        select: {
          id: true,
          userId: true,
          createdAt: true,
        },
      },
    },
    orderBy:
      status === 'SUBMITTED'
        ? { voteCount: 'desc' }
        : { createdAt: 'desc' },
  })

  return requests as ResourceRequestWithRelations[]
}

export async function getResourceRequestById(
  id: string,
  userId?: string
): Promise<ResourceRequestWithRelations | null> {
  const request = await prisma.resourceRequest.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      educationLevel: {
        select: {
          id: true,
          name: true,
        },
      },
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
      votes: {
        select: {
          id: true,
          userId: true,
          createdAt: true,
        },
      },
    },
  })

  if (!request) return null

  return {
    ...request,
    hasUserVoted: userId ? request.votes?.some((v: { userId: string }) => v.userId === userId) : false,
    isCreator: userId ? request.userId === userId : false,
  } as ResourceRequestWithRelations
}

export async function getUserMonthlyRequestCount(userId: string): Promise<number> {
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const count = await prisma.resourceRequest.count({
    where: {
      userId,
      createdAt: {
        gte: firstDayOfMonth,
      },
    },
  })

  return count
}

export async function hasUserVotedOnRequest(
  userId: string,
  requestId: string
): Promise<boolean> {
  const vote = await prisma.resourceRequestVote.findUnique({
    where: {
      userId_requestId: {
        userId,
        requestId,
      },
    },
  })

  return !!vote
}

export async function getEducationLevels() {
  return prisma.educationLevel.findMany({
    orderBy: { name: 'asc' },
  })
}

export async function getSubjects() {
  return prisma.subject.findMany({
    orderBy: { name: 'asc' },
  })
}
