import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

export interface ConnectionWebProps {
  id: string
  center: string
  connections: Array<{ item: string; label: string }>
}

export function connectionWeb(p: ConnectionWebProps): string {
  const connections = p.connections.map((connection) => `
    <div class="web-connection">
      <div class="web-connection-item">${escapeHtml(connection.item)}</div>
      <div class="web-connection-label">${escapeHtml(connection.label)}</div>
    </div>`).join('')

  const content = `
  <div class="web-center">${escapeHtml(p.center)}</div>
  <div class="web-connections">${connections}</div>`

  return componentShell({
    id: p.id,
    type: 'connection_web',
    content,
    className: 'connection-web',
    layoutRole: 'content',
  })
}
