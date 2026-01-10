import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface RouteParams {
    params: {
        campaignId: string;
    };
}

/**
 * GET /api/v1/track/push/[campaignId]
 * Registra clique e redireciona para URL de destino
 * 
 * Query params:
 * - u: userId (opcional)
 * - dest: URL de destino (opcional, usa campaign.url se não fornecido)
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ campaignId: string }> }) {
    try {
        const { campaignId } = await params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('u');
        const destUrl = searchParams.get('dest');
        const userAgent = request.headers.get('user-agent') || undefined;

        // Buscar campanha
        const campaign = await prisma.pushCampaign.findUnique({
            where: { id: campaignId },
        });

        if (!campaign) {
            return NextResponse.json(
                { success: false, error: 'Campanha não encontrada' },
                { status: 404 }
            );
        }

        // Registrar clique
        await Promise.all([
            prisma.pushCampaignClick.create({
                data: {
                    campaignId: campaignId,
                    userId: userId || null,
                    userAgent,
                },
            }),
            prisma.pushCampaign.update({
                where: { id: campaignId },
                data: {
                    totalClicked: { increment: 1 },
                },
            }),
        ]);

        // Determinar URL final
        let finalUrl = destUrl || campaign.url || '/';

        // Adicionar UTMs se não existirem
        const url = new URL(finalUrl, process.env.NEXT_PUBLIC_APP_URL);
        if (!url.searchParams.has('utm_source')) {
            url.searchParams.set('utm_source', 'push');
            url.searchParams.set('utm_medium', 'notification');
            url.searchParams.set('utm_campaign', campaign.title.toLowerCase().replace(/\s+/g, '-'));
            url.searchParams.set('utm_content', campaign.id);
        }

        // Redirecionar
        return NextResponse.redirect(url.toString());
    } catch (error) {
        console.error('[Track API] Error:', error);
        // Em caso de erro, redirecionar para home
        return NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL || '/');
    }
}
