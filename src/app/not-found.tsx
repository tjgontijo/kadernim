import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquareWarning } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-paper p-6 overflow-hidden relative">
      {/* Efeito de grid de pontos (Bullet Journal style) */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--line)_1px,transparent_1px)] bg-[length:24px_24px] opacity-10 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-lg text-center animate-in fade-in zoom-in duration-500">
        
        {/* Código 404 com anotação manual */}
        <div className="relative mb-8 select-none">
          <h1 className="font-display text-[140px] md:text-[180px] font-bold text-line leading-none tracking-tighter opacity-40">
            404
          </h1>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 font-hand text-3xl md:text-4xl text-terracotta whitespace-nowrap drop-shadow-sm">
            página sumiu no caderno...
          </span>
        </div>

        {/* Mensagem */}
        <h2 className="text-display-m mb-4">Algo de errado aconteceu!</h2>
        <p className="text-body-l text-ink-soft mb-10 max-w-[400px]">
          Desculpe, a página que você está procurando não existe ou foi movida. Talvez ela esteja em outro capítulo?
        </p>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button asChild size="lg" className="bg-terracotta hover:bg-terracotta-hover text-white rounded-full px-8 shadow-2">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Voltar para Biblioteca
            </Link>
          </Button>
          
          <Button variant="outline" size="lg" className="rounded-full border-line hover:bg-paper-2 text-ink-soft">
            <MessageSquareWarning className="w-5 h-5 mr-2" />
            Reportar erro
          </Button>
        </div>

        {/* Rodapé decorativo */}
        <div className="mt-16 font-hand text-xl text-ink-mute opacity-50">
          ~ Kadernim: de professora p/ professora
        </div>
      </div>
    </div>
  );
}
