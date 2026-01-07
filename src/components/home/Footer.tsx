import React from 'react';
import { BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-primary rounded-lg text-white">
            <BookOpen size={20} />
          </div>
          <span className="text-xl font-bold text-foreground">Kadernim</span>
        </div>
        <p className="text-muted-foreground text-center text-sm max-w-sm mb-6">
          Devolvendo o tempo livre que a professora merece, um material de cada vez.
        </p>
        <div className="text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} Kadernim. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};