# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: color-audit/color-audit.spec.ts >> Audit Path: /plans >> Theme: DARK >> Accessibility: Global Color Contrast Scan
- Location: tests/color-audit/color-audit.spec.ts:130:9

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 566

- Array []
+ Array [
+   Object {
+     "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
+     "help": "Elements must meet minimum color contrast ratio thresholds",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.11/color-contrast?application=playwright",
+     "id": "color-contrast",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#fdfcfb",
+               "contrastRatio": 1.54,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#d2cdc3",
+               "fontSize": "8.3pt (11px)",
+               "fontWeight": "bold",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 1.54 (foreground color: #d2cdc3, background color: #fdfcfb, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"min-h-screen bg-[#FDFCFB] text-stone-900 selection:bg-brand-3/30 selection:text-brand-1 antialiased font-sans\">",
+                 "target": Array [
+                   ".min-h-screen",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 1.54 (foreground color: #d2cdc3, background color: #fdfcfb, font size: 8.3pt (11px), font weight: bold). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"text-[11px] font-bold text-ink-soft uppercase tracking-widest\">Utilizado por +1.200 Professoras</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".text-\\[11px\\].text-ink-soft.tracking-widest",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#fdfcfb",
+               "contrastRatio": 1.12,
+               "expectedContrastRatio": "3:1",
+               "fgColor": "#f3eee3",
+               "fontSize": "42.0pt (56px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 1.12 (foreground color: #f3eee3, background color: #fdfcfb, font size: 42.0pt (56px), font weight: normal). Expected contrast ratio of 3:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"min-h-screen bg-[#FDFCFB] text-stone-900 selection:bg-brand-3/30 selection:text-brand-1 antialiased font-sans\">",
+                 "target": Array [
+                   ".min-h-screen",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 1.12 (foreground color: #f3eee3, background color: #fdfcfb, font size: 42.0pt (56px), font weight: normal). Expected contrast ratio of 3:1",
+         "html": "<h1 class=\"text-display-l text-ink mb-6 tracking-tight\">Invista na sua <br class=\"hidden sm:block\"><span class=\"text-terracotta\">Tranquilidade</span> Pedagógica.</h1>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           "h1",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#fdfcfb",
+               "contrastRatio": 2.53,
+               "expectedContrastRatio": "3:1",
+               "fgColor": "#e38a67",
+               "fontSize": "42.0pt (56px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.53 (foreground color: #e38a67, background color: #fdfcfb, font size: 42.0pt (56px), font weight: normal). Expected contrast ratio of 3:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"min-h-screen bg-[#FDFCFB] text-stone-900 selection:bg-brand-3/30 selection:text-brand-1 antialiased font-sans\">",
+                 "target": Array [
+                   ".min-h-screen",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.53 (foreground color: #e38a67, background color: #fdfcfb, font size: 42.0pt (56px), font weight: normal). Expected contrast ratio of 3:1",
+         "html": "<span class=\"text-terracotta\">Tranquilidade</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           "h1 > .text-terracotta",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#fdfcfb",
+               "contrastRatio": 1.54,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#d2cdc3",
+               "fontSize": "13.5pt (18px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 1.54 (foreground color: #d2cdc3, background color: #fdfcfb, font size: 13.5pt (18px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"min-h-screen bg-[#FDFCFB] text-stone-900 selection:bg-brand-3/30 selection:text-brand-1 antialiased font-sans\">",
+                 "target": Array [
+                   ".min-h-screen",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 1.54 (foreground color: #d2cdc3, background color: #fdfcfb, font size: 13.5pt (18px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"text-body-l text-ink-soft max-w-2xl mx-auto mb-12\">Chega de perder noites procurando material genérico. Tenha uma biblioteca validada e organizada sempre à mão.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".text-body-l",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#f5f5f4",
+               "contrastRatio": 2.36,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#a6a09b",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "bold",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.36 (foreground color: #a6a09b, background color: #f5f5f4, font size: 10.5pt (14px), font weight: bold). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"relative flex items-center bg-stone-100 rounded-[18px] p-1.5 w-[280px] h-[52px] shadow-inner border border-stone-200/20\">",
+                 "target": Array [
+                   ".rounded-\\[18px\\]",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.36 (foreground color: #a6a09b, background color: #f5f5f4, font size: 10.5pt (14px), font weight: bold). Expected contrast ratio of 4.5:1",
+         "html": "<button class=\"flex-1 relative z-10 h-full flex items-center justify-center text-sm font-bold transition-colors duration-200 text-stone-400 hover:text-stone-600\">Mensal</button>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".hover\\:text-stone-600",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#d1eaf4",
+               "contrastRatio": 3.96,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#1a6dd9",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "bold",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.96 (foreground color: #1a6dd9, background color: #d1eaf4, font size: 10.5pt (14px), font weight: bold). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-[12px] bg-brand-3/20 shadow-sm border border-stone-300/20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] translate-x-full\"></div>",
+                 "target": Array [
+                   ".top-1\\.5",
+                 ],
+               },
+               Object {
+                 "html": "<div class=\"relative flex items-center bg-stone-100 rounded-[18px] p-1.5 w-[280px] h-[52px] shadow-inner border border-stone-200/20\">",
+                 "target": Array [
+                   ".rounded-\\[18px\\]",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.96 (foreground color: #1a6dd9, background color: #d1eaf4, font size: 10.5pt (14px), font weight: bold). Expected contrast ratio of 4.5:1",
+         "html": "<button class=\"flex-1 relative z-10 h-full flex items-center justify-center gap-2 text-sm font-bold transition-colors duration-200 text-brand-1\">Anual<span class=\"text-[9px] font-black px-1.5 py-0.5 rounded-md transition-colors bg-brand-2/10 text-brand-1\">−20%</span></button>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".flex-1.z-10.h-full:nth-child(3)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#c0e1f4",
+               "contrastRatio": 3.61,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#1a6dd9",
+               "fontSize": "6.8pt (9px)",
+               "fontWeight": "bold",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.61 (foreground color: #1a6dd9, background color: #c0e1f4, font size: 6.8pt (9px), font weight: bold). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<span class=\"text-[9px] font-black px-1.5 py-0.5 rounded-md transition-colors bg-brand-2/10 text-brand-1\">−20%</span>",
+                 "target": Array [
+                   ".text-\\[9px\\]",
+                 ],
+               },
+               Object {
+                 "html": "<div class=\"absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-[12px] bg-brand-3/20 shadow-sm border border-stone-300/20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] translate-x-full\"></div>",
+                 "target": Array [
+                   ".top-1\\.5",
+                 ],
+               },
+               Object {
+                 "html": "<div class=\"relative flex items-center bg-stone-100 rounded-[18px] p-1.5 w-[280px] h-[52px] shadow-inner border border-stone-200/20\">",
+                 "target": Array [
+                   ".rounded-\\[18px\\]",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.61 (foreground color: #1a6dd9, background color: #c0e1f4, font size: 6.8pt (9px), font weight: bold). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"text-[9px] font-black px-1.5 py-0.5 rounded-md transition-colors bg-brand-2/10 text-brand-1\">−20%</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".text-\\[9px\\]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#ffffff",
+               "contrastRatio": 2.58,
+               "expectedContrastRatio": "3:1",
+               "fgColor": "#a6a09b",
+               "fontSize": "15.0pt (20px)",
+               "fontWeight": "bold",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.58 (foreground color: #a6a09b, background color: #ffffff, font size: 15.0pt (20px), font weight: bold). Expected contrast ratio of 3:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"bg-white p-10\">",
+                 "target": Array [
+                   ".p-10.bg-white:nth-child(1)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.58 (foreground color: #a6a09b, background color: #ffffff, font size: 15.0pt (20px), font weight: bold). Expected contrast ratio of 3:1",
+         "html": "<h3 class=\"text-xl font-black text-stone-400 uppercase tracking-tight\">Packs de 20k Arquivos</h3>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".mb-8.gap-3.flex > h3",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#ffffff",
+               "contrastRatio": 2.58,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#a6a09b",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "bold",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.58 (foreground color: #a6a09b, background color: #ffffff, font size: 10.5pt (14px), font weight: bold). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"bg-white p-10\">",
+                 "target": Array [
+                   ".p-10.bg-white:nth-child(1)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.58 (foreground color: #a6a09b, background color: #ffffff, font size: 10.5pt (14px), font weight: bold). Expected contrast ratio of 4.5:1",
+         "html": "<li class=\"flex items-center gap-3 text-sm font-bold text-stone-400 line-through decoration-stone-200\"><span class=\"text-lg\">×</span> <!-- -->Volume inflado (arquivos repetidos)</li>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".line-through.decoration-stone-200.text-stone-400:nth-child(1)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#ffffff",
+               "contrastRatio": 2.58,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#a6a09b",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "bold",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.58 (foreground color: #a6a09b, background color: #ffffff, font size: 10.5pt (14px), font weight: bold). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"bg-white p-10\">",
+                 "target": Array [
+                   ".p-10.bg-white:nth-child(1)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.58 (foreground color: #a6a09b, background color: #ffffff, font size: 10.5pt (14px), font weight: bold). Expected contrast ratio of 4.5:1",
+         "html": "<li class=\"flex items-center gap-3 text-sm font-bold text-stone-400 line-through decoration-stone-200\"><span class=\"text-lg\">×</span> <!-- -->Sem curadoria pedagógica</li>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".line-through.decoration-stone-200.text-stone-400:nth-child(2)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#ffffff",
+               "contrastRatio": 2.58,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#a6a09b",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "bold",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.58 (foreground color: #a6a09b, background color: #ffffff, font size: 10.5pt (14px), font weight: bold). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"bg-white p-10\">",
+                 "target": Array [
+                   ".p-10.bg-white:nth-child(1)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.58 (foreground color: #a6a09b, background color: #ffffff, font size: 10.5pt (14px), font weight: bold). Expected contrast ratio of 4.5:1",
+         "html": "<li class=\"flex items-center gap-3 text-sm font-bold text-stone-400 line-through decoration-stone-200\"><span class=\"text-lg\">×</span> <!-- -->Bagunça: difícil de encontrar o tema</li>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".line-through.decoration-stone-200.text-stone-400:nth-child(3)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#ffffff",
+               "contrastRatio": 2.58,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#a6a09b",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "bold",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.58 (foreground color: #a6a09b, background color: #ffffff, font size: 10.5pt (14px), font weight: bold). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"bg-white p-10\">",
+                 "target": Array [
+                   ".p-10.bg-white:nth-child(1)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.58 (foreground color: #a6a09b, background color: #ffffff, font size: 10.5pt (14px), font weight: bold). Expected contrast ratio of 4.5:1",
+         "html": "<li class=\"flex items-center gap-3 text-sm font-bold text-stone-400 line-through decoration-stone-200\"><span class=\"text-lg\">×</span> <!-- -->Comprou, acabou (sem atualizações)</li>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".line-through.decoration-stone-200.text-stone-400:nth-child(4)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#ffffff",
+               "contrastRatio": 2.58,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#a6a09b",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "bold",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.58 (foreground color: #a6a09b, background color: #ffffff, font size: 10.5pt (14px), font weight: bold). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"bg-white p-10\">",
+                 "target": Array [
+                   ".p-10.bg-white:nth-child(1)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.58 (foreground color: #a6a09b, background color: #ffffff, font size: 10.5pt (14px), font weight: bold). Expected contrast ratio of 4.5:1",
+         "html": "<li class=\"flex items-center gap-3 text-sm font-bold text-stone-400 line-through decoration-stone-200\"><span class=\"text-lg\">×</span> <!-- -->Muitas vezes com erros de português</li>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".line-through.decoration-stone-200.text-stone-400:nth-child(5)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#ffffff",
+               "contrastRatio": 2.58,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#a6a09b",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.58 (foreground color: #a6a09b, background color: #ffffff, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<footer class=\"py-12 bg-white border-t border-stone-200/60\">",
+                 "target": Array [
+                   "footer",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.58 (foreground color: #a6a09b, background color: #ffffff, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"text-sm font-medium text-stone-400 max-w-xs text-center md:text-left\">Biblioteca pedagógica completa para professoras da Educação Infantil e Fundamental I.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".max-w-xs",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#ffffff",
+               "contrastRatio": 1.48,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#d6d3d1",
+               "fontSize": "7.5pt (10px)",
+               "fontWeight": "bold",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 1.48 (foreground color: #d6d3d1, background color: #ffffff, font size: 7.5pt (10px), font weight: bold). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<footer class=\"py-12 bg-white border-t border-stone-200/60\">",
+                 "target": Array [
+                   "footer",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 1.48 (foreground color: #d6d3d1, background color: #ffffff, font size: 7.5pt (10px), font weight: bold). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"text-[10px] font-black text-stone-300 uppercase tracking-[0.2em]\">© <!-- -->2026<!-- --> Kadernim. Todos os direitos reservados</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".text-stone-300",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.color",
+       "wcag2aa",
+       "wcag143",
+       "TTv5",
+       "TT13.c",
+       "EN-301-549",
+       "EN-9.1.4.3",
+       "ACT",
+       "RGAAv4",
+       "RGAA-3.2.1",
+     ],
+   },
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - generic [ref=e4]:
        - link "Kadernim" [ref=e5] [cursor=pointer]:
          - /url: /
          - img "Kadernim" [ref=e6]
        - link "Entrar →" [ref=e7] [cursor=pointer]:
          - /url: /login
    - main [ref=e8]:
      - generic [ref=e11]:
        - generic [ref=e12]:
          - img [ref=e13]
          - generic [ref=e16]: Utilizado por +1.200 Professoras
        - heading "Invista na sua Tranquilidade Pedagógica." [level=1] [ref=e17]:
          - text: Invista na sua
          - text: Tranquilidade Pedagógica.
        - paragraph [ref=e18]: Chega de perder noites procurando material genérico. Tenha uma biblioteca validada e organizada sempre à mão.
        - generic [ref=e19]:
          - generic [ref=e20]:
            - button "Mensal" [ref=e22] [cursor=pointer]
            - button "Anual −20%" [ref=e23] [cursor=pointer]:
              - text: Anual
              - generic [ref=e24]: −20%
          - generic [ref=e25]:
            - img [ref=e26]
            - generic [ref=e29]: Assine 12 meses, pague apenas 10
      - generic [ref=e35]:
        - generic [ref=e36]:
          - generic [ref=e37]:
            - img [ref=e38]
            - generic [ref=e41]: Acesso Ilimitado
          - heading "Kadernim Pro" [level=3] [ref=e42]
          - generic [ref=e43]:
            - generic [ref=e44]:
              - generic [ref=e45]: R$
              - generic [ref=e46]: "197"
            - paragraph [ref=e47]: Equivalente a R$ 16,42/mês
        - list [ref=e51]:
          - listitem [ref=e52]:
            - img [ref=e54]
            - text: Biblioteca completa (+248 materiais)
          - listitem [ref=e56]:
            - img [ref=e58]
            - text: Novos materiais toda semana
          - listitem [ref=e60]:
            - img [ref=e62]
            - text: Organizados por série e disciplina
          - listitem [ref=e64]:
            - img [ref=e66]
            - text: PDF pronto para imprimir
          - listitem [ref=e68]:
            - img [ref=e70]
            - text: Validado por professoras atuantes
          - listitem [ref=e72]:
            - img [ref=e74]
            - text: Alinhado à BNCC 2026
        - generic [ref=e76]:
          - link "Começar Agora" [ref=e77] [cursor=pointer]:
            - /url: /checkout?plan=annual
            - generic [ref=e78]:
              - text: Começar Agora
              - img [ref=e79]
          - generic [ref=e81]:
            - generic [ref=e82]:
              - img [ref=e83]
              - generic [ref=e86]: 7 dias de garantia total
            - paragraph [ref=e87]: Cancele quando quiser. Sem multa
      - generic [ref=e90]:
        - generic [ref=e91]:
          - img [ref=e93]
          - generic [ref=e96]: Qualidade Premium
        - generic [ref=e97]:
          - img [ref=e99]
          - generic [ref=e102]: Pagamento Seguro
        - generic [ref=e103]:
          - img [ref=e105]
          - generic [ref=e110]: Atualização Semanal
        - generic [ref=e111]:
          - img [ref=e113]
          - generic [ref=e115]: Feito c/ Amor
      - generic [ref=e117]:
        - generic [ref=e118]:
          - heading "Por que o Kadernim é diferente?" [level=2] [ref=e119]
          - paragraph [ref=e120]: Qualidade curada vs volume aleatório
        - generic [ref=e121]:
          - generic [ref=e122]:
            - generic [ref=e123]:
              - img [ref=e125]
              - heading "Packs de 20k Arquivos" [level=3] [ref=e127]
            - list [ref=e128]:
              - listitem [ref=e129]:
                - generic [ref=e130]: ×
                - text: Volume inflado (arquivos repetidos)
              - listitem [ref=e131]:
                - generic [ref=e132]: ×
                - text: Sem curadoria pedagógica
              - listitem [ref=e133]:
                - generic [ref=e134]: ×
                - text: "Bagunça: difícil de encontrar o tema"
              - listitem [ref=e135]:
                - generic [ref=e136]: ×
                - text: Comprou, acabou (sem atualizações)
              - listitem [ref=e137]:
                - generic [ref=e138]: ×
                - text: Muitas vezes com erros de português
          - generic [ref=e139]:
            - img "Kadernim" [ref=e142]
            - list [ref=e143]:
              - listitem [ref=e144]:
                - img [ref=e145]
                - text: Todos os materiais validados em sala
              - listitem [ref=e147]:
                - img [ref=e148]
                - text: Busca inteligente e organizada por série
              - listitem [ref=e150]:
                - img [ref=e151]
                - text: PDFs de alta qualidade, prontos p/ imprimir
              - listitem [ref=e153]:
                - img [ref=e154]
                - text: Novas atividades reais toda semana
              - listitem [ref=e156]:
                - img [ref=e157]
                - text: Feito por professoras atuantes
      - generic [ref=e161]:
        - heading "Dúvidas Frequentes" [level=2] [ref=e162]
        - generic [ref=e163]:
          - button "Serve para Fundamental II?" [ref=e165] [cursor=pointer]:
            - generic [ref=e166]: Serve para Fundamental II?
            - img [ref=e167]
          - button "Posso imprimir quantas vezes quiser?" [ref=e170] [cursor=pointer]:
            - generic [ref=e171]: Posso imprimir quantas vezes quiser?
            - img [ref=e172]
          - button "Como recebo o acesso?" [ref=e175] [cursor=pointer]:
            - generic [ref=e176]: Como recebo o acesso?
            - img [ref=e177]
          - button "É alinhado à BNCC?" [ref=e180] [cursor=pointer]:
            - generic [ref=e181]: É alinhado à BNCC?
            - img [ref=e182]
    - contentinfo [ref=e184]:
      - generic [ref=e185]:
        - generic [ref=e186]:
          - link "Kadernim" [ref=e187] [cursor=pointer]:
            - /url: /
            - img "Kadernim" [ref=e188]
          - paragraph [ref=e189]: Biblioteca pedagógica completa para professoras da Educação Infantil e Fundamental I.
        - generic [ref=e190]:
          - link "Entrar" [ref=e191] [cursor=pointer]:
            - /url: /login
          - link "Planos" [ref=e192] [cursor=pointer]:
            - /url: /plans
          - link "Termos" [ref=e193] [cursor=pointer]:
            - /url: "#"
      - paragraph [ref=e195]: © 2026 Kadernim. Todos os direitos reservados
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e201] [cursor=pointer]:
    - img [ref=e202]
  - alert [ref=e205]
```

# Test source

```ts
  34  | 
  35  |       el.getBoundingClientRect(); // Force reflow
  36  | 
  37  |       const temp = document.createElement('div');
  38  |       temp.style.visibility = 'hidden';
  39  |       document.body.appendChild(temp);
  40  |       temp.style.setProperty(prop, token);
  41  |       let expectedStr = getComputedStyle(temp).getPropertyValue(prop);
  42  |       
  43  |       if (!expectedStr || expectedStr === 'rgba(0, 0, 0, 0)') {
  44  |         const varName = token.replace(/var\(|\)/g, '').trim();
  45  |         expectedStr = getComputedStyle(document.body).getPropertyValue(varName);
  46  |       }
  47  |       
  48  |       const actualStr = getComputedStyle(el).getPropertyValue(prop);
  49  |       document.body.removeChild(temp);
  50  | 
  51  |       const expected = parseColor(expectedStr);
  52  |       const actual = parseColor(actualStr);
  53  |       
  54  |       if (expected && actual) {
  55  |         // EUCLIDEAN DISTANCE comparison
  56  |         const distance = Math.sqrt(
  57  |           Math.pow(expected.r - actual.r, 2) +
  58  |           Math.pow(expected.g - actual.g, 2) +
  59  |           Math.pow(expected.b - actual.b, 2)
  60  |         );
  61  |         return { match: distance <= 30, actual: actualStr, expected: expectedStr };
  62  |       }
  63  | 
  64  |       const normalize = (s: string) => s.replace(/['"]/g, '').toLowerCase().trim();
  65  |       return { 
  66  |         match: normalize(actualStr) === normalize(expectedStr) || actualStr.includes(expectedStr), 
  67  |         actual: actualStr, 
  68  |         expected: expectedStr 
  69  |       };
  70  |     }, { sel: selector, prop: property, token: tokenVar });
  71  | 
  72  |     if (result.match) return;
  73  |     lastResult = result;
  74  |     await page.waitForTimeout(400); 
  75  |   }
  76  | 
  77  |   throw new Error(`[Consistency Error] ${selector} -> ${property}: expected ${tokenVar} (${lastResult.expected}), but found ${lastResult.actual}`);
  78  | }
  79  | 
  80  | for (const pathStr of PATHS) {
  81  |   test.describe(`Audit Path: ${pathStr}`, () => {
  82  |     // Run all audits for both Light and Dark themes
  83  |     for (const theme of ['light', 'dark']) {
  84  |       test.describe(`Theme: ${theme.toUpperCase()}`, () => {
  85  |         test.beforeEach(async ({ page }) => {
  86  |           test.setTimeout(90000); 
  87  |           await page.setExtraHTTPHeaders({ 'x-audit-bypass': 'true' });
  88  |           await page.goto(pathStr);
  89  |           await page.waitForLoadState('networkidle');
  90  |           await page.waitForTimeout(1000);
  91  |           
  92  |           await page.evaluate((currentTheme) => {
  93  |             document.documentElement.setAttribute('data-audit-mode', 'true');
  94  |             if (currentTheme === 'dark') {
  95  |               document.documentElement.classList.add('dark');
  96  |             } else {
  97  |               document.documentElement.classList.remove('dark');
  98  |             }
  99  |           }, theme);
  100 |         });
  101 | 
  102 |         for (const [roleName, roleDef] of Object.entries(config.roles)) {
  103 |           test(`Design System Audit: ${roleName}`, async ({ page }) => {
  104 |             const def = roleDef as any;
  105 |             const count = await page.locator(def.selector).count();
  106 |             if (count === 0) return;
  107 | 
  108 |             for (const [prop, token] of Object.entries(def.expected)) {
  109 |               await expectStyleToMatchToken(page, def.selector, prop, token as string);
  110 |             }
  111 |           });
  112 | 
  113 |           if (roleDef.states?.hover) {
  114 |             test(`State Audit: ${roleName} (Hover)`, async ({ page }) => {
  115 |               const def = roleDef as any;
  116 |               const button = page.locator(def.selector).filter({ visible: true }).first();
  117 |               if (await button.count() === 0) return;
  118 |               
  119 |               await button.scrollIntoViewIfNeeded();
  120 |               await button.hover({ force: true });
  121 |               await page.waitForTimeout(1000); 
  122 | 
  123 |               for (const [prop, token] of Object.entries(def.states.hover)) {
  124 |                 await expectStyleToMatchToken(page, def.selector, prop, token as string);
  125 |               }
  126 |             });
  127 |           }
  128 |         }
  129 | 
  130 |         test('Accessibility: Global Color Contrast Scan', async ({ page }) => {
  131 |           const accessibilityScanResults = await new AxeBuilder({ page })
  132 |             .withRules(['color-contrast'])
  133 |             .analyze();
> 134 |           expect(accessibilityScanResults.violations).toEqual([]);
      |                                                       ^ Error: expect(received).toEqual(expected) // deep equality
  135 |         });
  136 |       });
  137 |     }
  138 |   });
  139 | }
  140 | 
```