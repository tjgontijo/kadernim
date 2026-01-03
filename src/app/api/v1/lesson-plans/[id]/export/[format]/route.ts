import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { prisma } from '@/lib/db';
import { generateWordDocument } from '@/lib/export/word-template';
import { generatePDFBuffer } from '@/lib/export/pdf-template';
import { type LessonPlanResponse } from '@/lib/schemas/lesson-plan';

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

        // 4. Buscar descrições das habilidades BNCC para enriquecer o documento
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

        // 5. Gerar arquivo conforme formato
        let buffer: Buffer;
        let contentType: string;
        let filename: string;

        const safeTitle = plan.title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50);

        if (format === 'docx') {
            buffer = await generateWordDocument(
                plan as unknown as LessonPlanResponse,
                bnccSkillDescriptions
            );
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            filename = `plano-de-aula-${safeTitle}.docx`;
        } else if (format === 'pdf') {
            buffer = await generatePDFBuffer(
                plan as unknown as LessonPlanResponse,
                bnccSkillDescriptions
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
