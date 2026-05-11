import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { exec } from 'node:child_process'
import { config } from 'dotenv'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { promisify } from 'node:util'

const execPromise = promisify(exec)

// Load environment variables
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

// R2 Configuration
const r2Client = new S3Client({
  region: 'auto',
  endpoint: getRequiredEnv('R2_ENDPOINT'),
  credentials: {
    accessKeyId: getRequiredEnv('R2_ACCESS_KEY_ID'),
    secretAccessKey: getRequiredEnv('R2_SECRET_ACCESS_KEY'),
  },
})

const bucketName = process.env.R2_BUCKET_NAME || 'kadernim'
const databaseUrl = getRequiredEnv('DATABASE_URL')

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const fileName = `backup-${timestamp}.sql.gz`
  const filePath = path.join(process.cwd(), 'scratch', fileName)

  // Ensure scratch directory exists
  if (!fs.existsSync(path.join(process.cwd(), 'scratch'))) {
    fs.mkdirSync(path.join(process.cwd(), 'scratch'))
  }

  console.log(`📦 Iniciando backup compactado do banco de dados: ${fileName}`)

  try {
    // 1. Executar pg_dump e compactar com gzip
    console.log('⏳ Gerando dump SQL compactado...')
    const connectionUrl = databaseUrl.includes('?') 
      ? `${databaseUrl}&sslrootcert=system` 
      : `${databaseUrl}?sslrootcert=system`

    // Usamos o pipe para compactar "on the fly"
    // Adicionamos --clean --if-exists para que o restore consiga sobrescrever dados existentes
    await execPromise(`pg_dump --clean --if-exists "${connectionUrl}" | gzip > "${filePath}"`)

    // 2. Upload para o R2
    console.log(`📤 Fazendo upload para o R2 (Bucket: ${bucketName})...`)
    const fileStream = fs.createReadStream(filePath)
    
    await r2Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: `backups/${fileName}`,
        Body: fileStream,
        ContentType: 'application/gzip',
      })
    )

    console.log(`✅ Backup concluído e salvo em: backups/${fileName}`)

    // 3. Limpar arquivo local
    fs.unlinkSync(filePath)
    console.log('🧹 Arquivo temporário local removido.')

  } catch (error) {
    console.error('❌ Falha no processo de backup:', error)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    process.exit(1)
  }
}

backupDatabase().catch((error) => {
  console.error('❌ Erro fatal:', error)
  process.exit(1)
})
