import { NextResponse } from 'next/server'
import {
  authorizeTestPushRequest,
  buildTestPushPayload,
  executeTestPush,
  getActiveSubscriptionsSummary,
  parseTestPushRequest,
  requireAuthenticatedSession,
  serializeTestPushResult,
  testPushServerError,
} from './route-support'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const authResult = await authorizeTestPushRequest(req)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const parsed = await parseTestPushRequest(req)
    if (parsed instanceof NextResponse) {
      return parsed
    }

    const result = await executeTestPush(parsed, buildTestPushPayload(parsed))
    if (result instanceof NextResponse) {
      return result
    }

    return serializeTestPushResult(result)
  } catch (error) {
    return testPushServerError('[Push] Erro ao enviar teste:', error)
  }
}

export async function GET() {
  try {
    const session = await requireAuthenticatedSession()
    if (session instanceof NextResponse) {
      return session
    }

    return getActiveSubscriptionsSummary()
  } catch (error) {
    return testPushServerError('[Push] Erro ao contar subscriptions:', error)
  }
}
