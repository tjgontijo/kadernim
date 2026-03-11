import { NextRequest, NextResponse } from 'next/server'
import {
  createResourceFileDownloadPayload,
  resourceFileDownloadError,
  serializeResourceFileDownload,
} from '../route-support'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const payload = await createResourceFileDownloadPayload(request, ctx.params)
    if (payload instanceof NextResponse) {
      return payload
    }

    return serializeResourceFileDownload(payload)
  } catch (error) {
    return resourceFileDownloadError(error)
  }
}
