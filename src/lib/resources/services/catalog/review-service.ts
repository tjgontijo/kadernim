import { prisma } from '@/server/db'

export async function getApprovedReviewsForResource(resourceId: string) {
  return prisma.review.findMany({
    where: {
      resourceId,
      status: 'APPROVED',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          roleTitle: true,
          location: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function createResourceReview(params: {
  resourceId: string
  userId: string
  rating: number
  comment: string | null
}) {
  const { resourceId, userId, rating, comment } = params

  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5')
  }

  // Check if user already reviewed
  const existing = await prisma.review.findUnique({
    where: {
      resourceId_userId: {
        resourceId,
        userId,
      },
    },
  })

  if (existing) {
    throw new Error('ALREADY_REVIEWED')
  }

  return prisma.review.create({
    data: {
      resourceId,
      userId,
      rating,
      comment,
      status: 'PENDING', // All new reviews start as pending for moderation
    },
  })
}

export async function updateResourceRatingCache(resourceId: string) {
  const stats = await prisma.review.aggregate({
    where: {
      resourceId,
      status: 'APPROVED',
    },
    _avg: {
      rating: true,
    },
    _count: {
      id: true,
    },
  })

  await prisma.resource.update({
    where: { id: resourceId },
    data: {
      averageRating: stats._avg.rating || 0,
      reviewCount: stats._count.id || 0,
    },
  })
}
