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

import { Zap } from 'lucide-react';

export function QuestionSuccess({
  planId,
  title,
  onView,
  onDownload,
  onClose,
}: QuestionSuccessProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-10 py-12 px-6 max-w-md mx-auto h-full text-center">
      {/* Ícone de sucesso explosivo */}
      <div className="relative">
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
          className="p-10 bg-green-500 rounded-[40px] relative z-10 shadow-[0_20px_50px_rgba(34,197,94,0.3)]"
        >
          <CheckCircle2 className="h-20 w-20 text-white" />
        </motion.div>

        {/* Efeito de brilho externo */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-green-400 blur-3xl opacity-20 -z-0 rounded-full"
        />

        {/* Partículas de celebração (simuladas com círculos) */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0.5],
              x: Math.cos(i * 60 * Math.PI / 180) * 80,
              y: Math.sin(i * 60 * Math.PI / 180) * 80,
            }}
            transition={{ duration: 1, delay: 0.2, repeat: Infinity, repeatDelay: 1 }}
            className="absolute top-1/2 left-1/2 w-3 h-3 bg-green-400 rounded-full"
          />
        ))}
      </div>

      {/* Título e Comemoração */}
      <div className="space-y-3">
        <h2 className="text-4xl font-black leading-tight">Incrível!<br />Sua aula está pronta.</h2>
        <p className="text-muted-foreground font-semibold px-4">
          Tudo o que você precisa para uma aula memorável foi gerada com perfeição.
        </p>
      </div>

      {/* Cartão do Plano */}
      <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        <div className="p-6 rounded-[32px] border-2 border-border/10 bg-card/50 backdrop-blur-sm text-left relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FileText className="h-12 w-12" />
          </div>
          <div className="relative z-10 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Plano de Aula</p>
            <p className="text-lg font-bold leading-snug line-clamp-2">{title}</p>
            <p className="text-[11px] font-medium text-muted-foreground">ID: {planId.substring(0, 8)}</p>
          </div>
        </div>

        {/* Ações Principais */}
        <div className="grid gap-3 pt-2">
          <Button
            onClick={onView}
            size="lg"
            className="h-16 rounded-2xl text-base font-black gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all"
          >
            <Eye className="h-5 w-5" />
            Abrir Material Completo
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => onDownload('docx')}
              variant="outline"
              className="h-14 rounded-2xl font-bold gap-2 border-2"
            >
              <Download className="h-4 w-4" />
              Word
            </Button>
            <Button
              onClick={() => onDownload('pdf')}
              variant="outline"
              className="h-14 rounded-2xl font-bold gap-2 border-2"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>

          <Button
            onClick={onClose}
            variant="ghost"
            className="h-12 rounded-xl font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary gap-2"
          >
            <Zap className="h-3 w-3" />
            Criar Novo Plano
          </Button>
        </div>
      </div>
    </div>
  );
}
