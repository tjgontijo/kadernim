import fs from 'node:fs'
import path from 'node:path'
import type { PrismaClient } from '../generated/prisma/client'

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

/**
 * Seed BNCC Skills (Educação Infantil)
 *
 * Requer no Prisma:
 * - code sem @unique
 * - @@unique([code, ageRange])
 */
export async function seedBnccSkillsInfantil(prisma: PrismaClient) {
  console.log('🌱 Inserindo BNCC Skills (Educação Infantil) em bncc_skill...')

  const filePath = path.join(process.cwd(), 'prisma', 'seeds', 'data', 'bncc_infantil.tsv')
  const rawRows = parseEiTsv(filePath)

  console.log(`📄 Linhas lidas: ${rawRows.length}`)

  let upserts = 0
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

    const ageRange = ageRangeToGradeSlug(faixa)

    const comments = norm(r.approach)
    const curriculumSuggestions = norm(r.suggestions)

    await prisma.bnccSkill.upsert({
      where: {
        // exige @@unique([code, ageRange])
        code_ageRange: { code, ageRange },
      },
      update: {
        educationLevelSlug: 'educacao-infantil',
        fieldOfExperience,
        ageRange,
        description,
        comments,
        curriculumSuggestions,

        // garante que campos do EF ficam nulos
        gradeSlug: null,
        subjectSlug: null,
        unitTheme: null,
        knowledgeObject: null,
      },
      create: {
        code,
        educationLevelSlug: 'educacao-infantil',
        fieldOfExperience,
        ageRange,
        description,
        comments,
        curriculumSuggestions,
      },
    })

    upserts++
  }

  console.log(`✅ Upserts: ${upserts}`)
  console.log(`⚠️ Ignoradas: ${skipped}`)
}
