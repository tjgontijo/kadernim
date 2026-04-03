import { NextRequest, NextResponse } from 'next/server';
import { CampaignSchema } from '@/lib/campaigns/schemas';
import { CampaignService } from '@/lib/campaigns/services';

/**
 * GET /api/v1/admin/campaigns
 * Lista todas as campanhas de push
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '15');
        const status = searchParams.get('status') || undefined;

        const result = await CampaignService.list({ page, limit, status });

        return NextResponse.json({
            success: true,
            data: result.campaigns,
            pagination: result.pagination,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Erro ao buscar campanhas' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/v1/admin/campaigns
 * Cria uma nova campanha
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validated = CampaignSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { success: false, error: 'Dados inválidos', details: validated.error.format() },
                { status: 400 }
            );
        }

        const campaign = await CampaignService.create(validated.data);

        return NextResponse.json({
            success: true,
            data: campaign,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Erro ao criar campanha' },
            { status: 500 }
        );
    }
}
