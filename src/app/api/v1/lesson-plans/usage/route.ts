import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { getLessonPlanUsage } from '@/services/lesson-plans/get-usage';

/**
 * GET /api/v1/lesson-plans/usage
 *
 * Retorna o uso mensal de planos de aula do usuário autenticado
 *
 * Resposta:
 * {
 *   success: true,
 *   data: {
 *     used: 3,
 *     limit: 15,
 *     remaining: 12,
 *     resetsAt: "2026-02-01T00:00:00.000Z",
 *     yearMonth: "2026-01"
 *   }
 * }
 */
export async function GET() {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: await (async () => {
        const h = new Headers();
        // Get headers from request (Next.js 15+ pattern)
        const { headers } = await import('next/headers');
        const headersList = await headers();
        headersList.forEach((value, key) => {
          h.append(key, value);
        });
        return h;
      })(),
    });

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Não autenticado',
        },
        { status: 401 }
      );
    }

    // Buscar uso mensal
    const usage = await getLessonPlanUsage(session.user.id);

    return NextResponse.json({
      success: true,
      data: usage,
    });
  } catch (error) {
    console.error('[GET /api/v1/lesson-plans/usage] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar uso mensal',
      },
      { status: 500 }
    );
  }
}
