import React, { useState, useRef, useEffect } from "react"
import { Download, File, Trash2, Loader2, Upload as UploadIcon, CheckCircle2, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import {
  deleteResourceFilePreview,
  deleteResourceFile,
  generateNextResourceFilePreview,
  reorderResourceFilePreviews,
  uploadResourceFileWithProgress,
} from "@/lib/resources/api-client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { DeleteConfirmDialog } from "@/components/dashboard/crud/delete-confirm-dialog"
import { cn } from "@/lib/utils/index"

interface FileData {
  id: string
  name: string
  cloudinaryPublicId?: string
  url: string
  fileType: string | null
  sizeBytes: number | null
  createdAt: string
  images?: Array<{
    id: string
    cloudinaryPublicId?: string
    url: string | null
    alt: string | null
    order: number
  }>
}

interface UploadProgress {
  fileName: string
  progress: number
  status: "uploading" | "success" | "error"
}

interface ResourceFilesManagerProps {
  resourceId: string
  initialFiles: FileData[]
  disabled?: boolean
  allowGenerateNextPreview?: boolean
}

export function ResourceFilesManager({
  resourceId,
  initialFiles,
  disabled = false,
  allowGenerateNextPreview = false,
}: ResourceFilesManagerProps) {
  const queryClient = useQueryClient()
  const [files, setFiles] = useState<FileData[]>(initialFiles)
  const [activeUploads, setActiveUploads] = useState<Record<string, UploadProgress>>({})
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sincroniza estado local se initialFiles mudar
  useEffect(() => {
    setFiles(initialFiles)
  }, [initialFiles])

  const uploadFileWithProgress = (file: File) => {
    if (disabled) return

    const uploadId = Math.random().toString(36).substring(7)

    setActiveUploads(prev => ({
      ...prev,
      [uploadId]: { fileName: file.name, progress: 0, status: "uploading" }
    }))

    uploadResourceFileWithProgress({
      resourceId,
      file,
      onProgress: progress => {
        setActiveUploads(prev => ({
          ...prev,
          [uploadId]: { ...prev[uploadId], progress }
        }))
      },
    })
      .then(newFileData => {
        setActiveUploads(prev => ({
          ...prev,
          [uploadId]: { ...prev[uploadId], progress: 100, status: "success" }
        }))

        setTimeout(() => {
          setFiles(prev => [...prev, newFileData])
          queryClient.invalidateQueries({ queryKey: ["admin-resource-detail", resourceId] })
          toast.success(`${file.name} enviado corretamente`)

          setTimeout(() => {
            setActiveUploads(prev => {
              const newState = { ...prev }
              delete newState[uploadId]
              return newState
            })
          }, 500)
        }, 400)
      })
      .catch(() => {
        setActiveUploads(prev => ({
          ...prev,
          [uploadId]: { ...prev[uploadId], status: "error" }
        }))
        toast.error(`Erro ao enviar ${file.name}`)
      })
  }

  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => deleteResourceFile(resourceId, fileId),
    onSuccess: (_, fileId) => {
      setFiles((prev) => prev.filter((f) => f.id !== fileId))
      toast.success("Arquivo removido")
      queryClient.invalidateQueries({ queryKey: ["admin-resource-detail", resourceId] })
    },
  })

  const deletePreviewMutation = useMutation({
    mutationFn: ({
      fileId,
      imageId,
    }: {
      fileId: string
      imageId: string
    }) => deleteResourceFilePreview(resourceId, fileId, imageId),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir preview")
      queryClient.invalidateQueries({ queryKey: ["admin-resource-detail", resourceId] })
    },
  })

  const reorderPreviewsMutation = useMutation({
    mutationFn: ({
      fileId,
      updates,
    }: {
      fileId: string
      updates: Array<{ id: string; order: number }>
    }) => reorderResourceFilePreviews(resourceId, fileId, updates),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erro ao reordenar previews")
      queryClient.invalidateQueries({ queryKey: ["admin-resource-detail", resourceId] })
    },
  })

  const generatePreviewMutation = useMutation({
    mutationFn: (fileId: string) => generateNextResourceFilePreview(resourceId, fileId),
    onSuccess: (newPreview, fileId) => {
      setFiles((prev) =>
        prev.map((file) => {
          if (file.id !== fileId) return file
          const nextImages = [...(file.images ?? []), newPreview]
          return {
            ...file,
            images: nextImages.sort((a, b) => a.order - b.order),
          }
        })
      )
      toast.success("Nova página de preview gerada")
      queryClient.invalidateQueries({ queryKey: ["admin-resource-detail", resourceId] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erro ao gerar nova página de preview")
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    const selectedFiles = Array.from(e.target.files || [])
    selectedFiles.forEach(file => uploadFileWithProgress(file))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (disabled) return
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (disabled) return
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    droppedFiles.forEach(file => uploadFileWithProgress(file))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const isPdfFile = (file: FileData): boolean => {
    return (file.fileType || "").toLowerCase().includes("pdf") || file.name.toLowerCase().endsWith(".pdf")
  }

  const reorderPreviewList = (
    fileId: string,
    fromIndex: number,
    toIndex: number
  ) => {
    if (fromIndex === toIndex || toIndex < 0) return

    const file = files.find((item) => item.id === fileId)
    const previews = file?.images ?? []
    if (toIndex >= previews.length) return

    const reordered = [...previews]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)

    const normalized = reordered.map((image, index) => ({
      ...image,
      order: index,
    }))

    setFiles((prev) =>
      prev.map((item) => (item.id === fileId ? { ...item, images: normalized } : item))
    )

    reorderPreviewsMutation.mutate({
      fileId,
      updates: normalized.map((image) => ({ id: image.id, order: image.order })),
    })
  }

  const deleteSinglePreview = (fileId: string, imageId: string) => {
    setFiles((prev) =>
      prev.map((item) => {
        if (item.id !== fileId) return item
        const filtered = (item.images ?? []).filter((image) => image.id !== imageId)
        return {
          ...item,
          images: filtered.map((image, index) => ({
            ...image,
            order: index,
          })),
        }
      })
    )

    deletePreviewMutation.mutate(
      { fileId, imageId },
      {
        onSuccess: () => {
          toast.success("Preview removido")
          queryClient.invalidateQueries({ queryKey: ["admin-resource-detail", resourceId] })
        },
      }
    )
  }

  const activeUploadsArray = Object.entries(activeUploads)

  return (
    <div className="space-y-6">
      <input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
        disabled={disabled}
      />

      {/* Upload Zone */}
      <Card
        className={cn(
          "overflow-hidden border-2 border-dashed transition-all cursor-pointer group relative",
          disabled && "cursor-not-allowed opacity-60",
          isDragging ? "bg-primary/5 border-primary shadow-inner scale-[1.01]" : "bg-muted/5 border-muted-foreground/20 hover:border-primary/50",
          "h-52 flex flex-col items-center justify-center text-center"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled) fileInputRef.current?.click()
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className={cn(
            "h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm",
            isDragging ? "bg-primary text-primary-foreground rotate-12" : "bg-background border group-hover:bg-primary/10 group-hover:text-primary group-hover:-translate-y-1"
          )}>
            <UploadIcon className={cn("h-8 w-8", isDragging ? "animate-bounce" : "")} />
          </div>
          <div className="space-y-1">
            <p className="font-extrabold text-lg tracking-tight">
              {disabled
                ? "Salve o recurso para habilitar uploads"
                : isDragging
                  ? "Solte agora para enviar!"
                  : "Arraste seus arquivos para cá"}
            </p>
            <p className="text-sm text-muted-foreground font-medium">
              {disabled
                ? "Depois do primeiro salvamento, o upload de arquivos será liberado."
                : "Ou clique para explorar sua galeria técnica"}
            </p>
          </div>
        </div>
      </Card>

      {/* Files List Header */}
      <div className="flex items-center justify-between mt-8">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
            Arquivos do Recurso
            <Badge variant="outline" className="ml-2 bg-muted/50 border-muted-foreground/20 font-bold">
              {files.length + activeUploadsArray.filter(([_, u]) => u.status === "uploading").length}
            </Badge>
          </h3>
        </div>
        {files.length > 0 && (
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Total: {formatFileSize(files.reduce((acc, curr) => acc + (curr.sizeBytes ?? 0), 0))}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Active Uploads Slots */}
        {activeUploadsArray.map(([id, upload]) => (
          <Card key={id} className="overflow-hidden border border-primary/30 bg-primary/5 animate-pulse-slow">
            <div className="p-4 flex items-center gap-4">
              <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                upload.status === "success" ? "bg-green-500/10" : "bg-primary/20"
              )}>
                {upload.status === "success" ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500 animate-in zoom-in" />
                ) : (
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex justify-between items-center pr-2">
                  <p className="text-sm font-bold truncate pr-4">{upload.fileName}</p>
                  <span className="text-[10px] font-black text-primary uppercase">
                    {upload.progress >= 98 && upload.status === "uploading" ? "Processando..." : `${upload.progress}%`}
                  </span>
                </div>
                <Progress
                  value={upload.progress}
                  className={cn(
                    "h-1.5 flex-1 transition-all",
                    upload.status === "success" && "bg-green-500/20"
                  )}
                />
              </div>
            </div>
          </Card>
        ))}

        {/* Existing Files */}
        {files.map((file) => (
          <Card
            key={file.id}
            className="overflow-hidden border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group"
          >
            <div className="p-4 space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-muted/30 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <File className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-foreground group-hover:text-primary transition-colors">
                    {file.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-muted-foreground font-medium">
                    <span>{formatFileSize(file.sizeBytes ?? 0)}</span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                    <span>{formatDate(file.createdAt)}</span>
                    {isPdfFile(file) && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                        <span>{file.images?.length ?? 0} previews</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  {isPdfFile(file) && allowGenerateNextPreview && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                      onClick={() => generatePreviewMutation.mutate(file.id)}
                      disabled={generatePreviewMutation.isPending}
                      title="Gerar mais uma página de preview"
                    >
                      {generatePreviewMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                    onClick={() => window.open(file.url, "_blank")}
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  <DeleteConfirmDialog
                    onConfirm={() => deleteMutation.mutate(file.id)}
                    isLoading={deleteMutation.isPending}
                    title="Excluir Arquivo?"
                    description={`O arquivo "${file.name}" será removido permanentemente.`}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    }
                  />
                </div>
              </div>

              {isPdfFile(file) && (
                <div className="space-y-2 rounded-lg border border-line bg-muted/10 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Prévia das páginas geradas
                  </p>
                  {file.images && file.images.length > 0 ? (
                    <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap pb-2 pr-1">
                      {file.images.map((image) => (
                        <div
                          key={image.id}
                          className="group/preview relative h-40 w-28 shrink-0 overflow-hidden rounded-md border border-line bg-muted/20 transition-all hover:border-primary/60"
                        >
                          <button
                            type="button"
                            className="h-full w-full"
                            title={image.alt || file.name}
                            onClick={() => {
                              if (image.url) window.open(image.url, "_blank")
                            }}
                          >
                            {image.url ? (
                              <img
                                src={image.url}
                                alt={image.alt || file.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-muted/40" />
                            )}
                          </button>

                          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-black/55 px-0.5 py-0.5 opacity-0 transition-opacity group-hover/preview:opacity-100">
                            <button
                              type="button"
                              className="inline-flex h-4 w-4 items-center justify-center rounded bg-black/40 text-white disabled:opacity-40"
                              disabled={image.order === 0 || reorderPreviewsMutation.isPending}
                              onClick={(event) => {
                                event.stopPropagation()
                                reorderPreviewList(file.id, image.order, image.order - 1)
                              }}
                              title="Mover para a esquerda"
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              className="inline-flex h-4 w-4 items-center justify-center rounded bg-black/40 text-white disabled:opacity-40"
                              disabled={image.order === (file.images?.length ?? 1) - 1 || reorderPreviewsMutation.isPending}
                              onClick={(event) => {
                                event.stopPropagation()
                                reorderPreviewList(file.id, image.order, image.order + 1)
                              }}
                              title="Mover para a direita"
                            >
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            className="absolute bottom-1 right-1 z-10 inline-flex h-5 w-5 items-center justify-center rounded-full bg-destructive/90 text-destructive-foreground opacity-0 transition-opacity hover:bg-destructive group-hover/preview:opacity-100 disabled:opacity-40"
                            disabled={deletePreviewMutation.isPending}
                            onClick={(event) => {
                              event.stopPropagation()
                              deleteSinglePreview(file.id, image.id)
                            }}
                            title="Excluir preview"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Este PDF ainda não possui prévias geradas.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="h-1 w-full bg-muted/10">
              <div className="h-full bg-primary/20 transition-all group-hover:bg-primary/50" style={{ width: '40%' }} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
