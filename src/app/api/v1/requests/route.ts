// Remover include de votes completos e usar _count para voteCount
// Para hasUserVoted, usar uma query de count separada se necessário

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const educationLevelId = searchParams.get('educationLevelId') || undefined
    const subjectId = searchParams.get('subjectId') || undefined
    const myRequests = searchParams.get('myRequests') === 'true'

    // Obter sessão do usuário
    const session = await auth.api.getSession({ headers: await headers() })
    const userId = session?.user?.id

    interface WhereClause {
      educationLevelId?: string
      subjectId?: string
      userId?: string
    }

    const where: WhereClause = {}

    if (educationLevelId) {
      where.educationLevelId = educationLevelId
    }

    if (subjectId) {
      where.subjectId = subjectId
    }

    if (myRequests && userId) {
      where.userId = userId
    }

    // Função cacheada para buscar requests
    const getRequests = unstable_cache(
      async (whereClause: WhereClause, userId?: string) => {
        const requests = await prisma.resourceRequest.findMany({
          where: whereClause,
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
            _count: {
              select: {
                votes: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
        })

        // Adicionar hasUserVoted sem carregar todos os votes
        const requestsWithVotes = await Promise.all(
          requests.map(async (req) => {
            let hasUserVoted = false
            if (userId) {
              const voteCount = await prisma.resourceRequestVote.count({
                where: {
                  requestId: req.id,
                  userId: userId
                }
              })
              hasUserVoted = voteCount > 0
            }
            return {
              ...req,
              voteCount: req._count.votes,
              hasUserVoted
            }
          })
        )

        return requestsWithVotes
      },
      ['resource-requests', JSON.stringify(where)], // Chave de cache baseada em filtros
      { revalidate: 300, tags: ['resource-requests'] } // Cache de 5 min, tag para invalidação
    )

    const requests = await getRequests(where, userId)

    return NextResponse.json(requests)
  } catch (error) {
    console.error('Erro ao buscar solicitações:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar solicitações' },
      { status: 500 }
    )
  }
}
