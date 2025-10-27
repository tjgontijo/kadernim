import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Skeleton */}
        <div className="space-y-2 mb-8">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Form Skeleton */}
        <div className="space-y-6 bg-white rounded-lg border border-gray-200 p-6">
          {/* Título */}
          <div className="space-y-2 w-full">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-12 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>

          {/* Nível de Ensino e Disciplina */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 w-full">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="space-y-2 w-full">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
            <div className="rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
              {/* Editor Toolbar Skeleton */}
              <div className="p-3 border-b border-gray-200 flex gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
              {/* Editor Content Skeleton */}
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 justify-end pt-6 border-t">
            <Skeleton className="h-11 w-24" />
            <Skeleton className="h-11 w-40" />
          </div>
        </div>

        {/* Info Box Skeleton */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <Skeleton className="h-5 w-48 mb-3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </div>
    </div>
  )
}
