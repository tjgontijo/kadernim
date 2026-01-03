import { prisma } from '@/lib/db';
import { getCurrentYearMonth } from './get-usage';

/**
 * Incrementa o contador de uso mensal do usuário
 *
 * Chamado após criar um novo plano de aula com sucesso
 *
 * @param userId - ID do usuário
 * @param yearMonth - Mês no formato "YYYY-MM" (opcional, padrão: mês atual)
 * @returns Novo count
 */
export async function incrementLessonPlanUsage(userId: string, yearMonth?: string): Promise<number> {
  const targetYearMonth = yearMonth || getCurrentYearMonth();

  // Usar upsert para criar ou atualizar atomicamente
  const usage = await prisma.lessonPlanUsage.upsert({
    where: {
      userId_yearMonth: {
        userId,
        yearMonth: targetYearMonth,
      },
    },
    create: {
      userId,
      yearMonth: targetYearMonth,
      count: 1,
    },
    update: {
      count: {
        increment: 1,
      },
    },
  });

  return usage.count;
}
