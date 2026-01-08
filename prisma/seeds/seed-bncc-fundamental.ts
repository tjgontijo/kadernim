import fs from 'node:fs'
import path from 'node:path'
import type { PrismaClient } from '../generated/prisma/client'

type RawRow = {
  componente: string
  anoFaixa: string
  eixo: string
  unidadeTematica: string
  objetoConhecimento: string
  codigo: string
  habilidade: string
  comentario: string
  sugestoes: string
}

function norm(v: string) {
  const s = (v ?? '').trim()
  if (!s || s === '-' || s === '""') return null
  return s.replace(/\s+/g, ' ')
}

function toAsciiLower(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function toKebab(s: string) {
  return toAsciiLower(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function parseYears(anoFaixaRaw: string): number[] {
  const raw = (anoFaixaRaw ?? '').trim()
  if (!raw) return []

  // "1º; 2º" "6º; 7º; 8º; 9º" "1º"
  const parts = raw.split(';').map(p => p.trim()).filter(Boolean)

  const years: number[] = []
  for (const p of parts) {
    const m = p.match(/^(\d+)/)
    if (m) years.push(Number(m[1]))
  }

  // fallback para casos tipo "1º ao 5º"
  if (years.length === 0) {
    const range = raw.match(/(\d+).*(\d+)/)
    if (range) {
      const a = Number(range[1])
      const b = Number(range[2])
      if (!Number.isNaN(a) && !Number.isNaN(b) && a <= b) {
        for (let i = a; i <= b; i++) years.push(i)
      }
    }
  }

  return Array.from(new Set(years)).sort((a, b) => a - b)
}

function levelFromYear(year: number) {
  if (year >= 1 && year <= 5) return 'ensino-fundamental-1'
  if (year >= 6 && year <= 9) return 'ensino-fundamental-2'
  return null
}

function gradeSlugFromYear(year: number) {
  if (year >= 1 && year <= 5) return `ef1-${year}-ano`
  if (year >= 6 && year <= 9) return `ef2-${year}-ano`
  return null
}

// Mapeamento explícito para garantir slugs estáveis e 100% corretos no seu sistema
const subjectSlugMap: Record<string, string> = {
  'lingua portuguesa': 'lingua-portuguesa',
  matematica: 'matematica',
  ciencias: 'ciencias',
  historia: 'historia',
  geografia: 'geografia',
  arte: 'arte',
  'educacao fisica': 'educacao-fisica',
  'lingua inglesa': 'lingua-inglesa',
  'ensino religioso': 'ensino-religioso',
}

function subjectSlugFromComponent(componentRaw: string) {
  const key = toAsciiLower(componentRaw).replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim()
  return subjectSlugMap[key] ?? toKebab(componentRaw)
}

function parseTsv(filePath: string): RawRow[] {
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (lines.length < 2) return []

  const header = lines[0].split('\t').map(h => h.trim())
  const idx = (name: string) => header.findIndex(h => h === name)

  const iComp = idx('COMPONENTE')
  const iAno = idx('ANO/FAIXA')
  const iEixo = idx('EIXO - CAMPOS DE ATUAÇÃO')
  const iUnid = idx('UNIDADES TEMÁTICAS')
  const iObj = idx('OBJETOS DE CONHECIMENTO')
  const iCod = idx('CÓDIGO HABILIDADE')
  const iHab = idx('HABILIDADES')
  const iCom = idx('COMENTÁRIO')
  const iSug = idx('POSSIBILIDADES PARA O CURRÍCULO')

  if ([iComp, iAno, iCod, iHab].some(v => v < 0)) {
    throw new Error('Header TSV não bate com o esperado. Confira os nomes das colunas.')
  }

  const rows: RawRow[] = []
  for (let l = 1; l < lines.length; l++) {
    const cols = lines[l].split('\t')

    rows.push({
      componente: cols[iComp] ?? '',
      anoFaixa: cols[iAno] ?? '',
      eixo: cols[iEixo] ?? '',
      unidadeTematica: cols[iUnid] ?? '',
      objetoConhecimento: cols[iObj] ?? '',
      codigo: cols[iCod] ?? '',
      habilidade: cols[iHab] ?? '',
      comentario: cols[iCom] ?? '',
      sugestoes: cols[iSug] ?? '',
    })
  }

  return rows
}

export async function seedBnccSkillsFundamental(prisma: PrismaClient) {
  console.log('🌱 Inserindo BNCC Skills (Fundamental) em bncc_skill...')

  const filePath = path.join(process.cwd(), 'prisma', 'seeds', 'data', 'bncc_fundamental.tsv')
  const rawRows = parseTsv(filePath)

  console.log(`📄 Linhas lidas: ${rawRows.length}`)

  // Buscar todos os EducationLevels, Grades e Subjects
  const educationLevels = await prisma.educationLevel.findMany({
    select: { id: true, slug: true }
  })
  const educationLevelIdBySlug = new Map(educationLevels.map(el => [el.slug, el.id]))

  const grades = await prisma.grade.findMany({
    select: { id: true, slug: true }
  })
  const gradeIdBySlug = new Map(grades.map(g => [g.slug, g.id]))

  const subjects = await prisma.subject.findMany({
    select: { id: true, slug: true }
  })
  const subjectIdBySlug = new Map(subjects.map(s => [s.slug, s.id]))

  const skillsToCreate: any[] = []
  let skipped = 0

  for (const r of rawRows) {
    const code = norm(r.codigo)
    const description = norm(r.habilidade)
    if (!code || !description) {
      skipped++
      continue
    }

    const years = parseYears(r.anoFaixa)
    if (years.length === 0) {
      skipped++
      continue
    }

    const subjectSlug = subjectSlugFromComponent(r.componente)
    const subjectId = subjectIdBySlug.get(subjectSlug)

    const unitTheme = norm(r.unidadeTematica)
    const knowledgeObject = norm(r.objetoConhecimento)
    const comments = norm(r.comentario)
    const curriculumSuggestions = norm(r.sugestoes)

    for (const year of years) {
      const educationLevelSlug = levelFromYear(year)
      const gradeSlug = gradeSlugFromYear(year)
      if (!educationLevelSlug || !gradeSlug) continue

      // Seed só Fundamental
      if (educationLevelSlug !== 'ensino-fundamental-1' && educationLevelSlug !== 'ensino-fundamental-2') {
        continue
      }

      const educationLevelId = educationLevelIdBySlug.get(educationLevelSlug)
      const gradeId = gradeIdBySlug.get(gradeSlug)

      if (!educationLevelId || !gradeId) {
        console.warn(`⚠️  IDs não encontrados: ${educationLevelSlug} / ${gradeSlug}`)
        continue
      }

      skillsToCreate.push({
        code,
        educationLevelId,
        gradeId,
        subjectId,
        unitTheme,
        knowledgeObject,
        description,
        comments,
        curriculumSuggestions,
      })
    }
  }

  console.log(`📦 Inserindo ${skillsToCreate.length} habilidades em batch...`)

  const result = await prisma.bnccSkill.createMany({
    data: skillsToCreate,
    skipDuplicates: true,
  })

  console.log(`✅ Inseridas: ${result.count}`)
  console.log(`⚠️ Ignoradas: ${skipped}`)
}
