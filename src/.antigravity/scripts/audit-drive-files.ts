import { FILES } from '../../prisma/seeds/seed-resource-files'
import { google } from 'googleapis'
import path from 'path'

// Configuração mínima do Drive
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(process.cwd(), 'google-service-account.json'),
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
})
const drive = google.drive({ version: 'v3', auth })

function extractDriveFolderId(url: string): string | null {
  const match = url.match(/folders\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

async function auditDriveFiles() {
  console.log('🔍 Iniciando auditoria de arquivos no Google Drive...')
  
  const stats: Record<string, { count: number; examples: string[] }> = {}
  
  // Limita concorrência para não estourar API do Google
  const BATCH_SIZE = 5
  for (let i = 0; i < FILES.length; i += BATCH_SIZE) {
    const batch = FILES.slice(i, i + BATCH_SIZE)
    
    await Promise.all(batch.map(async (f) => {
      const folderId = extractDriveFolderId(f.url)
      if (!folderId) return

      try {
        const res = await drive.files.list({
          q: `'${folderId}' in parents and trashed = false`,
          fields: 'files(name, mimeType, fileExtension)',
        })

        const files = res.data.files || []
        
        for (const file of files) {
          const ext = (file.fileExtension || path.extname(file.name || '').replace('.', '') || 'no-ext').toLowerCase()
          const mime = file.mimeType || 'unknown'
          const key = `${ext} (${mime})`

          if (!stats[key]) {
            stats[key] = { count: 0, examples: [] }
          }
          
          stats[key].count++
          if (stats[key].examples.length < 3 && !stats[key].examples.includes(file.name || '')) {
            stats[key].examples.push(file.name || '')
          }
        }
      } catch (error) {
        console.error(`❌ Erro ao ler pasta ${folderId}:`, (error as any).message)
      }
    }))
    
    console.log(`⏳ Processado: ${Math.min(i + BATCH_SIZE, FILES.length)}/${FILES.length} pastas...`)
  }

  console.log('\n================================================')
  console.log('📊 RELATÓRIO DE TIPOS DE ARQUIVOS ENCONTRADOS')
  console.log('================================================\n')

  const sortedTypes = Object.entries(stats).sort((a, b) => b[1].count - a[1].count)

  for (const [type, data] of sortedTypes) {
    console.log(`🔹 ${type.padEnd(35)} | Total: ${String(data.count).padStart(3)}`)
    console.log(`   Exemplos: ${data.examples.join(', ')}`)
    console.log('------------------------------------------------')
  }
}

auditDriveFiles().catch(console.error)
