import { prisma } from '@/lib/db';

/**
 * Constantes de controle de uso
 */
export const LESSON_PLAN_MONTHLY_LIMIT = 15; // Limite de planos por mês

/**
 * Busca o uso mensal de planos de aula do usuário
 *
 * @param userId - ID do usuário
 * @param yearMonth - Mês no formato "YYYY-MM" (opcional, padrão: mês atual)
 * @returns Uso mensal: { used, limit, remaining, resetsAt }
 */
export async function getLessonPlanUsage(userId: string, yearMonth?: string) {
  // Se não fornecido, usar mês atual
  const targetYearMonth = yearMonth || getCurrentYearMonth();

  // Buscar registro de uso (ou criar se não existir)
  let usage = await prisma.lessonPlanUsage.findUnique({
    where: {
      userId_yearMonth: {
        userId,
        yearMonth: targetYearMonth,
      },
    },
  });

  // Se não existe, criar com count = 0
  if (!usage) {
    usage = await prisma.lessonPlanUsage.create({
      data: {
        userId,
        yearMonth: targetYearMonth,
        count: 0,
      },
    });
  }

  // Calcular data de reset (primeiro dia do próximo mês)
  const resetsAt = getNextMonthFirstDay(targetYearMonth);

  return {
    used: usage.count,
    limit: LESSON_PLAN_MONTHLY_LIMIT,
    remaining: Math.max(0, LESSON_PLAN_MONTHLY_LIMIT - usage.count),
    resetsAt,
    yearMonth: targetYearMonth,
  };
}

/**
 * Verifica se o usuário atingiu o limite mensal
 *
 * @param userId - ID do usuário
 * @returns true se pode criar mais planos, false se atingiu o limite
 */
export async function canCreateLessonPlan(userId: string): Promise<boolean> {
  const usage = await getLessonPlanUsage(userId);
  return usage.remaining > 0;
}

/**
 * Retorna o ano-mês atual no formato "YYYY-MM"
 */
export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Retorna o primeiro dia do próximo mês
 */
export function getNextMonthFirstDay(yearMonth: string): Date {
  const [year, month] = yearMonth.split('-').map(Number);

  // Próximo mês
  let nextMonth = month + 1;
  let nextYear = year;

  // Se passou de dezembro, vai para janeiro do próximo ano
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear++;
  }

  // Primeiro dia do próximo mês às 00:00:00 UTC
  return new Date(Date.UTC(nextYear, nextMonth - 1, 1, 0, 0, 0));
}
