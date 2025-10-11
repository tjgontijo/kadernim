import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/education-levels/public - Listar todos os níveis de ensino para uso público
export async function GET( _req: NextRequest) {
  try {
    const educationLevels = await prisma.educationLevel.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(educationLevels);
  } catch (error) {
    console.error('Erro ao listar níveis de ensino:', error);
    return NextResponse.json(
      { message: 'Erro ao listar níveis de ensino' },
      { status: 500 }
    );
  }
}
