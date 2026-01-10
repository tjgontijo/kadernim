import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface RouteParams {
    params: {
        id: string;
    };
}

/**
 * GET /api/v1/admin/campaigns/[id]
 * Busca uma campanha específica
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const campaign = await prisma.pushCampaign.findUnique({
            where: { id },
            include: {
                clicks: {
                    take: 10,
                    orderBy: { clickedAt: 'desc' },
                },
            },
        });

        if (!campaign) {
            return NextResponse.json(
                { success: false, error: 'Campanha não encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: campaign,
        });
    } catch (error) {
        console.error('[Campaign API] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao buscar campanha' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/v1/admin/campaigns/[id]
 * Atualiza uma campanha
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const campaign = await prisma.pushCampaign.update({
            where: { id },
            data: {
                title: body.title,
                body: body.body,
                url: body.url,
                icon: body.icon,
                imageUrl: body.imageUrl,
                audience: body.audience,
                scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
            },
        });

        return NextResponse.json({
            success: true,
            data: campaign,
        });
    } catch (error) {
        console.error('[Campaign API] Error updating:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao atualizar campanha' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/v1/admin/campaigns/[id]
 * Exclui uma campanha
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.pushCampaign.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error('[Campaign API] Error deleting:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao excluir campanha' },
            { status: 500 }
        );
    }
}
