import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { getCommunityConfig } from '@/services/config/system-config';

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const config = await getCommunityConfig();

        return NextResponse.json({
            success: true,
            data: config
        });
    } catch (error) {
        console.error('[Community Config GET] Error:', error);
        return NextResponse.json({ success: false, error: 'Erro ao buscar configurações' }, { status: 500 });
    }
}
