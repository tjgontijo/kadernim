import { DeleteObjectsCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3'
import { config } from 'dotenv'
import * as fs from 'node:fs'
import * as path from 'node:path'

const envLocalPath = path.resolve(process.cwd(), '.env.local')
const envPath = path.resolve(process.cwd(), '.env')

if (fs.existsSync(envLocalPath)) {
  config({ path: envLocalPath })
} else {
  config({ path: envPath })
}

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name} environment variable`)
  return value
}

const bucketName = process.env.R2_BUCKET_NAME || 'kadernim'
const r2Client = new S3Client({
  region: 'auto',
  endpoint: getRequiredEnv('R2_ENDPOINT'),
  credentials: {
    accessKeyId: getRequiredEnv('R2_ACCESS_KEY_ID'),
    secretAccessKey: getRequiredEnv('R2_SECRET_ACCESS_KEY'),
  },
})

const DELETE_BATCH_SIZE = 1000

async function clearR2Bucket() {
  console.log(`🧹 Iniciando limpeza do bucket R2: ${bucketName}`)

  let totalDeleted = 0

  while (true) {
    const listResponse = await r2Client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        MaxKeys: DELETE_BATCH_SIZE,
      })
    )

    const objects = (listResponse.Contents || [])
      .map((item) => item.Key)
      .filter((key): key is string => Boolean(key))

    if (objects.length === 0) {
      break
    }

    const deleteResponse = await r2Client.send(
      new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
          Objects: objects.map((Key) => ({ Key })),
          Quiet: true,
        },
      })
    )

    if ((deleteResponse.Errors || []).length > 0) {
      const messages = deleteResponse.Errors!.map((error) => `${error.Key}: ${error.Message}`).join('\n')
      throw new Error(`Falha ao remover alguns arquivos do R2:\n${messages}`)
    }

    const deletedCount = deleteResponse.Deleted?.length || 0
    totalDeleted += deletedCount
    console.log(`🗑️  Lote removido: ${deletedCount} arquivo(s)`)
  }

  if (totalDeleted === 0) {
    console.log('ℹ️  Bucket já estava vazio.')
  } else {
    console.log(`✅ Limpeza concluída. Total removido: ${totalDeleted} arquivo(s).`)
  }
}

clearR2Bucket().catch((error) => {
  console.error('❌ Falha ao limpar o R2:', error)
  process.exit(1)
})
