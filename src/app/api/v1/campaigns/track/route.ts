import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/server/auth';

/**
 * POST /api/v1/campaigns/track
 *
 * Registra um clique em uma campanha de push notification.
 * Tenta identificar o usuário via sessão (se estiver logado).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json(
        { error: 'campaignId é obrigatório' },
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

    // Registrar clique
    await prisma.pushCampaignClick.create({
      data: {
        campaignId,
        userId,
        userAgent,
      },
    });

    // Incrementar contador desnormalizado na campanha (para performance)
    await prisma.pushCampaign.update({
      where: { id: campaignId },
      data: {
        totalClicked: {
          increment: 1,
        },
      },
    });

    console.log(
      `[Campaign] Clique registrado: campanha=${campaignId}, userId=${userId || 'anônimo'}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Campaign Track] Erro ao registrar clique:', error);
    return NextResponse.json(
      { error: 'Falha ao registrar clique' },
      { status: 500 }
    );
  }
}
