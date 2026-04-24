'use client'

import Link from 'next/link'
import { BookMarked, FileText, Layers, Lightbulb } from 'lucide-react'
import type { BnccSkillDetail } from '@/lib/bncc/schemas/bncc-schemas'
import { LazyImage } from '@/components/shared/lazy-image'

interface BnccSkillDetailProps {
  skill?: BnccSkillDetail
  isLoading?: boolean
}

function DetailSkeleton() {
  return (
    <div className="rounded-4 border border-line bg-card p-5 space-y-3 shadow-sm">
      <div className="h-5 w-40 animate-pulse rounded bg-paper-2" />
      <div className="h-4 w-3/4 animate-pulse rounded bg-paper-2" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-paper-2" />
      <div className="h-20 w-full animate-pulse rounded bg-paper-2" />
      <div className="h-16 w-full animate-pulse rounded bg-paper-2" />
    </div>
  )
}

export function BnccSkillDetailPanel({ skill, isLoading }: BnccSkillDetailProps) {
  if (isLoading) {
    return <DetailSkeleton />
  }

  if (!skill) {
    return (
      <div className="rounded-4 border border-dashed border-line bg-card p-8 text-center text-ink-mute">
        Selecione uma habilidade para ver os detalhes.
      </div>
    )
  }

  const relatedResources = skill.relatedResources ?? []

  return (
    <article className="rounded-4 border border-line bg-card p-5 shadow-sm space-y-5">
      <header className="space-y-2 border-b border-line pb-4">
        <p className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-[0.06em] text-terracotta">
          <BookMarked className="h-4 w-4" />
          {skill.code}
        </p>
        <div className="flex flex-wrap gap-2 text-[11px] text-ink-soft">
          <span className="rounded-full border border-line bg-paper px-2.5 py-1">{skill.educationLevel.name}</span>
          {skill.grade && <span className="rounded-full border border-line bg-paper px-2.5 py-1">{skill.grade.name}</span>}
          {skill.subject && <span className="rounded-full border border-line bg-paper px-2.5 py-1">{skill.subject.name}</span>}
        </div>
      </header>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-ink inline-flex items-center gap-2">
          <FileText className="h-4 w-4 text-ink-mute" />
          Habilidade
        </h3>
        <p className="text-sm leading-relaxed text-ink">{skill.description}</p>
      </section>

      {(skill.unitTheme || skill.knowledgeObject) && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-ink inline-flex items-center gap-2">
            <Layers className="h-4 w-4 text-ink-mute" />
            Contexto Curricular
          </h3>
          <div className="space-y-2 text-sm text-ink-soft">
            {skill.unitTheme && (
              <p>
                <span className="font-semibold text-ink">Unidade tematica:</span> {skill.unitTheme}
              </p>
            )}
            {skill.knowledgeObject && (
              <p>
                <span className="font-semibold text-ink">Objeto de conhecimento:</span> {skill.knowledgeObject}
              </p>
            )}
          </div>
        </section>
      )}

      {(skill.comments || skill.curriculumSuggestions) && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-ink inline-flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-ink-mute" />
            Apoio Pedagogico
          </h3>
          {skill.comments && (
            <div className="rounded-3 border border-line bg-paper-2 p-3">
              <p className="text-[11px] uppercase tracking-widest font-black text-ink-mute">Comentarios</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{skill.comments}</p>
            </div>
          )}
          {skill.curriculumSuggestions && (
            <div className="rounded-3 border border-line bg-paper-2 p-3">
              <p className="text-[11px] uppercase tracking-widest font-black text-ink-mute">Sugestoes para o curriculo</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{skill.curriculumSuggestions}</p>
            </div>
          )}
        </section>
      )}

      {relatedResources.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-ink">Materiais relacionados</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {relatedResources.map((resource) => (
              <Link
                key={resource.id}
                href={`/resources/${resource.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-3 border border-line bg-paper-2 p-1.5 transition-colors hover:bg-paper"
              >
                <div className="relative w-full aspect-square rounded-2 overflow-hidden border border-line-soft bg-paper">
                  {resource.thumbUrl ? (
                    <LazyImage
                      src={resource.thumbUrl}
                      alt={resource.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 30vw, 120px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-ink-mute">
                      <FileText className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <p className="mt-1.5 text-[11px] leading-snug text-ink line-clamp-2 group-hover:text-terracotta">
                  {resource.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="pt-2 text-xs text-ink-mute">
        {skill.relatedResourcesCount} {skill.relatedResourcesCount === 1 ? 'material relacionado' : 'materiais relacionados'} no catalogo.
      </footer>
    </article>
  )
}
