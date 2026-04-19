import { NextRequest, NextResponse } from 'next/server'
import { getRelatedResources } from '@/lib/resources/services/catalog/related-service'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params
    const related = await getRelatedResources(id)
    
    const formatted = related.map((r) => ({
      ...r,
      thumbUrl: r.images?.[0]?.url || null,
      subject: r.subject.name,
      educationLevel: r.educationLevel.name,
    }))

    return NextResponse.json({ data: formatted })
  } catch (error) {
    console.error('Related error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
