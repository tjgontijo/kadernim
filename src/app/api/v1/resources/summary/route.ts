import { NextRequest, NextResponse } from 'next/server'
import {
  authorizeResourceListRequest,
  fetchResourceSummary,
  parseResourceListFilters,
  resourceSummaryHeaders,
  resourceSummaryServerError,
} from '../route-support'

export async function GET(request: NextRequest) {
  try {
    const authResult = await authorizeResourceListRequest(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const filters = parseResourceListFilters(request)
    if (filters instanceof NextResponse) {
      return filters
    }

    const { summary, cacheKey } = await fetchResourceSummary({
      userId: authResult.userId,
      role: authResult.role,
      filters,
    })

    return NextResponse.json(summary, {
      headers: resourceSummaryHeaders(cacheKey),
    })
  } catch (error) {
    return resourceSummaryServerError(error)
  }
}
