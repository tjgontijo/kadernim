'use client'

import React, { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { fetchAdminResourceDetail } from '@/lib/resources/api-client'
import { ResourceDetailsForm } from '@/components/dashboard/resources/edit/resource-details-form'
import { ResourceFilesManager } from '@/components/dashboard/resources/edit/resource-files-manager'
import { useResource } from '@/hooks/resources/use-resource-context'
import { ResourceDetailsFormSkeleton } from '@/components/dashboard/resources/edit/resource-details-form-skeleton'

export default function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { setResourceTitle } = useResource()

  const {
    data: resource,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-resource-detail', id],
    queryFn: () => fetchAdminResourceDetail(id),
  })

  // Seta o título pro breadcrumb
  React.useEffect(() => {
    if (resource) {
      setResourceTitle(`Editando: ${resource.title}`)
    }
    return () => setResourceTitle(null)
  }, [resource, setResourceTitle])

  if (isLoading) {
    return (
      <div className="bg-stone-50/50 min-h-full">
        <div className="dashboard-page-container py-12">
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-line pb-8">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta-2 text-terracotta text-[10px] font-bold uppercase tracking-widest">
                  Modo de Edição Geral
                </div>
                <h1 className="text-[42px] font-display font-medium leading-tight text-ink">
                  Editar Material
                </h1>
              </div>
            </div>
            <ResourceDetailsFormSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (error || !resource) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-2xl font-display text-ink">Ops! Material não encontrado.</h2>
        <p className="text-ink-mute">Não conseguimos localizar os dados para edição.</p>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/resources">Voltar para a listagem</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-stone-50/50 min-h-full">
      <div className="dashboard-page-container py-12">
        <div className="space-y-12">
          {/* Header Editorial */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-line pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta-2 text-terracotta text-[10px] font-bold uppercase tracking-widest">
                  Modo de Edição Geral
                </div>
              </div>
              <h1 className="text-[42px] font-display font-medium leading-tight text-ink">
                Editar Material
              </h1>
            </div>
          </div>

          {/* Form Principal: Info, BNCC e Pedagogia */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ResourceDetailsForm
              resource={resource as any}
              extraSections={
                <div className="grid grid-cols-1 gap-12 pt-12 border-t border-line">
                  <div className="space-y-8 bg-paper p-8 rounded-4 border border-line shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-ink/20" />
                    <div className="flex items-center gap-3 border-b border-line pb-4">
                      <h2 className="font-display text-xl text-ink uppercase tracking-tight">Arquivos e Documentos</h2>
                    </div>
                    <ResourceFilesManager
                      resourceId={resource.id}
                      initialFiles={resource.files as any}
                      allowGenerateNextPreview={Boolean(resource.googleDriveUrl)}
                    />
                  </div>
                </div>
              }
              onSuccess={() => {
                // Ao salvar o formulário principal, mantemos na página 
                // para permitir edição de arquivos/imagens se necessário
                // ou apenas mostrar o feedback de sucesso
              }}
            />
          </section>
        </div>
      </div>
    </div>
  )
}
