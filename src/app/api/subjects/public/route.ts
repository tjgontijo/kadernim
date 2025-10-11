import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/subjects/public - Listar todas as disciplinas para uso público
export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Erro ao listar disciplinas:', error);
    return NextResponse.json(
      { message: 'Erro ao listar disciplinas' },
      { status: 500 }
    );
  }
}
