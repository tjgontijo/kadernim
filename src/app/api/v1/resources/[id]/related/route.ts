import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { getRelatedResources } from '@/lib/resources/services/catalog/related-service'

const getCachedRelated = (id: string) =>
  unstable_cache(
    () => getRelatedResources(id),
    [`resource-related-${id}`],
    { revalidate: 3600, tags: [`resource:${id}:related`] }
  )()

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params
    const related = await getCachedRelated(id)
    
    const formatted = related.map((r) => ({
      ...r,
      thumbUrl: r.images?.[0]?.url || null,
      subject: r.subject?.name || (r.isUniversal ? 'Interdisciplinar' : 'Geral'),
      educationLevel: r.educationLevel?.name || (r.isUniversal ? 'Universal' : 'Geral'),
    }))

    return NextResponse.json({ data: formatted })
  } catch (error) {
    console.error('Related error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
