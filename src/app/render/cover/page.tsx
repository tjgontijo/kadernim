'use client';

import { useSearchParams } from 'next/navigation';
import { ResourceCoverTemplate } from '@/components/dashboard/resources/cover-generator/ResourceCoverTemplate';
import { Suspense } from 'react';

function CoverRenderContent() {
  const searchParams = useSearchParams();
  
  // Extrai dados da query string
  const title = searchParams.get('title') || 'Título do Material';
  const subject = searchParams.get('subject') || 'Geral';
  const subjectColor = searchParams.get('color') || '#D97757';
  const grade = searchParams.get('grade') || '';
  const internalPageUrl = searchParams.get('image');
  const backgroundImageBase64 = searchParams.get('bgBase64') || undefined;
  const layout = (searchParams.get('layout') as 'booklet' | 'fan') || 'booklet';
  const images = searchParams.get('images')?.split(',') || [];

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-10">
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;700&family=Caveat:wght@400;700&display=swap" rel="stylesheet" />
      
      <div className="bg-white shadow-2xl">
        <ResourceCoverTemplate
          title={title}
          subject={subject}
          subjectColor={subjectColor}
          grade={grade}
          internalPageUrl={internalPageUrl}
          backgroundImageBase64={backgroundImageBase64}
          layout={layout}
          images={images}
        />
      </div>
      
      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          width: 800px;
          height: 800px;
          overflow: hidden;
          background: #ffffff;
        }

        /* Bloqueio ULTRAGRESSIVO de qualquer elemento de dev, portal ou overlay */
        #__next-build-watcher, 
        #vercel-live-feedback,
        [data-vercel-live-feedback],
        .nextjs-static-indicator,
        [name="nextjs-portal"],
        [id^="__next"],
        nextjs-portal { 
          display: none !important; 
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          z-index: -1000 !important;
        }

        /* Esconder especificamente o botão N do Next.js se ele estiver em um portal */
        div[style*="z-index: 9999"] {
          display: none !important;
        }
      `}</style>
    </div>
  );
}

export default function CoverRenderPage() {
  return (
    <Suspense fallback={<div>Carregando motor de renderização...</div>}>
      <CoverRenderContent />
    </Suspense>
  );
}
