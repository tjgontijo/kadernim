import * as fs from 'node:fs'
import * as path from 'node:path'
import { extractPdfDocument } from '../../src/lib/pdf-knowledge/extractor'

function main() {
  const inputArg = process.argv[2]
  if (!inputArg) {
    console.error('Uso: npx tsx scripts/pdf-to-md.ts <caminho-do-pdf> [saida.md]')
    process.exit(1)
  }

  const pdfPath = path.resolve(process.cwd(), inputArg)
  if (!fs.existsSync(pdfPath)) {
    console.error(`Arquivo nao encontrado: ${pdfPath}`)
    process.exit(1)
  }

  const outputArg = process.argv[3]
  const defaultOutDir = path.join(process.cwd(), 'docs/resources/analysis/markdown')
  const defaultOutputPath = path.join(
    defaultOutDir,
    `${path.basename(pdfPath, path.extname(pdfPath))}.md`
  )
  const outputPath = path.resolve(process.cwd(), outputArg ?? defaultOutputPath)

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })

  const extracted = extractPdfDocument(pdfPath, process.cwd())
  fs.writeFileSync(outputPath, extracted.markdown, 'utf8')

  console.log('Markdown gerado com sucesso:')
  console.log(`- Entrada: ${pdfPath}`)
  console.log(`- Saida:   ${outputPath}`)
  console.log(`- Paginas: ${extracted.pageCount}`)
}

main()
