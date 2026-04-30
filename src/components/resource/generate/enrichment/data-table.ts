import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

export interface DataTableProps {
  id: string
  headers: string[]
  rows: string[][]
}

export function dataTable(p: DataTableProps): string {
  const head = p.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')
  const body = p.rows.map((row) => `
    <tr>
      ${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}
    </tr>`).join('')

  const content = `
  <thead><tr>${head}</tr></thead>
  <tbody>${body}</tbody>`

  return componentShell({
    id: p.id,
    type: 'data_table',
    content: `<table class="data-table-inner">${content}</table>`,
    className: 'data-table',
    layoutRole: 'enrichment',
  })
}
