import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    const filePath = path.join(process.cwd(), 'public', 'sw.js');

    try {
        const fileBuffer = fs.readFileSync(filePath);

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'application/javascript',
                'Cache-Control': 'public, max-age=0, must-revalidate',
            },
        });
    } catch (error) {
        console.error('Erro ao servir sw.js:', error);
        return new NextResponse('Service Worker not found', { status: 404 });
    }
}
