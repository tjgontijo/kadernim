import { NextRequest, NextResponse } from 'next/server';
import { CampaignService } from '@/lib/campaigns/services';

/**
 * GET /api/v1/track/push/[campaignId]
 * Resolve a URL de redirecionamento sem efeitos colaterais
 * 
 * Query params:
 * - dest: URL de destino (opcional, usa campaign.url se não fornecido)
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ campaignId: string }> }) {
    try {
        const { campaignId } = await params;
        const { searchParams } = new URL(request.url);
        const destUrl = searchParams.get('dest');
        const redirectUrl = await CampaignService.getTrackingRedirectUrl({
            campaignId,
            destinationUrl: destUrl,
        })

        if (!redirectUrl) {
            return NextResponse.json(
                { success: false, error: 'Campanha não encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.redirect(redirectUrl);
    } catch (error) {
        console.error('[Track API] Error:', error);
        // Em caso de erro, redirecionar para home
        return NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL || '/');
    }
}
