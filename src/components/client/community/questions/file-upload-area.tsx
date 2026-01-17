'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/index';
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
    accept = ['.png', '.jpg', '.jpeg', '.pdf']
}: FileUploadAreaProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const selectedFiles = Array.from(e.target.files || []);

        if (selectedFiles.length === 0) return;

        // Check total count
        if (files.length + selectedFiles.length > maxFiles) {
            setError(`Você pode enviar no máximo ${maxFiles} arquivos.`);
            return;
        }

        // Check sizes
        const oversizedFiles = selectedFiles.filter(file => file.size > maxSizeMB * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            setError(`Um ou mais arquivos excedem o limite de ${maxSizeMB}MB.`);
            return;
        }

        onFilesChange([...files, ...selectedFiles]);

        // Reset input so the same file can be selected again if removed
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

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
        <div className="space-y-6">
            {/* Simple Upload Button */}
            <div className="flex flex-col items-center justify-center py-6">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={accept.join(',')}
                    multiple
                    className="hidden"
                />

                <Button
                    type="button"
                    variant="outline"
                    disabled={files.length >= maxFiles}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        "h-16 px-8 rounded-2xl border-2 border-dashed gap-3 font-black text-base transition-all",
                        "hover:border-primary hover:bg-primary/5 hover:text-primary active:scale-95",
                        files.length >= maxFiles && "opacity-50 grayscale cursor-not-allowed"
                    )}
                >
                    <Upload className="h-5 w-5" />
                    {files.length === 0 ? "Adicionar Arquivos de Referência" : "Adicionar Mais Arquivos"}
                </Button>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-4 rounded-2xl bg-destructive/10 text-destructive text-sm font-bold border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* File Listing */}
            {files.length > 0 && (
                <div className="grid grid-cols-1 gap-3">
                    {files.map((file, index) => (
                        <div
                            key={`${file.name}-${index}`}
                            className="group flex items-center gap-4 p-4 rounded-2xl border-2 border-border/40 bg-background hover:border-primary/30 hover:bg-primary/[0.02] transition-all"
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
                                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                onClick={() => removeFile(index)}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
