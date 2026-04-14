import Image from 'next/image';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center">
        <div className="flex items-center mb-4">
          <Image
            src="/images/logo_transparent_crop.png"
            alt="Kadernim"
            width={140}
            height={32}
            className="h-8 w-auto object-contain"
          />
        </div>
        <p className="text-muted-foreground text-center text-sm max-w-sm mb-6">
          Devolvendo o tempo livre que o professor merece, um material de cada vez.
        </p>
        <div className="text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} Kadernim. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};