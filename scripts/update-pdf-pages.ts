import 'dotenv/config'
import { prisma } from '../src/lib/db'
import { countPdfPagesFromR2 } from '../src/lib/storage/pdf-utils'

async function main() {
  console.log('🚀 Starting PDF page count update...')

  const resources = await prisma.resource.findMany({
    where: {
      archivedAt: null,
    },
    include: {
      files: true,
    },
  })

  console.log(`📦 Found ${resources.length} resources to process.`)

  for (const resource of resources) {
    let totalPages = 0
    let processedFiles = 0

    const pdfFiles = resource.files.filter(f => 
      f.name.toLowerCase().endsWith('.pdf') || 
      f.fileType?.toLowerCase().includes('pdf') ||
      f.url?.toLowerCase().includes('.pdf')
    )

    if (pdfFiles.length === 0) {
      // If we already have a pagesCount and no PDFs, maybe keep it or reset it?
      // Usually, if there are no PDFs, pagesCount should be 0 or null.
      // But let's only update if we find PDFs.
      continue
    }

    console.log(`📄 Processing Resource: "${resource.title}" (${pdfFiles.length} PDFs)`)

    for (const file of pdfFiles) {
      // Identify the R2 key. In this project, cloudinaryPublicId is used for the key.
      const isR2 = file.cloudinaryPublicId.startsWith('resources/') || (file.url && !file.url.includes('cloudinary'))
      
      if (isR2) {
        const key = file.cloudinaryPublicId
        const pages = await countPdfPagesFromR2(key)
        
        // Atualiza o arquivo individualmente
        await prisma.resourceFile.update({
          where: { id: file.id },
          data: { pageCount: pages }
        })

        totalPages += pages
        processedFiles++
      } else {
        console.warn(`  ⚠️ Skipping Cloudinary file (not implemented): ${file.name}`)
      }
    }

    // Mesmo que processedFiles seja 0, podemos querer resetar o pagesCount se não houver PDFs
    await prisma.resource.update({
      where: { id: resource.id },
      data: { pagesCount: totalPages },
    })
    
    if (processedFiles > 0) {
      console.log(`  ✅ Updated: ${totalPages} total pages across ${processedFiles} files.`)
    }
  }

  console.log('🏁 Finished updating PDF page counts.')
}

main()
  .catch((e) => {
    console.error('❌ Script failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
