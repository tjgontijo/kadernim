import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/v1/admin/campaigns
 * Lista todas as campanhas de push
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '15');
        const status = searchParams.get('status');

        const where = status ? { status: status as any } : {};

        const [campaigns, total] = await Promise.all([
            prisma.pushCampaign.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.pushCampaign.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: campaigns,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('[Campaigns API] Error:', error);
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

        const campaign = await prisma.pushCampaign.create({
            data: {
                name: body.name,
                title: body.title,
                body: body.body,
                url: body.url,
                icon: body.icon,
                imageUrl: body.imageUrl,
                audience: body.audience || {},
                scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
                status: body.scheduledAt ? 'SCHEDULED' : 'DRAFT',
            },
        });

        return NextResponse.json({
            success: true,
            data: campaign,
        });
    } catch (error) {
        console.error('[Campaigns API] Error creating:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao criar campanha' },
            { status: 500 }
        );
    }
}
