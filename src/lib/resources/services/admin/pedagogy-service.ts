import { prisma } from '@/lib/db'
import { PedagogicalContent, PedagogicalContentSchema } from '../../schemas/pedagogical-schemas'

/**
 * Get the pedagogical content for a specific resource
 */
export async function getPedagogicalContent(resourceId: string) {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    select: { pedagogicalContent: true }
  });

  if (!resource) {
    throw new Error('RESOURCE_NOT_FOUND');
  }

  // Se não houver nada, retorna um esqueleto válido ou null? 
  // O schema exige objetivos e steps. 
  // Se estiver vazio no banco, o frontend deve lidar ou retornamos um erro de validação (se quisermos garantir integridade)
  
  if (!resource.pedagogicalContent) {
      return null;
  }

  const validated = PedagogicalContentSchema.safeParse(resource.pedagogicalContent);
  if (!validated.success) {
      console.error('[getPedagogicalContent] Invalid content in DB:', validated.error);
      return null;
  }

  return validated.data;
}

/**
 * Update the pedagogical content for a resource
 */
export async function updatePedagogicalContent(resourceId: string, content: PedagogicalContent) {
  // Validate again just to be sure
  const validated = PedagogicalContentSchema.parse(content);

  const resource = await prisma.resource.update({
    where: { id: resourceId },
    data: {
      pedagogicalContent: validated as any // Usamos cast pq o Prisma vê como Json
    }
  });

  return resource.pedagogicalContent;
}
