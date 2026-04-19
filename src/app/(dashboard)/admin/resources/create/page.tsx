'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    externalId: null
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="flex-1 overflow-y-auto native-scroll">
        <div className="max-w-6xl mx-auto px-3 md:px-4 py-4 md:py-6 space-y-4 md:space-y-6">
          {/* Header */}
          <div className="bg-background rounded-xl border p-4 md:p-6 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black tracking-tight">Criar Novo Recurso</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Preencha as informações básicas para adicionar um novo material ao catálogo.
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => router.push('/admin/resources')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>

          {/* Form */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ResourceDetailsForm
              resource={emptyResource as any}
              onSuccess={(data) => {
                if (data?.id) {
                  router.push(`/resources/${data.id}`)
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
