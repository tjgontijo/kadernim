import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { requireRole } from '@/server/auth/middleware'
import { UserRole } from '@/types/users/user-role'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  const authResult = await requireRole(req, UserRole.admin)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'kadernim/resources/thumbs',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
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
