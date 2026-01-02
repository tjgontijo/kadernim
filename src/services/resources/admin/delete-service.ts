import { prisma } from '@/lib/db'

/**
 * Delete a resource by ID
 * Also deletes associated files and access records
 */
export async function deleteResourceService(
  resourceId: string,
  _adminId: string
): Promise<void> {
  // Check if resource exists
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
  })

  if (!resource) {
    throw new Error(`Resource with id ${resourceId} not found`)
  }

  // Delete all files associated with the resource
  await prisma.resourceFile.deleteMany({
    where: { resourceId },
  })

  // Delete all access records
  await prisma.resourceUserAccess.deleteMany({
    where: { resourceId },
  })

  // Delete the resource itself
  await prisma.resource.delete({
    where: { id: resourceId },
  })

  // Invalidate cache
  // TODO: revalidateTag('admin:resources') when Next.js cache API is available
}
