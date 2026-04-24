/**
 * cover-template.ts
 * Gerador de HTML estático para capa de material — sem Next.js, sem servidor.
 * Todas as imagens externas são passadas já resolvidas pelo chamador (como URLs ou data: URIs).
 * Inspirado na arquitetura do carrosseis/src/templates.
 */

export type CoverLayout = 'booklet' | 'fan';

export interface CoverTemplateData {
  layout: CoverLayout;
  bgSrc: string;            // Caminho absoluto (file:///...) ou URL do background
  images: string[];         // URLs das páginas do material (até 3 para fan, 1 para booklet)
}

// Espiral em SVG puro — muito mais confiável que CSS no headless
function spiralSvg(): string {
  const parts: string[] = [];

  const count = 40;
  const startY = 12;
  const endY = 562;
  const step = (endY - startY) / (count - 1);

  const holeX = 62;
  const outerX = 16;

  const rand = (i: number, amp: number) => {
    const x = Math.sin(i * 12.9898) * 43758.5453;
    return (x - Math.floor(x) - 0.5) * amp * 2;
  };

  for (let i = 0; i < count; i++) {
    const cy = startY + i * step;

    const jitterX = rand(i + 10, 0.45);
    const jitterY = rand(i + 20, 0.65);
    const r = 4.15 + rand(i + 30, 0.18);

    const x = holeX + jitterX;
    const y = cy + jitterY;

    // Furo por cima de tudo, escondendo a entrada do fio
    parts.push(`
      <g transform="translate(${x}, ${y})">
        <circle r="${r + 1.1}" fill="rgba(0,0,0,0.10)" filter="url(#blur2)" />
        <circle r="${r}" fill="url(#holeDepth)" />
        <circle cx="-1.2" cy="-1.2" r="${r * 0.55}" fill="rgba(255,255,255,0.10)" />
      </g>
    `);

    if (i < count - 1) {
      const nextCy = startY + (i + 1) * step;

      const nextX = holeX + rand(i + 11, 0.45);
      const nextY = nextCy + rand(i + 21, 0.65);

      const bowX = outerX + rand(i + 40, 2.8);

      const c1x = bowX + rand(i + 50, 1.8);
      const c2x = bowX + rand(i + 60, 1.8);

      const c1y = y + step * (0.26 + rand(i + 70, 0.035));
      const c2y = y + step * (0.74 + rand(i + 80, 0.035));

      const strokeW = 2.55 + rand(i + 90, 0.16);

      // IMPORTANTE:
      // Agora o aro frontal só vai da área externa até a borda do furo.
      // Ele NÃO atravessa visualmente o furo nem continua por cima da folha.
      const startVisibleX = x - r * 0.75;
      const endVisibleX = nextX - r * 0.75;

      // sombra curta, apenas da parte visível
      parts.push(`
        <path d="
          M ${startVisibleX + 1.2} ${y + 1.9}
          C ${c1x + 2.2} ${c1y + 1.8},
            ${c2x + 2.2} ${c2y + 1.8},
            ${endVisibleX + 1.2} ${nextY + 1.9}
        "
        stroke="rgba(0,0,0,0.17)"
        stroke-width="${strokeW}"
        fill="none"
        filter="url(#blur2)" />
      `);

      // fio frontal visível
      parts.push(`
        <path d="
          M ${startVisibleX} ${y}
          C ${c1x} ${c1y},
            ${c2x} ${c2y},
            ${endVisibleX} ${nextY}
        "
        stroke="url(#metalGrad)"
        stroke-width="${strokeW}"
        stroke-linecap="round"
        fill="none"
        filter="url(#shadow1)" />
      `);

      // brilho apenas na parte frontal
      parts.push(`
        <path d="
          M ${startVisibleX - 1.7} ${y - 0.4}
          C ${c1x + 1.2} ${c1y - 0.5},
            ${c2x + 1.2} ${c2y - 0.5},
            ${endVisibleX - 1.7} ${nextY - 0.4}
        "
        stroke="rgba(255,255,255,${0.22 + Math.abs(rand(i + 100, 0.08))})"
        stroke-width="0.65"
        stroke-linecap="round"
        fill="none" />
      `);

      // pequena sugestão do fio entrando no furo, mas sem atravessar a bolinha
      parts.push(`
        <path d="
          M ${x - r * 1.15} ${y}
          Q ${x - r * 0.55} ${y - 0.25},
            ${x - r * 0.15} ${y - 0.1}
        "
        stroke="rgba(70,70,70,0.45)"
        stroke-width="${strokeW * 0.55}"
        stroke-linecap="round"
        fill="none" />
      `);
    }
  }

  return parts.join("\n");
}

