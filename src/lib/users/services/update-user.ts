import { prisma } from '@/lib/db'
import { randomPassword } from '@/lib/utils/password'
import type { CreateAdminUserInput, UpdateUserInput } from '@/lib/users/schemas'
import { auth } from '@/server/auth/auth'

export async function updateUserService(userId: string, data: UpdateUserInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      banned: data.banned,
    },
    include: {
      subscription: {
        select: {
          isActive: true,
          expiresAt: true,
        },
      },
    },
  })

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    image: user.image,
    role: user.role,
    emailVerified: user.emailVerified,
    banned: user.banned,
    subscription: user.subscription,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export async function createAdminUserService(data: CreateAdminUserInput) {
  let user = await prisma.user.findUnique({ where: { email: data.email } })

  if (user) {
    throw new Error('USER_EMAIL_EXISTS')
  }

  await (auth.api.signUpEmail as unknown as (params: { body: Record<string, unknown> }) => Promise<unknown>)({
    body: {
      name: data.name,
      email: data.email,
      password: randomPassword(),
    },
  })

  user = await prisma.user.findUniqueOrThrow({ where: { email: data.email } })

  return prisma.user.update({
    where: { email: data.email },
    data: {
      name: data.name,
      phone: data.phone || null,
      role: data.role,
      emailVerified: false,
    },
  })
}

export async function updateUserAvatarService(userId: string, imageUrl: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })

  if (!user) {
    throw new Error('USER_NOT_FOUND')
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      image: imageUrl,
    },
  })
}

export async function deleteUserService(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error('Usuário não encontrado')
  }

  await prisma.user.delete({
    where: { id: userId },
  })

  return { success: true }
}
