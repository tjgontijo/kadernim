import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import {
  createResourceReview,
  getAllReviewsForResource,
  getApprovedReviewsForResource,
  moderateResourceReview,
} from '@/lib/resources/services/catalog/review-service'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params
    const session = await auth.api.getSession({ headers: req.headers })
    const isAdmin = session?.user?.role === 'admin'
    const reviews = isAdmin
      ? await getAllReviewsForResource(id)
      : await getApprovedReviewsForResource(id)

    return NextResponse.json({ data: reviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await ctx.params
    const body = await req.json()
    
    const review = await createResourceReview({
      resourceId: id,
      userId: session.user.id,
      rating: body.rating,
      comment: body.comment || null,
    })

    return NextResponse.json({ data: review }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create review'
    
    if (message === 'ALREADY_REVIEWED') {
      return NextResponse.json({ error: 'Você já avaliou este recurso' }, { status: 409 })
    }

    console.error('Error creating review:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await ctx.params
    const body = await req.json()
    const reviewId = typeof body.reviewId === 'string' ? body.reviewId : ''
    const action = typeof body.action === 'string' ? body.action : ''

    if (!reviewId || !['approve', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid moderation payload' },
        { status: 400 }
      )
    }

    const status = action === 'approve' ? 'APPROVED' : 'REJECTED'
    const review = await moderateResourceReview({
      resourceId: id,
      reviewId,
      moderatorId: session.user.id,
      status,
    })

    return NextResponse.json({ data: review })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to moderate review'

    if (message === 'REVIEW_NOT_FOUND') {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    console.error('Error moderating review:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
