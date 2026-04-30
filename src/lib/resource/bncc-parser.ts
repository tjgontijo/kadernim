import { BnccSkill, SubjectComponent, KnowledgeArea } from './schemas'

/**
 * Parse BNCC skill code and extract metadata
 * Format: EF05CI04
 * - EF = Ensino Fundamental
 * - 05 = year (5)
 * - CI = component (Ciências)
 * - 04 = sequence number
 */
export function parseBnccCode(code: string): Omit<BnccSkill, 'description'> & { description?: string } {
  if (!/^EF\d{2}[A-Z]{2}\d{2}$/.test(code)) {
    throw new Error(`Invalid BNCC code format: ${code}`)
  }

  const year = parseInt(code.substring(2, 4), 10)
  const componentCode = code.substring(4, 6)

  const componentMap: Record<string, SubjectComponent> = {
    LP: 'lingua_portuguesa',
    AR: 'arte',
    EF: 'educacao_fisica',
    LI: 'lingua_inglesa',
    MA: 'matematica',
    CI: 'ciencias',
    HI: 'historia',
    GE: 'geografia',
    ER: 'ensino_religioso',
  }

  const component = componentMap[componentCode]
  if (!component) {
    throw new Error(`Unknown component code: ${componentCode}`)
  }

  const areaMap: Record<SubjectComponent, KnowledgeArea> = {
    lingua_portuguesa: 'linguagens',
    arte: 'linguagens',
    educacao_fisica: 'linguagens',
    lingua_inglesa: 'linguagens',
    matematica: 'matematica',
    ciencias: 'ciencias_natureza',
    historia: 'ciencias_humanas',
    geografia: 'ciencias_humanas',
    ensino_religioso: 'ensino_religioso',
  }

  const area = areaMap[component]

  return {
    code,
    year,
    component,
    area,
  }
}

/**
 * Map year to pedagogical phase
 */
export function yearToPhase(year: number): 'phase_1' | 'phase_2' | 'phase_3' | 'phase_4' | 'phase_5' {
  const map: Record<number, 'phase_1' | 'phase_2' | 'phase_3' | 'phase_4' | 'phase_5'> = {
    1: 'phase_1',
    2: 'phase_1',
    3: 'phase_2',
    4: 'phase_2',
    5: 'phase_3',
    6: 'phase_4',
    7: 'phase_4',
    8: 'phase_5',
    9: 'phase_5',
  }
  return map[year] || 'phase_3'
}

/**
 * Get component display name
 */
export function getComponentName(component: SubjectComponent): string {
  const names: Record<SubjectComponent, string> = {
    lingua_portuguesa: 'Português',
    arte: 'Arte',
    educacao_fisica: 'Educação Física',
    lingua_inglesa: 'Inglês',
    matematica: 'Matemática',
    ciencias: 'Ciências',
    historia: 'História',
    geografia: 'Geografia',
    ensino_religioso: 'Ensino Religioso',
  }
  return names[component]
}
/**
 * Map component to CSS subject slug
 */
export function getSubjectSlug(component: SubjectComponent): string {
  const slugs: Record<SubjectComponent, string> = {
    lingua_portuguesa: 'pt',
    arte: 'art',
    educacao_fisica: 'ef',
    lingua_inglesa: 'ing',
    matematica: 'math',
    ciencias: 'sci',
    historia: 'hist',
    geografia: 'geo',
    ensino_religioso: 'er',
  }
  return slugs[component] || 'sci'
}
