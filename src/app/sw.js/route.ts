import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    // Tentar primeiro do .next/static (onde Vercel tem acesso)
    const primaryPath = path.join(process.cwd(), '.next', 'static', 'sw.js');
    // Fallback para public/ (desenvolvimento local)
    const fallbackPath = path.join(process.cwd(), 'public', 'sw.js');

    let filePath = primaryPath;
    if (!fs.existsSync(primaryPath)) {
        filePath = fallbackPath;
    }

    try {
        const fileBuffer = fs.readFileSync(filePath);

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'application/javascript',
                'Cache-Control': 'public, max-age=0, must-revalidate',
                'Service-Worker-Allowed': '/',
            },
        });
    } catch (error) {
        console.error('Erro ao servir sw.js:', error);
        return new NextResponse('Service Worker not found', { status: 404 });
    }
}

