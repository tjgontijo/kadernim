import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { CampaignTrackSchema } from '@/lib/campaigns/schemas';
import { CampaignService } from '@/lib/campaigns/services';

/**
 * POST /api/v1/campaigns/track
 *
 * Registra um clique em uma campanha de push notification.
 * Tenta identificar o usuário via sessão (se estiver logado).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CampaignTrackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'campaignId é obrigatório', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Tentar identificar usuário (opcional - pode não estar logado)
    let userId: string | null = null;
    try {
      const session = await auth.api.getSession({
        headers: req.headers,
      });
      userId = session?.user?.id || null;
    } catch {
      // Ignorar erro de auth - clique anônimo é válido
    }

    // Extrair user agent
    const userAgent = req.headers.get('user-agent') || undefined;

    await CampaignService.trackClick({
      campaignId: parsed.data.campaignId,
      userId,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Campaign Track] Erro ao registrar clique:', error);
    return NextResponse.json(
      { error: 'Falha ao registrar clique' },
      { status: 500 }
    );
  }
}
