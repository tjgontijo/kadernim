import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import {
  CommunityFilterSchema,
  CommunityRequestSchema,
} from '@/schemas/community/community-schemas'
import { uploadCommunityReference } from '@/server/clients/cloudinary/community-client'

export async function getCommunitySession(request: NextRequest) {
  return auth.api.getSession({ headers: request.headers })
}

export function parseCommunityFilters(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const parsed = CommunityFilterSchema.safeParse({
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    votingMonth: searchParams.get('votingMonth') ?? undefined,
    educationLevelId: searchParams.get('educationLevelId') ?? undefined,
    subjectId: searchParams.get('subjectId') ?? undefined,
    q: searchParams.get('q') ?? undefined,
    educationLevelSlug: searchParams.get('educationLevelSlug') ?? undefined,
    gradeSlug: searchParams.get('gradeSlug') ?? undefined,
    subjectSlug: searchParams.get('subjectSlug') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', details: parsed.error.format() },
      { status: 400 }
    )
  }

  return parsed.data
}

export async function parseCommunityRequestBody(request: NextRequest) {
  const formData = await request.formData()
  const body = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    hasBnccAlignment: formData.get('hasBnccAlignment') === 'true',
    educationLevelId: (formData.get('educationLevelId') as string) || undefined,
    gradeId: (formData.get('gradeId') as string) || undefined,
    subjectId: (formData.get('subjectId') as string) || undefined,
    bnccSkillCodes: formData.getAll('bnccSkillCodes') as string[],
  }

  const parsed = CommunityRequestSchema.safeParse(body)
  if (!parsed.success) {
    return {
      error: NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.format() },
        { status: 400 }
      ),
      formData,
    }
  }

  return {
    data: parsed.data,
    formData,
  }
}

export async function uploadCommunityAttachments(files: File[]) {
  if (files.length === 0) {
    return []
  }

  const tempFolderId = `temp_${Date.now()}`
  const uploads = []

  for (const file of files) {
    const result = await uploadCommunityReference(file, 'community/uploads', tempFolderId)
    uploads.push({
      cloudinaryPublicId: result.publicId,
      url: result.url,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    })
  }

  return uploads
}

export function communityServerError(message: string, error: unknown, status = 500) {
  console.error(message, error)
  return NextResponse.json(
    {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    },
    { status }
  )
}
