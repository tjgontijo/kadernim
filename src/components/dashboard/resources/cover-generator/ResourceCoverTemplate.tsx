'use client';

import React from 'react';

interface ResourceCoverTemplateProps {
  title: string;
  subject: string;
  subjectColor?: string;
  grade?: string;
  internalPageUrl?: string | null; // Usado no booklet
  images?: string[]; // Usado no layout fan (leque)
  layout?: 'booklet' | 'fan';
  backgroundImageBase64?: string;
  variant?: 'light' | 'dark';
  className?: string;
}

export function ResourceCoverTemplate({
  internalPageUrl,
  images = [],
  layout = 'booklet',
  backgroundImageBase64,
  variant = 'light',
  className = '',
}: ResourceCoverTemplateProps) {
  const bgSrc = backgroundImageBase64 || "/resources/background/v1.png";

  // Se for leque e não tiver array de imagens, usa a principal
  const fanImages = images.length > 0 ? images : [internalPageUrl || ''];
  while (fanImages.length < 3) fanImages.push(fanImages[0]); // Garante 3 folhas

  return (
    <div 
      id="kadernim-cover-capture"
      className={`relative w-[800px] h-[800px] overflow-hidden flex items-center justify-center ${className}`}
      style={{ isolation: 'isolate', background: '#f8f8f8' }}
    >
      {/* BACKGROUND REALISTA */}
      <img 
        id="bg-image"
        src={bgSrc} 
        className="absolute inset-0 w-full h-full object-cover z-0" 
        alt="" 
      />

      {/* Overlay sutil para harmonização */}
      <div className={`absolute inset-0 ${variant === 'dark' ? 'bg-black/10' : 'bg-white/5'} z-10 pointer-events-none`} />
      
      {/* ---------------------------------------------------------
          LAYOUT 1: BOOKLET (Apostila com Espiral)
      --------------------------------------------------------- */}
      {layout === 'booklet' && (
        <div className="relative w-full max-w-[450px] aspect-[1/1.41] z-30 transform -rotate-1 translate-y-2">
          {/* Camadas de papel */}
          <div className="absolute inset-0 bg-white/70 shadow-sm rounded-sm translate-x-2 translate-y-3 rotate-[0.8deg]" />
          <div className="absolute inset-0 bg-white/90 shadow-md rounded-sm translate-x-1 translate-y-1.5 rotate-[0.3deg]" />
          
          <div className="absolute inset-0 bg-white rounded-sm overflow-hidden border border-zinc-200/50 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.08),0_15px_35px_rgba(0,0,0,0.1)]">
            <div className="w-full h-full relative overflow-hidden bg-white">
              <img src={internalPageUrl || ''} className="w-full h-full object-cover" alt="Preview" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-[0.12] pointer-events-none" />
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-white/70 z-10" />
            </div>
          </div>

          {/* Espiral Hiper-Realista */}
          <div className="absolute -left-6 top-8 bottom-8 w-12 z-50 flex flex-col justify-around">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="relative h-4 w-full flex items-center">
                <div className="absolute -left-2 top-1/2 w-8 h-2 bg-black/15 blur-[3px] rounded-full transform -rotate-12 translate-y-2 -z-10" />
                <div className="absolute left-[20px] top-1/2 w-6 h-2.5 bg-black/20 blur-[1.5px] rounded-full transform -rotate-12 translate-y-1 z-10" />
                <div className="absolute left-0 w-10 h-[5px] rounded-full transform -rotate-12 z-40 border-b border-white/10 shadow-[0_2px_4px_rgba(0,0,0,0.5)] overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-600 to-zinc-900" />
                   <div className="absolute inset-x-0 top-[1px] h-[1px] bg-white/20 blur-[0.5px]" />
                </div>
                <div className="absolute left-[30px] w-2.5 h-2.5 rounded-full bg-black/70 shadow-inner z-30" />
              </div>
            ))}
          </div>

          {/* Sombra de Contato na Mesa */}
          <div className="absolute -z-10 inset-0 bg-black/40 blur-[15px] translate-y-8 translate-x-4 rotate-2" />
        </div>
      )}

      {/* ---------------------------------------------------------
          LAYOUT 2: FAN (Três folhas soltas em leque)
      --------------------------------------------------------- */}
      {layout === 'fan' && (
        <div className="relative w-full max-w-[390px] aspect-[1/1.2] z-30 flex items-center justify-center">
          
          {/* Folha 1 (Fundo - Esquerda) */}
          <div className="absolute w-[285px] aspect-[1/1.41] bg-white rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.15)] transform -rotate-[12deg] -translate-x-12 translate-y-2 overflow-hidden border border-zinc-200/40">
            <img src={fanImages[2]} className="w-full h-full object-cover opacity-90" alt="Page 3" />
            <div className="absolute inset-0 bg-black/5" />
          </div>

          {/* Folha 2 (Meio - Direita) */}
          <div className="absolute w-[285px] aspect-[1/1.41] bg-white rounded-sm shadow-[0_15px_40px_rgba(0,0,0,0.2)] transform rotate-[8deg] translate-x-9 -translate-y-2 overflow-hidden border border-zinc-200/40">
            <img src={fanImages[1]} className="w-full h-full object-cover" alt="Page 2" />
            <div className="absolute inset-0 bg-black/[0.02]" />
          </div>

          {/* Folha 3 (Frente - Centro) */}
          <div className="absolute w-[285px] aspect-[1/1.41] bg-white rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.25)] transform -rotate-[2deg] translate-y-3 overflow-hidden border border-zinc-100">
            <img src={fanImages[0]} className="w-full h-full object-cover" alt="Page 1" />
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-white/60 z-10" />
            {/* Textura de papel */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-[0.1] pointer-events-none" />
          </div>

          {/* Sombras de Contato Coletivas */}
          <div className="absolute -z-10 w-[500px] h-32 bg-black/20 blur-[50px] bottom-0 rounded-full" />
        </div>
      )}
    </div>
  );
}
