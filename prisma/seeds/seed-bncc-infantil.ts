import fs from 'node:fs'
import path from 'node:path'
import type { PrismaClient } from '@db/client'

type RawEiRow = {
  code: string
  field: string
  faixa: string
  objective: string
  approach: string
  suggestions: string
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

/**
 * Mapeia a “Faixa Etária” do TSV para o slug de Grade da EI.
 * Ajuste os slugs conforme seu seed de Grade.
 */
function ageRangeToGradeSlug(ageRangeRaw: string) {
  const v = toAsciiLower(ageRangeRaw)

  // exemplos BNCC:
  // "Bebês (zero a 1 ano e 6 meses)"
  // "Crianças bem pequenas (1 ano e 7 meses a 3 anos e 11 meses)"
  // "Crianças pequenas (4 anos a 5 anos e 11 meses)"

  if (v.startsWith('bebes')) return 'ei-bebes'
  if (v.startsWith('criancas bem pequenas')) return 'ei-criancas-bem-pequenas'
  if (v.startsWith('criancas pequenas')) return 'ei-criancas-pequenas'

  // fallback: slugifica o texto inteiro
  return `ei-${toKebab(ageRangeRaw)}`
}

function parseEiTsv(filePath: string): RawEiRow[] {
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (lines.length < 2) return []

  const header = lines[0].split('\t').map(h => h.trim())
  const idx = (name: string) => header.findIndex(h => h === name)

  const iCode = idx('Código da Habilidade')
  const iField = idx('Campo de experiências')
  const iFaixa = idx('Faixas Etárias')
  const iObj = idx('Objetivos de aprendizagem e desenvolvimento')
  const iApproach = idx('Abordagem das experiências de aprendizagem')
  const iSug = idx('Sugestões para o currículo')

  if ([iCode, iField, iFaixa, iObj].some(v => v < 0)) {
    throw new Error('Header do bncc_infantil.tsv não bate com o esperado.')
  }

  const rows: RawEiRow[] = []
  for (let l = 1; l < lines.length; l++) {
    const cols = lines[l].split('\t')

    rows.push({
      code: cols[iCode] ?? '',
      field: cols[iField] ?? '',
      faixa: cols[iFaixa] ?? '',
      objective: cols[iObj] ?? '',
      approach: cols[iApproach] ?? '',
      suggestions: cols[iSug] ?? '',
    })
  }

  return rows
}

export async function seedBnccSkillsInfantil(prisma: PrismaClient) {
  console.log('🌱 Inserindo BNCC Skills (Educação Infantil) em bncc_skill...')

  const filePath = path.join(process.cwd(), 'prisma', 'seeds', 'data', 'bncc_infantil.tsv')
  const rawRows = parseEiTsv(filePath)

  console.log(`📄 Linhas lidas: ${rawRows.length}`)

  // Buscar IDs necessários
  const educationLevel = await prisma.educationLevel.findUnique({
    where: { slug: 'educacao-infantil' }
  })
  if (!educationLevel) throw new Error('EducationLevel educacao-infantil não encontrado')

  const grades = await prisma.grade.findMany({
    where: { educationLevelId: educationLevel.id },
    select: { id: true, slug: true }
  })
  const gradeIdBySlug = new Map(grades.map(g => [g.slug, g.id]))

  // Mapeamento de Campo de Experiência para Subject
  const fieldToSubjectSlug: Record<string, string> = {
    'O eu, o outro e o nós': 'eu-outro-nos',
    'Corpo, gestos e movimentos': 'corpo-gestos-movimentos',
    'Traços, sons, cores e formas': 'tracos-sons-cores-formas',
    'Escuta, fala, pensamento e imaginação': 'escuta-fala-pensamento',
    'Espaços, tempos, quantidades, relações e transformações': 'espacos-tempos-quantidades',
  }

  const subjects = await prisma.subject.findMany({
    where: { slug: { in: Object.values(fieldToSubjectSlug) } },
    select: { id: true, slug: true }
  })
  const subjectIdBySlug = new Map(subjects.map(s => [s.slug, s.id]))

  const skillsToCreate: any[] = []
  let skipped = 0

  for (const r of rawRows) {
    const code = norm(r.code)
    const fieldOfExperience = norm(r.field)
    const faixa = norm(r.faixa)
    const description = norm(r.objective)

    if (!code || !fieldOfExperience || !faixa || !description) {
      skipped++
      continue
    }

    const gradeSlug = ageRangeToGradeSlug(faixa)
    const gradeId = gradeIdBySlug.get(gradeSlug)
    if (!gradeId) {
      console.warn(`⚠️  Grade não encontrado: ${gradeSlug}`)
      skipped++
      continue
    }

    // Mapear Campo de Experiência para Subject
    const subjectSlug = fieldToSubjectSlug[fieldOfExperience]
    const subjectId = subjectSlug ? subjectIdBySlug.get(subjectSlug) : null

    const comments = norm(r.approach)
    const curriculumSuggestions = norm(r.suggestions)

    skillsToCreate.push({
      code,
      educationLevelId: educationLevel.id,
      gradeId,
      subjectId,
      description,
      comments,
      curriculumSuggestions,
      unitTheme: null,
      knowledgeObject: null,
    })
  }

  console.log(`📦 Inserindo ${skillsToCreate.length} habilidades em batch...`)

  const result = await prisma.bnccSkill.createMany({
    data: skillsToCreate,
    skipDuplicates: true,
  })

  console.log(`✅ Inseridas: ${result.count}`)
  console.log(`⚠️ Ignoradas: ${skipped}`)
}