export function generateCoverHtml(data: CoverTemplateData): string {
  const { layout, bgSrc, images } = data;

  // Garante 3 imagens para o fan
  const fanImages = [...images];
  while (fanImages.length < 3) fanImages.push(fanImages[0] || '');

  const bookletHtml = `
    <!-- Sombra de contato principal da apostila na mesa -->
    <div style="
      position:absolute; top:50%; left:50%;
      transform:translate(-50%, 270px) rotate(-1deg);
      width:416px; height:24px;
      background:rgba(0,0,0,0.5);
      filter:blur(10px);
      border-radius:50%;
      z-index:9;
    "></div>
    <!-- Sombra projetada suave -->
    <div style="
      position:absolute; top:50%; left:50%;
      transform:translate(-46%, 292px) rotate(-1deg);
      width:440px; height:80px;
      background:rgba(0,0,0,0.18);
      filter:blur(35px);
      border-radius:50%;
      z-index:8;
    "></div>

    <!-- Página traseira 2 -->
    <div style="
      position:absolute; top:50%; left:50%;
      transform:translate(-50%,-50%) rotate(0.8deg) translate(7px, 9px);
      width:407px; height:574px;
      background:#e8e8e8; border-radius:3px;
      box-shadow:0 2px 8px rgba(0,0,0,0.1);
      z-index:11;
    "></div>

    <!-- Página traseira 1 -->
    <div style="
      position:absolute; top:50%; left:50%;
      transform:translate(-50%,-50%) rotate(0.3deg) translate(4px, 5px);
      width:407px; height:574px;
      background:#f0f0f0; border-radius:3px;
      box-shadow:0 2px 8px rgba(0,0,0,0.08);
      z-index:12;
    "></div>

    <!-- Capa principal -->
    <div style="
      position:absolute; top:50%; left:50%;
      transform:translate(-50%,-50%) rotate(-1deg);
      width:407px; height:574px;
      border-radius:3px; overflow:hidden;
      border:1px solid rgba(0,0,0,0.08);
      box-shadow:0 1px 3px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.12), 0 20px 50px rgba(0,0,0,0.1);
      z-index:20;
    ">
      <img src="${fanImages[0]}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
    </div>

    <!-- Espiral SVG Helicoidal -->
    <svg style="
      position:absolute; top:50%; left:50%;
      transform:translate(-50%,-50%) rotate(-1deg) translateX(-203px);
      width:80px; height:574px;
      z-index:30; overflow:visible;
    " viewBox="0 0 80 574">
      <defs>
        <filter id="blur2"><feGaussianBlur stdDeviation="2"/></filter>
        <filter id="shadow1" x="-20%" y="-50%" width="140%" height="200%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1" flood-opacity="0.3"/>
        </filter>
        
        <!-- Gradiente Metálico "Cilíndrico" -->
        <linearGradient id="metalGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#444"/>
          <stop offset="35%" stop-color="#bbb"/>
          <stop offset="50%" stop-color="#eee"/>
          <stop offset="65%" stop-color="#bbb"/>
          <stop offset="100%" stop-color="#444"/>
        </linearGradient>

        <radialGradient id="holeDepth" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#111"/>
          <stop offset="70%" stop-color="#2a2a2a"/>
          <stop offset="100%" stop-color="#3a3a3a"/>
        </radialGradient>
      </defs>
      ${spiralSvg()}
    </svg>
  `;

  const fanHtml = `
    <!-- Sombra coletiva de contato (borda inferior do grupo) -->
    <div style="
      position:absolute; bottom:122px; left:50%;
      transform:translateX(-50%);
      width:475px; height:22px;
      background:rgba(0,0,0,0.45);
      filter:blur(10px);
      border-radius:50%;
      z-index:9;
    "></div>
    <div style="
      position:absolute; bottom:92px; left:50%;
      transform:translateX(-50%);
      width:518px; height:70px;
      background:rgba(0,0,0,0.15);
      filter:blur(35px);
      border-radius:50%;
      z-index:8;
    "></div>

    <!-- Folha 1: fundo esquerda -->
    <div style="
      position:absolute; top:50%; left:50%;
      transform:translate(-50%,-50%) rotate(-12deg) translate(-98px, 10px);
      width:351px; height:495px;
      border-radius:3px; overflow:hidden;
      border:1px solid rgba(0,0,0,0.1);
      box-shadow:0 4px 0 0 rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15);
      z-index:11;
    ">
      <img src="${fanImages[2]}" style="width:100%;height:100%;object-fit:cover;display:block;opacity:0.9;"/>
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.06);"></div>
    </div>

    <!-- Folha 2: direita -->
    <div style="
      position:absolute; top:50%; left:50%;
      transform:translate(-50%,-50%) rotate(8deg) translate(86px, -10px);
      width:351px; height:495px;
      border-radius:3px; overflow:hidden;
      border:1px solid rgba(0,0,0,0.1);
      box-shadow:0 4px 0 0 rgba(0,0,0,0.2), 0 12px 36px rgba(0,0,0,0.18);
      z-index:12;
    ">
      <img src="${fanImages[1]}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.02);"></div>
    </div>

    <!-- Folha 3: frente centro -->
    <div style="
      position:absolute; top:50%; left:50%;
      transform:translate(-50%,-50%) rotate(-2deg) translateY(15px);
      width:351px; height:495px;
      border-radius:3px; overflow:hidden;
      border:1px solid rgba(200,200,200,0.6);
      box-shadow:0 4px 0 0 rgba(0,0,0,0.3), 0 20px 50px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.15);
      z-index:20;
    ">
      <img src="${fanImages[0]}" style="width:100%;height:100%;object-fit:cover;display:block;"/>
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:rgba(255,255,255,0.6);"></div>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 800px;
      height: 800px;
      overflow: hidden;
      background: #f8f8f8;
    }
    #cover {
      width: 800px;
      height: 800px;
      position: relative;
      overflow: hidden;
    }
    #bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  </style>
</head>
<body>
  <div id="cover">
    <img id="bg" src="${bgSrc}" alt=""/>
    ${layout === 'booklet' ? bookletHtml : fanHtml}
  </div>
</body>
</html>`;
}
