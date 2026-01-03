import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/v1/lesson-plans/[id]
 * 
 * Retorna os detalhes de um plano específico
 * Inclui descrições completas das habilidades BNCC
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Verificar autenticação
        const session = await auth.api.getSession({
            headers: await (async () => {
                const h = new Headers();
                const { headers } = await import('next/headers');
                const headersList = await headers();
                headersList.forEach((value, key) => {
                    h.append(key, value);
                });
                return h;
            })(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        // 2. Buscar plano no banco
        const plan = await prisma.lessonPlan.findUnique({
            where: { id },
        });

        if (!plan) {
            return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });
        }

        // 3. Verificar permissão (apenas dono ou admin)
        const isAdmin = session.user.role === 'admin';
        if (plan.userId !== session.user.id && !isAdmin) {
            return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
        }

        // 4. Buscar descrições das habilidades BNCC para enriquecer a visualização
        const bnccSkillDescriptions = await prisma.bnccSkill.findMany({
            where: {
                code: {
                    in: plan.bnccSkillCodes || [],
                },
            },
            select: {
                code: true,
                description: true,
                fieldOfExperience: true,
                ageRange: true,
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                ...plan,
                bnccSkillDescriptions,
            },
        });
    } catch (error) {
        console.error('[GET /api/v1/lesson-plans/[id]] Error:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar plano de aula' },
            { status: 500 }
        );
    }
}
