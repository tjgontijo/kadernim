import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { generateTheme } from '@/services/lesson-plans/generate-theme';

/**
 * POST /api/v1/lesson-plans/generate-theme
 * 
 * Gera um tema/título para o plano de aula baseado no contexto
 */
export async function POST(request: NextRequest) {
    try {
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
            return NextResponse.json(
                { success: false, error: 'Não autenticado' },
                { status: 401 }
            );
        }

        // 2. Validar body
        const body = await request.json();
        const {
            educationLevelSlug,
            gradeSlug,
            subjectSlug,
            mainSkillCode,
            mainSkillDescription,
            intentRaw
        } = body;

        if (!mainSkillCode || !mainSkillDescription) {
            return NextResponse.json(
                { success: false, error: 'Habilidade principal é obrigatória' },
                { status: 400 }
            );
        }

        // 3. Gerar tema via service
        const theme = await generateTheme({
            userId: session.user.id,
            educationLevelSlug,
            gradeSlug,
            subjectSlug,
            mainSkillCode,
            mainSkillDescription,
            intentRaw
        });

        return NextResponse.json({
            success: true,
            data: { theme }
        });

    } catch (error) {
        console.error('[POST /api/v1/lesson-plans/generate-theme] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao gerar tema' },
            { status: 500 }
        );
    }
}
