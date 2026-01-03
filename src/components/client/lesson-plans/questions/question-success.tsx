'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, FileText, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuestionSuccessProps {
  planId: string;
  title: string;
  onView: () => void;
  onDownload: (format: 'docx' | 'pdf') => void;
  onClose: () => void;
}

/**
 * Question: Sucesso
 *
 * Exibido após plano ser gerado com sucesso
 */
export function QuestionSuccess({
  planId,
  title,
  onView,
  onDownload,
  onClose,
}: QuestionSuccessProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-12 px-6 max-w-md mx-auto">
      {/* Ícone de sucesso animado */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
        }}
      >
        <div className="relative">
          <div className="p-6 bg-green-500/10 rounded-full">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute inset-0 bg-green-500/20 rounded-full"
          />
        </div>
      </motion.div>

      {/* Título */}
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Plano criado com sucesso!</h3>
        <p className="text-sm text-muted-foreground">
          Seu plano de aula está pronto para uso
        </p>
      </div>

      {/* Info do plano */}
      <div className="w-full p-4 rounded-xl border bg-card">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold line-clamp-2">{title}</p>
            <p className="text-xs text-muted-foreground mt-1">ID: {planId.substring(0, 8)}</p>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="w-full flex flex-col gap-2">
        <Button onClick={onView} size="lg" className="w-full">
          <Eye className="h-5 w-5 mr-2" />
          Visualizar Plano
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => onDownload('docx')}
            variant="outline"
            size="default"
          >
            <Download className="h-4 w-4 mr-2" />
            Word
          </Button>
          <Button
            onClick={() => onDownload('pdf')}
            variant="outline"
            size="default"
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>

        <Button onClick={onClose} variant="ghost" size="sm" className="mt-2">
          Criar Outro Plano
        </Button>
      </div>
    </div>
  );
}
