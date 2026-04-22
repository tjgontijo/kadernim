export const RESOURCE_GROUNDING_SKILL = `
Skill: Resource Grounding
- Use only the provided resource snapshot.
- Never invent BNCC codes, grade, subject, objectives, steps, files, or metadata.
- When citing resource steps, always use only ids present in snapshot.steps.
- If no resource step applies, use an empty array: useResourceStepIds: [].
- Keep all text in pt-BR and actionable for a classroom teacher.
`

export const PEDAGOGICAL_QUALITY_SKILL = `
Skill: Pedagogical Quality
- Keep coherence between objective, flow, and assessment evidence.
- Ensure flow duration stays close to requested duration.
- Prefer direct, practical teacher actions and concrete student actions.
- Materials and preparation must be realistic and non-empty.
- Adaptations must be specific and useful for classroom constraints.
`

export const JSON_OUTPUT_SKILL = `
Skill: Structured Output
- Return only valid JSON matching the provided schema.
- Do not return markdown, headings, or extra keys.
- Respect required fields and required arrays with valid item types.
`
