import { PageScaffold, ScaffoldHeader, ScaffoldControls } from '@/components/dashboard/shared/page-scaffold'

export function BnccPageSkeleton() {
  return (
    <PageScaffold className="pt-4 sm:pt-6">
      <ScaffoldHeader title="Diretrizes" />

      <ScaffoldControls>
        <div className="h-11 sm:h-12 flex-1 animate-pulse rounded-2xl bg-paper-2" />
        <div className="h-11 sm:h-12 w-11 sm:w-12 animate-pulse rounded-2xl bg-paper-2" />
      </ScaffoldControls>

      <section className="px-0 min-h-[420px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-4 border border-line bg-paper-2" />
          ))}
        </div>
      </section>
    </PageScaffold>
  )
}
