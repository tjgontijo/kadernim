'use client'

import React from 'react'
import { ResourceDetailsForm } from '@/components/dashboard/resources/edit/resource-details-form'
import { ResourceFilesManager } from '@/components/dashboard/resources/edit/resource-files-manager'
import { useResource } from '@/hooks/resources/use-resource-context'

export default function CreateResourcePage() {
  const { setResourceTitle } = useResource()
  const [createdResourceId, setCreatedResourceId] = React.useState<string | null>(null)
  const [createdFiles, setCreatedFiles] = React.useState<any[]>([])

  // Seta um título genérico pro breadcrumb
  React.useEffect(() => {
    setResourceTitle('Novo Recurso')
    return () => setResourceTitle(null)
  }, [setResourceTitle])

  const emptyResource = {
    id: createdResourceId || undefined,
    title: '',
    description: '',
    educationLevel: '',
    subject: '',
    grades: [],
  }

  return (
    <div className="bg-stone-50/50 min-h-full">
      <div className="dashboard-page-container py-12">
        <div className="space-y-8">
          {/* Header Editorial - Limpo, sem o botão redundante */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-line pb-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta-2 text-terracotta text-[10px] font-bold uppercase tracking-widest">
                Catálogo Editorial
              </div>
              <h1 className="text-[42px] font-display font-medium leading-tight text-ink">
                Novo Recurso
              </h1>
            </div>
          </div>

          {/* Form Container */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            <ResourceDetailsForm
              resource={emptyResource as any}
              hideSecondarySectionsUntilSaved
              onSuccess={(data) => {
                if (data?.id && !createdResourceId) {
                  setCreatedResourceId(data.id)
                  setCreatedFiles(data.files ?? [])
                }
              }}
            />
          </div>

          {createdResourceId && (
            <div className="space-y-8 bg-paper p-8 rounded-4 border border-line shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-ink/20" />
              <div className="flex items-center gap-3 border-b border-line pb-4">
                <h2 className="font-display text-xl text-ink uppercase tracking-tight">Arquivos e Documentos</h2>
              </div>
              <ResourceFilesManager
                resourceId={createdResourceId}
                initialFiles={createdFiles}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
