import React, { useState, useRef, useEffect } from "react"
import { Download, File, Trash2, Loader2, Upload as UploadIcon, CheckCircle2, AlertCircle, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { DeleteConfirmDialog } from "@/components/admin/crud/delete-confirm-dialog"
import { cn } from "@/lib/utils/index"

interface FileData {
  id: string
  name: string
  cloudinaryPublicId: string
  url: string
  fileType: string
  sizeBytes: number
  createdAt: string
}

interface UploadProgress {
  fileName: string
  progress: number
  status: "uploading" | "success" | "error"
}

interface ResourceFilesManagerProps {
  resourceId: string
  initialFiles: FileData[]
}

export function ResourceFilesManager({
  resourceId,
  initialFiles,
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
    const uploadId = Math.random().toString(36).substring(7)

    setActiveUploads(prev => ({
      ...prev,
      [uploadId]: { fileName: file.name, progress: 0, status: "uploading" }
    }))

    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append("file", file)

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        // Limitamos a 98% para a transferência, deixando os 2% finais para o processamento do servidor
        const percent = Math.min(Math.round((event.loaded / event.total) * 100), 98)
        setActiveUploads(prev => ({
          ...prev,
          [uploadId]: { ...prev[uploadId], progress: percent }
        }))
      }
    })

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const newFileData = JSON.parse(xhr.responseText)

          // Sucesso real: completamos para 100%
          setActiveUploads(prev => ({
            ...prev,
            [uploadId]: { ...prev[uploadId], progress: 100, status: "success" }
          }))

          setTimeout(() => {
            setFiles(prev => [...prev, newFileData])
            queryClient.invalidateQueries({ queryKey: ["resource-detail", resourceId] })
            toast.success(`${file.name} enviado corretamente`)

            // Remove o slot após um breve momento de confirmação visual
            setTimeout(() => {
              setActiveUploads(prev => {
                const newState = { ...prev }
                delete newState[uploadId]
                return newState
              })
            }, 500)
          }, 400)
        } catch (e) {
          handleError()
        }
      } else {
        handleError()
      }
    })

    xhr.addEventListener("error", () => handleError())

    const handleError = () => {
      setActiveUploads(prev => ({
        ...prev,
        [uploadId]: { ...prev[uploadId], status: "error" }
      }))
      toast.error(`Erro ao enviar ${file.name}`)
    }

    xhr.open("POST", `/api/v1/admin/resources/${resourceId}/files`)
    xhr.send(formData)
  }

  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await fetch(`/api/v1/admin/resources/${resourceId}/files/${fileId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Falha ao excluir arquivo")
    },
    onSuccess: (_, fileId) => {
      setFiles((prev) => prev.filter((f) => f.id !== fileId))
      toast.success("Arquivo removido")
      queryClient.invalidateQueries({ queryKey: ["resource-detail", resourceId] })
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    selectedFiles.forEach(file => uploadFileWithProgress(file))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
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
      />

      {/* Upload Zone */}
      <Card
        className={cn(
          "overflow-hidden border-2 border-dashed transition-all cursor-pointer group relative",
          isDragging ? "bg-primary/5 border-primary shadow-inner scale-[1.01]" : "bg-muted/5 border-muted-foreground/20 hover:border-primary/50",
          "h-52 flex flex-col items-center justify-center text-center"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
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
              {isDragging ? "Solte agora para enviar!" : "Arraste seus arquivos para cá"}
            </p>
            <p className="text-sm text-muted-foreground font-medium">
              Ou clique para explorar sua galeria técnica
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
            Total: {formatFileSize(files.reduce((acc, curr) => acc + curr.sizeBytes, 0))}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="p-4 flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-muted/30 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                <File className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate text-foreground group-hover:text-primary transition-colors">
                  {file.name}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-muted-foreground font-medium">
                  <span className="flex items-center gap-1">
                    {formatFileSize(file.sizeBytes)}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                  <span>
                    {formatDate(file.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
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
            <div className="h-1 w-full bg-muted/10">
              <div className="h-full bg-primary/20 transition-all group-hover:bg-primary/50" style={{ width: '40%' }} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
