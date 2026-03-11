import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { generateWordDocument } from '@/lib/export/word-template';
import { generatePDFBuffer } from '@/lib/export/pdf-template';
import { type LessonPlanResponse } from '@/schemas/lesson-plans/lesson-plan-schemas';
import { LessonPlanService } from '@/services/lesson-plans/lesson-plan-service';

/**
 * GET /api/v1/lesson-plans/[id]/export/[format]
 * 
 * Exporta um plano de aula em Word ou PDF
 * Inclui descrições completas das habilidades BNCC
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; format: string }> }
) {
    try {
        const { id, format } = await params;

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

        const plan = await LessonPlanService.getByIdWithBnccDescriptions(id, {
            userId: session.user.id,
            isAdmin: session.user.role === 'admin',
        });

        // 5. Gerar arquivo conforme formato
        let buffer: Buffer;
        let contentType: string;
        let filename: string;

        const safeTitle = plan.title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50);

        if (format === 'docx') {
            buffer = await generateWordDocument(
                plan as unknown as LessonPlanResponse,
                plan.bnccSkillDescriptions
            );
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            filename = `plano-de-aula-${safeTitle}.docx`;
        } else if (format === 'pdf') {
            buffer = await generatePDFBuffer(
                plan as unknown as LessonPlanResponse,
                plan.bnccSkillDescriptions
            );
            contentType = 'application/pdf';
            filename = `plano-de-aula-${safeTitle}.pdf`;
        } else {
            return NextResponse.json({ error: 'Formato inválido' }, { status: 400 });
        }

        const disposition = format === 'pdf' ? 'inline' : 'attachment';

        // 6. Retornar arquivo
        return new NextResponse(buffer as any, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `${disposition}; filename="${filename}"`,
                'Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'LESSON_PLAN_NOT_FOUND') {
            return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });
        }

        if (error instanceof Error && error.message === 'LESSON_PLAN_FORBIDDEN') {
            return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
        }

        console.error('[GET /api/v1/lesson-plans/export] Error:', error);
        return NextResponse.json(
            {
                error: 'Erro ao exportar plano de aula',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
