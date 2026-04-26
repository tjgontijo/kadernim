/**
 * Parser de códigos de habilidade BNCC
 *
 * Formato: EF05CI04
 *   EF  = Ensino Fundamental (nível)
 *   05  = 5º ano
 *   CI  = Ciências (componente curricular)
 *   04  = número sequencial da habilidade
 */

// ---- Tipos estruturais BNCC ----

export type EducationLevel = "EF" | "EM"

export type KnowledgeArea =
  | "linguagens"
  | "matematica"
  | "ciencias_natureza"
  | "ciencias_humanas"
  | "ensino_religioso"

export type SubjectComponent =
  | "lingua_portuguesa"
  | "arte"
  | "educacao_fisica"
  | "lingua_inglesa"
  | "matematica"
  | "ciencias"
  | "historia"
  | "geografia"
  | "ensino_religioso"

export type BNCCSkill = {
  code: string                   // "EF05CI04"
  level: EducationLevel          // "EF"
  year: number                   // 5
  componentCode: string          // "CI"
  component: SubjectComponent    // "ciencias"
  componentLabel: string         // "Ciências"
  area: KnowledgeArea            // "ciencias_natureza"
  areaLabel: string              // "Ciências da Natureza"
  skillNumber: number            // 4
  description?: string           // populado pelo banco de habilidades
}

// ---- Mapeamento de siglas → componente ----

const COMPONENT_MAP: Record<string, { component: SubjectComponent; label: string; area: KnowledgeArea; areaLabel: string }> = {
  LP: { component: "lingua_portuguesa", label: "Língua Portuguesa",  area: "linguagens",          areaLabel: "Linguagens" },
  AR: { component: "arte",              label: "Arte",                area: "linguagens",          areaLabel: "Linguagens" },
  EF: { component: "educacao_fisica",   label: "Educação Física",     area: "linguagens",          areaLabel: "Linguagens" },
  LI: { component: "lingua_inglesa",    label: "Língua Inglesa",      area: "linguagens",          areaLabel: "Linguagens" },
  MA: { component: "matematica",        label: "Matemática",          area: "matematica",          areaLabel: "Matemática" },
  CI: { component: "ciencias",          label: "Ciências",            area: "ciencias_natureza",   areaLabel: "Ciências da Natureza" },
  HI: { component: "historia",          label: "História",            area: "ciencias_humanas",    areaLabel: "Ciências Humanas" },
  GE: { component: "geografia",         label: "Geografia",           area: "ciencias_humanas",    areaLabel: "Ciências Humanas" },
  ER: { component: "ensino_religioso",  label: "Ensino Religioso",    area: "ensino_religioso",    areaLabel: "Ensino Religioso" },
}

// ---- Parser ----

export function parseBNCCCode(code: string): BNCCSkill {
  const normalized = code.trim().toUpperCase()
  const match = normalized.match(/^(EF|EM)(\d{2})([A-Z]{2})(\d{2,3})$/)

  if (!match) {
    throw new Error(
      `Código BNCC inválido: "${code}". Formato esperado: EF05CI04`
    )
  }

  const [, level, yearStr, componentCode, skillStr] = match
  const year = parseInt(yearStr)
  const skillNumber = parseInt(skillStr)
  const mapping = COMPONENT_MAP[componentCode]

  if (!mapping) {
    throw new Error(
      `Componente curricular desconhecido: "${componentCode}". Componentes válidos: ${Object.keys(COMPONENT_MAP).join(", ")}`
    )
  }

  // Educação Física usa "EF" como sigla, mas o prefixo "EF" já indica Ensino Fundamental.
  // Isso é resolvido pela posição no regex: chars 1-2 = nível, chars 5-6 = componente.
  if (level === "EF" && componentCode === "EF") {
    // Válido: EF01EF01 = Ensino Fundamental, 1º ano, Educação Física, habilidade 01
  }

  return {
    code: normalized,
    level: level as EducationLevel,
    year,
    componentCode,
    component: mapping.component,
    componentLabel: mapping.label,
    area: mapping.area,
    areaLabel: mapping.areaLabel,
    skillNumber,
  }
}

// ---- Validação (sem lançar exceção) ----

export function isValidBNCCCode(code: string): boolean {
  try {
    parseBNCCCode(code)
    return true
  } catch {
    return false
  }
}

// ---- Componentes disponíveis por ano (regras BNCC) ----

export function getAvailableComponents(year: number): SubjectComponent[] {
  const base: SubjectComponent[] = [
    "lingua_portuguesa",
    "arte",
    "educacao_fisica",
    "matematica",
    "ciencias",
    "historia",
    "geografia",
  ]

  if (year >= 6) base.push("lingua_inglesa")

  // Ensino Religioso é opcional em todas as séries
  base.push("ensino_religioso")

  return base
}

// ---- Paleta visual por componente ----

export type SubjectTheme = {
  primary: string
  light: string
  dark: string
  icon: string
}

export const SUBJECT_THEMES: Record<SubjectComponent, SubjectTheme> = {
  lingua_portuguesa: { primary: "#7C3AED", light: "#EDE9FE", dark: "#5B21B6", icon: "📚" },
  arte:              { primary: "#DB2777", light: "#FCE7F3", dark: "#9D174D", icon: "🎨" },
  educacao_fisica:   { primary: "#16A34A", light: "#DCFCE7", dark: "#14532D", icon: "⚽" },
  lingua_inglesa:    { primary: "#0891B2", light: "#CFFAFE", dark: "#075985", icon: "🌐" },
  matematica:        { primary: "#2563EB", light: "#DBEAFE", dark: "#1E40AF", icon: "📐" },
  ciencias:          { primary: "#059669", light: "#D1FAE5", dark: "#065F46", icon: "🔬" },
  historia:          { primary: "#D97706", light: "#FEF3C7", dark: "#92400E", icon: "🏛️" },
  geografia:         { primary: "#0891B2", light: "#CFFAFE", dark: "#075985", icon: "🌍" },
  ensino_religioso:  { primary: "#6366F1", light: "#E0E7FF", dark: "#3730A3", icon: "🕊️" },
}

// ---- Uso ----
// const skill = parseBNCCCode("EF05CI04")
// → { code: "EF05CI04", year: 5, component: "ciencias", componentLabel: "Ciências",
//     area: "ciencias_natureza", areaLabel: "Ciências da Natureza", skillNumber: 4 }
//
// const theme = SUBJECT_THEMES[skill.component]
// → { primary: "#059669", light: "#D1FAE5", dark: "#065F46", icon: "🔬" }
