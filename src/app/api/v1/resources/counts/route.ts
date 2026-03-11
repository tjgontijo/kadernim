import { NextRequest, NextResponse } from 'next/server'
import {
  authorizeResourceListRequest,
  fetchCachedResourceCounts,
  parseResourceListFilters,
  resourceCountsServerError,
} from '../route-support'

export async function GET(request: NextRequest) {
  try {
    const authResult = await authorizeResourceListRequest(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const parsed = parseResourceListFilters(request)
    if (parsed instanceof NextResponse) {
      return parsed
    }

    const counts = await fetchCachedResourceCounts({
      userId: authResult.userId,
      role: authResult.role,
      filters: parsed,
    })

    const tabCount =
      parsed.tab === 'mine' ? counts.mine : parsed.tab === 'free' ? counts.free : counts.all

    return NextResponse.json({ data: { tab: parsed.tab, count: tabCount } })
  } catch (error) {
    return resourceCountsServerError(error)
  }
}
