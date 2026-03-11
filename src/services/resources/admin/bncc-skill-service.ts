import { prisma } from '@/lib/db'

export async function listResourceBnccSkills(resourceId: string) {
  const links = await prisma.resourceBnccSkill.findMany({
    where: { resourceId },
    include: {
      bnccSkill: {
        select: { id: true, code: true, description: true },
      },
    },
  })

  return links.map((link) => link.bnccSkill)
}

export async function linkResourceBnccSkill(resourceId: string, bnccSkillId: string) {
  const [resource, skill] = await Promise.all([
    prisma.resource.findUnique({
      where: { id: resourceId },
      select: { id: true },
    }),
    prisma.bnccSkill.findUnique({
      where: { id: bnccSkillId },
      select: { id: true },
    }),
  ])

  if (!resource) {
    throw new Error('Resource not found')
  }

  if (!skill) {
    throw new Error('BNCC skill not found')
  }

  const link = await prisma.resourceBnccSkill.upsert({
    where: {
      resourceId_bnccSkillId: {
        resourceId,
        bnccSkillId,
      },
    },
    create: {
      resourceId,
      bnccSkillId,
    },
    update: {},
    include: {
      bnccSkill: {
        select: { id: true, code: true, description: true },
      },
    },
  })

  return {
    id: link.id,
    bnccSkill: link.bnccSkill,
  }
}

export async function unlinkResourceBnccSkill(resourceId: string, bnccSkillId: string) {
  await prisma.resourceBnccSkill.deleteMany({
    where: {
      resourceId,
      bnccSkillId,
    },
  })
}
