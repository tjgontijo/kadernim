'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ResourceDetailsForm } from '@/components/dashboard/resources/edit/resource-details-form'
import { useResource } from '@/hooks/resources/use-resource-context'

export default function CreateResourcePage() {
  const router = useRouter()
  const { setResourceTitle } = useResource()

  // Seta um título genérico pro breadcrumb
  React.useEffect(() => {
    setResourceTitle('Novo Recurso')
    return () => setResourceTitle(null)
  }, [setResourceTitle])

  const emptyResource = {
    title: '',
    description: '',
    educationLevel: '',
    subject: '',
    grades: [],
  }

  return (
    <div className="bg-stone-50/50 min-h-full">
      <div className="max-w-6xl mx-auto py-12 px-6 lg:px-12">
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
              onSuccess={(data) => {
                if (data?.id) {
                  router.push(`/resources`)
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
