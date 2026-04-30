export function selfAssessment(props: { title?: string; items: string[] }) {
  const { title = 'Autoavaliação', items } = props
  
  const rowsHtml = items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        <div style="width: 16px; height: 16px; border-radius: 50%; border: 1px solid #ccc; margin: 0 auto;"></div>
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        <div style="width: 16px; height: 16px; border-radius: 50%; border: 1px solid #ccc; margin: 0 auto;"></div>
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        <div style="width: 16px; height: 16px; border-radius: 50%; border: 1px solid #ccc; margin: 0 auto;"></div>
      </td>
    </tr>
  `).join('\n')

  return `
<div class="box box-concept component-wrapper" style="border-color: var(--subject-main); background-color: #fdfdfd;">
  <div class="box-hd">
    <span class="box-icon">✅</span>
    <span class="box-title">${title}</span>
  </div>
  <div class="box-divider"></div>
  <div style="margin-top: 8px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 8px; border-bottom: 2px solid var(--subject-main); width: 70%;">Critério</th>
          <th style="text-align: center; padding: 8px; border-bottom: 2px solid var(--subject-main);">Sim</th>
          <th style="text-align: center; padding: 8px; border-bottom: 2px solid var(--subject-main);">Não</th>
          <th style="text-align: center; padding: 8px; border-bottom: 2px solid var(--subject-main);">Em partes</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  </div>
</div>`
}
