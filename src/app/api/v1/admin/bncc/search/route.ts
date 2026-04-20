import { NextRequest, NextResponse } from 'next/server'
import { searchBnccSkills } from '@/lib/resources/services/admin/bncc-service'
import { auth } from '@/server/auth/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })

    const role = session?.user.role
    const allowedRoles = ['admin', 'editor', 'manager']

    if (!session || typeof role !== 'string' || !allowedRoles.includes(role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || undefined
    const educationLevel = searchParams.get('educationLevel') || undefined
    const grade = searchParams.get('grade') || undefined
    const subject = searchParams.get('subject') || undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20

    const skills = await searchBnccSkills({
      q,
      educationLevel,
      grade,
      subject,
      limit
    })

    return NextResponse.json({ data: skills })
  } catch (error) {
    console.error('Erro ao buscar habilidades BNCC:', error)
    return NextResponse.json({ error: 'Erro interno ao buscar BNCC' }, { status: 500 })
  }
}
