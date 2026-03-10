import { NextRequest, NextResponse } from 'next/server';
import { CampaignService } from '@/services/campaigns/campaign.service';

/**
 * GET /api/v1/admin/campaigns/[id]
 * Busca uma campanha específica
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const campaign = await CampaignService.getById(id);

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

        const campaign = await CampaignService.update(id, body);

        return NextResponse.json({
            success: true,
            data: campaign,
        });
    } catch (error) {
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
        await CampaignService.delete(id);

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Erro ao excluir campanha' },
            { status: 500 }
        );
    }
}
