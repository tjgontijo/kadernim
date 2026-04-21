import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/server/auth/middleware'
import { uploadImage, deleteAsset } from '@/lib/storage/cloudinary'
import { UserRole } from '@/types/users/user-role'

export async function POST(req: NextRequest) {
  const authResult = await requireRole(req, UserRole.admin)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const resourceSlug = formData.get('resourceSlug') as string | null
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const result = await uploadImage(file, {
      folder: resourceSlug ? `resources/${resourceSlug}/images` : 'resources/images',
      publicId: resourceSlug ? 'cover' : undefined,
      overwrite: true,
    })

    return NextResponse.json({ 
      url: result.secure_url,
      publicId: result.public_id
    })
  } catch (error) {
    console.error('[UPLOAD ERROR]', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const authResult = await requireRole(req, UserRole.admin)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const { searchParams } = new URL(req.url)
    const publicId = searchParams.get('publicId')

    if (!publicId) {
      return NextResponse.json({ error: 'No publicId provided' }, { status: 400 })
    }

    await deleteAsset(publicId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE ERROR]', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
