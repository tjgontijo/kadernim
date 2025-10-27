'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { createResourceRequestSchema, updateResourceRequestSchema } from '@/lib/requests/validations'
import { getUserMonthlyRequestCount, hasUserVotedOnRequest } from '@/lib/requests/queries'
import { CreateResourceRequestInput, UpdateResourceRequestInput } from '@/lib/requests/validations'

export async function createResourceRequest(data: CreateResourceRequestInput) {
  try {
    console.log('🔵 [SERVER] createResourceRequest iniciado')
    console.log('📥 [SERVER] Dados recebidos:', data)
    
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    if (!session?.user?.id) {
      console.log('❌ [SERVER] Usuário não autenticado')
      return { error: 'Não autenticado' }
    }

    // Validar dados
    console.log('🔍 [SERVER] Validando com Zod...')
    const validatedData = createResourceRequestSchema.parse(data)
    console.log('✅ [SERVER] Validação passou:', validatedData)

    // Verificar limite de 2 solicitações por mês
    const monthlyCount = await getUserMonthlyRequestCount(session.user.id)
    if (monthlyCount >= 2) {
      return { error: 'Você atingiu o limite de 2 solicitações por mês' }
    }

    const request = await prisma.resourceRequest.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
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
      },
    })

    console.log('✨ [SERVER] Solicitação criada com sucesso:', request.id)
    return { data: request }
  } catch (error) {
    console.error('💥 [SERVER] Erro ao criar solicitação:', error)
    if (error instanceof Error) {
      console.error('📋 [SERVER] Mensagem de erro:', error.message)
      console.error('🔗 [SERVER] Stack:', error.stack)
    }
    return { error: 'Erro ao criar solicitação' }
  }
}

export async function updateResourceRequest(data: UpdateResourceRequestInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    if (!session?.user?.id) {
      return { error: 'Não autenticado' }
    }

    // Validar dados
    const validatedData = updateResourceRequestSchema.parse(data)

    // Verificar se o usuário é o criador
    const request = await prisma.resourceRequest.findUnique({
      where: { id: validatedData.id },
    })

    if (!request) {
      return { error: 'Solicitação não encontrada' }
    }

    if (request.userId !== session.user.id) {
      return { error: 'Você não tem permissão para editar esta solicitação' }
    }

    const updated = await prisma.resourceRequest.update({
      where: { id: validatedData.id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        educationLevelId: validatedData.educationLevelId,
        subjectId: validatedData.subjectId,
      },
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
      },
    })

    return { data: updated }
  } catch (error) {
    console.error('Erro ao atualizar solicitação:', error)
    return { error: 'Erro ao atualizar solicitação' }
  }
}

export async function deleteResourceRequest(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    if (!session?.user?.id) {
      return { error: 'Não autenticado' }
    }

    // Verificar se o usuário é o criador
    const request = await prisma.resourceRequest.findUnique({
      where: { id },
    })

    if (!request) {
      return { error: 'Solicitação não encontrada' }
    }

    if (request.userId !== session.user.id) {
      return { error: 'Você não tem permissão para deletar esta solicitação' }
    }

    await prisma.resourceRequest.delete({
      where: { id },
    })

    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar solicitação:', error)
    return { error: 'Erro ao deletar solicitação' }
  }
}

export async function voteResourceRequest(requestId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    if (!session?.user?.id) {
      return { error: 'Não autenticado' }
    }

    // Verificar se a solicitação existe
    const request = await prisma.resourceRequest.findUnique({
      where: { id: requestId },
    })

    if (!request) {
      return { error: 'Solicitação não encontrada' }
    }

    // Verificar se é o criador
    if (request.userId === session.user.id) {
      return { error: 'Você não pode votar em sua própria solicitação' }
    }

    // Verificar se já votou
    const hasVoted = await hasUserVotedOnRequest(session.user.id, requestId)

    if (hasVoted) {
      // Remover voto
      await prisma.resourceRequestVote.delete({
        where: {
          userId_requestId: {
            userId: session.user.id,
            requestId,
          },
        },
      })

      // Decrementar contador
      await prisma.resourceRequest.update({
        where: { id: requestId },
        data: {
          voteCount: {
            decrement: 1,
          },
        },
      })

      return { data: { voted: false } }
    } else {
      // Adicionar voto
      await prisma.resourceRequestVote.create({
        data: {
          userId: session.user.id,
          requestId,
        },
      })

      // Incrementar contador
      await prisma.resourceRequest.update({
        where: { id: requestId },
        data: {
          voteCount: {
            increment: 1,
          },
        },
      })

      return { data: { voted: true } }
    }
  } catch (error) {
    console.error('Erro ao votar:', error)
    return { error: 'Erro ao votar' }
  }
}
