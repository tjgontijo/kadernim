import { NextRequest, NextResponse } from 'next/server'
import {
  authorizeResourceListRequest,
  fetchCachedResourceList,
  parseResourceListFilters,
  resourceListServerError,
} from './route-support'

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

    return NextResponse.json(
      await fetchCachedResourceList({
        userId: authResult.userId,
        role: authResult.role,
        filters: parsed,
      })
    )
  } catch (error) {
    return resourceListServerError(error)
  }
}
