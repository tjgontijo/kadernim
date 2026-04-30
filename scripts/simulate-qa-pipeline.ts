import 'dotenv/config'
import { generateResourceQaContent } from '../src/mastra/agents/generate-resource-qa/orchestrators/generate-resource-content'
import fs from 'fs'
import path from 'path'
import { countQuestions } from '../src/lib/resource/schemas'
import { renderResourceToHtml } from '../src/lib/resource/compositor'
import { AdaptiveLayoutEngine } from '../src/lib/resource/adaptive-layout-engine'

async function simulate() {
  const codes = ['EF05HI04', 'EF05HI05']
  const targetCount = 10
  
  console.log(`🚀 Simulando geração de Q&A para: ${codes.join(', ')}`)
  console.log(`🎯 Alvo: ${targetCount} questões`)

  try {
    const plan = await generateResourceQaContent(codes, targetCount)
    
    const outputDir = path.join(process.cwd(), 'scripts/output')
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

    const jsonPath = path.join(outputDir, 'simulation_QA_MULTI.json')
    fs.writeFileSync(jsonPath, JSON.stringify(plan, null, 2))
    
    console.log(`✅ Gerado com sucesso!`)
    console.log(`📄 Páginas: ${plan.pages.length}`)
    console.log(`📝 Questões: ${countQuestions(plan)}`)
    
    // Gerar HTML para visualização
    console.log('🎨 Renderizando HTML...')
    const html = renderResourceToHtml(plan)
    const htmlPath = path.join(outputDir, 'simulation_QA_MULTI.html')
    fs.writeFileSync(htmlPath, html)
    
    console.log(`🔗 HTML salvo em: ${htmlPath}`)
  } catch (error) {
    console.error('❌ Erro na simulação:', error)
  }
}

simulate()
