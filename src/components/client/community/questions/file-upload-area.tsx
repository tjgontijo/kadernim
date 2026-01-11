'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileUploadAreaProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
    maxFiles: number;
    maxSizeMB: number;
    accept?: string[];
}

export function FileUploadArea({
    files,
    onFilesChange,
    maxFiles,
    maxSizeMB,
    accept = ['image/png', 'image/jpeg', 'application/pdf']
}: FileUploadAreaProps) {
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
        setError(null);

        if (fileRejections.length > 0) {
            const rejection = fileRejections[0];
            if (rejection.errors[0].code === 'file-too-large') {
                setError(`O arquivo é muito grande. O limite é ${maxSizeMB}MB.`);
            } else if (rejection.errors[0].code === 'too-many-files') {
                setError(`Você pode enviar no máximo ${maxFiles} arquivos.`);
            } else {
                setError('Ocorreu um erro ao selecionar os arquivos.');
            }
            return;
        }

        const newTotal = files.length + acceptedFiles.length;
        if (newTotal > maxFiles) {
            setError(`Você pode enviar no máximo ${maxFiles} arquivos.`);
            return;
        }

        onFilesChange([...files, ...acceptedFiles]);
    }, [files, maxFiles, maxSizeMB, onFilesChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: maxFiles - files.length,
        maxSize: maxSizeMB * 1024 * 1024,
        accept: accept.reduce((acc, curr) => ({ ...acc, [curr]: [] }), {}),
        disabled: files.length >= maxFiles
    });

    const removeFile = (index: number) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        onFilesChange(newFiles);
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={cn(
                    "relative border-2 border-dashed rounded-[32px] p-8 transition-all cursor-pointer group",
                    isDragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-border/50 bg-muted/20 hover:border-primary/50",
                    files.length >= maxFiles && "opacity-50 cursor-not-allowed grayscale"
                )}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center justify-center text-center space-y-3">
                    <div className={cn(
                        "h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-300",
                        isDragActive ? "bg-primary text-primary-foreground rotate-12" : "bg-background border group-hover:bg-primary/10 group-hover:text-primary group-hover:-translate-y-1"
                    )}>
                        <Upload className={cn("h-8 w-8", isDragActive && "animate-bounce")} />
                    </div>

                    <div className="space-y-1">
                        <p className="font-extrabold text-lg tracking-tight">
                            {isDragActive ? "Solte agora para enviar!" : "Envie referências visuais"}
                        </p>
                        <p className="text-sm text-muted-foreground font-medium max-w-[280px]">
                            Arraste fotos ou PDFs que exemplifiquem o que você precisa.
                        </p>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-background px-3 py-1 rounded-full border border-border/50">
                            Máx {maxFiles} arquivos
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-background px-3 py-1 rounded-full border border-border/50">
                            {maxSizeMB}MB por arquivo
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-4 rounded-2xl bg-destructive/10 text-destructive text-sm font-bold border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            {files.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {files.map((file, index) => (
                        <div
                            key={`${file.name}-${index}`}
                            className="group flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-background/50 hover:border-primary/30 hover:bg-primary/[0.02] transition-all"
                        >
                            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                                {file.type.includes('image') ? (
                                    <ImageIcon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                ) : (
                                    <FileText className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate pr-2">{file.name}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">{formatSize(file.size)}</p>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(index);
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
