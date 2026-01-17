import { Download, Lock, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

export interface DownloadItemMetadata {
  id: string
  name: string
  createdAt: string
}

interface DownloadListProps {
  items: DownloadItemMetadata[]
  title?: string
  onDownload?: (item: DownloadItemMetadata) => void
  loadingItemId?: string | null
  canDownload?: boolean
  onUnlock?: () => void
}

export function DownloadList({
  items,
  title = 'Downloads',
  onDownload,
  loadingItemId,
  canDownload = true,
  onUnlock,
}: DownloadListProps) {
  if (items.length === 0) return null

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-700 uppercase">{title}</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 transition-shadow hover:shadow-sm">
              <span className="text-sm font-medium text-gray-900">{item.name}</span>
              <Button
                size="sm"
                className="gap-2"
                disabled={
                  loadingItemId === item.id ||
                  (canDownload ? !onDownload : !onUnlock)
                }
                aria-busy={loadingItemId === item.id}
                onClick={() => {
                  if (loadingItemId === item.id) return
                  if (canDownload) {
                    onDownload?.(item)
                  } else {
                    onUnlock?.()
                  }
                }}
              >
                {loadingItemId === item.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : canDownload ? (
                  <>
                    <Download className="h-4 w-4" />
                    Baixar
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Desbloquear
                  </>
                )}
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {!onDownload && (
        <p className="text-xs text-muted-foreground">
          Os links de download estão protegidos. Em breve disponibilizaremos acesso seguro.
        </p>
      )}
    </div>
  )
}
