import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/services/auth/session-service'
import { UploadAccountAvatarSchema } from '@/lib/account/schemas'
import { updateAccountAvatar } from '@/lib/account/services'
import { logger } from '@/server/logger'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const parsed = UploadAccountAvatarSchema.safeParse({
      file: formData.get('file'),
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' },
        { status: 400 }
      )
    }

    const result = await updateAccountAvatar(session.user.id, parsed.data)

    if (!result.success) {
      const status = result.error === 'User not found' ? 404 : 500
      return NextResponse.json(
        { error: result.error === 'User not found' ? result.error : 'Erro ao atualizar avatar' },
        { status }
      )
    }
    return NextResponse.json({
      message: 'Avatar atualizado com sucesso',
      image: result.data.image,
    })
  } catch (error) {
    logger.error(
      { route: '/api/v1/account/avatar', error: error instanceof Error ? error.message : String(error) },
      'Failed to update account avatar'
    )
    return NextResponse.json(
      { error: 'Erro ao atualizar avatar' },
      { status: 500 }
    )
  }
}
