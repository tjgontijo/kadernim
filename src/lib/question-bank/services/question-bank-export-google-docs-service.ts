import type { getQuestionBankRequestForUser } from './question-bank-request-service'

type RequestWithItems = NonNullable<Awaited<ReturnType<typeof getQuestionBankRequestForUser>>>

function buildDocumentText(request: RequestWithItems) {
  const lines: string[] = []
  lines.push(`Lista de questoes - ${new Date(request.createdAt).toLocaleDateString('pt-BR')}`)
  lines.push('')
  lines.push(`Quantidade solicitada: ${request.requestedCount}`)
  lines.push(`Quantidade retornada: ${request.returnedCount}`)
  lines.push('')

  request.items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.question.prompt}`)
    if (item.question.instruction) lines.push(`Instrucao: ${item.question.instruction}`)
    lines.push(`Tipo: ${item.question.questionType.name}`)
    lines.push(`Dificuldade: ${item.question.difficulty}`)
    lines.push('Resposta:')
    lines.push('')
  })

  lines.push('Gabarito')
  lines.push('')
  request.items.forEach((item, index) => {
    lines.push(`${index + 1}. ${JSON.stringify(item.question.answerKey)}`)
  })

  return lines.join('\n')
}

export async function createGoogleDocFromQuestionBankRequest(request: RequestWithItems) {
  const accessToken = process.env.GOOGLE_DOCS_ACCESS_TOKEN
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

  if (!accessToken) {
    throw new Error('GOOGLE_DOCS_NOT_CONFIGURED')
  }

  const title = `Kadernim - Lista de questoes ${new Date().toISOString().slice(0, 10)}`
  const createDocResponse = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  })

  if (!createDocResponse.ok) {
    const body = await createDocResponse.text()
    throw new Error(`GOOGLE_DOCS_CREATE_FAILED:${body}`)
  }

  const createDocJson = await createDocResponse.json() as { documentId: string; title: string }
  const documentId = createDocJson.documentId

  const text = buildDocumentText(request)
  const batchUpdateResponse = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text,
          },
        },
      ],
    }),
  })

  if (!batchUpdateResponse.ok) {
    const body = await batchUpdateResponse.text()
    throw new Error(`GOOGLE_DOCS_WRITE_FAILED:${body}`)
  }

  if (folderId) {
    await fetch(`https://www.googleapis.com/drive/v3/files/${documentId}?addParents=${folderId}&removeParents=root&fields=id,parents`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  }

  return {
    documentId,
    url: `https://docs.google.com/document/d/${documentId}/edit`,
    title: createDocJson.title,
  }
}
