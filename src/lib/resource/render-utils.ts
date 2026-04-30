/**
 * Simple HTML escaping to prevent XSS and malformed HTML when rendering components.
 */
export function escapeHtml(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escapes strings for use in HTML attributes.
 */
export function escapeAttr(str: string | undefined | null): string {
  if (!str) return '';
  return str.replace(/"/g, '&quot;');
}

export interface ComponentShellProps {
  id: string;
  type: string;
  content: string;
  className?: string;
  layoutRole?: 'question' | 'content' | 'structure' | 'enrichment';
  canShrink?: boolean;
  canSplit?: boolean;
  extraAttrs?: Record<string, string>;
}

/**
 * Wraps a component's HTML with metadata attributes required for the 
 * Adaptive Composition Engine.
 * 
 * IMPORTANT: It ALWAYS wraps the content in a single DIV to ensure 
 * CSS selectors (like .resource-page > .pg-header) work correctly even 
 * when the component content consists of multiple sibling tags.
 */
export function componentShell({
  id,
  type,
  content,
  className = '',
  layoutRole,
  canShrink,
  canSplit,
  extraAttrs = {},
}: ComponentShellProps): string {
  const attrs = [
    `data-component-id="${escapeAttr(id)}"`,
    `data-component-type="${escapeAttr(type)}"`,
    `class="component-wrapper ${className}"`,
  ];

  if (layoutRole) attrs.push(`data-layout-role="${layoutRole}"`);
  if (canShrink !== undefined) attrs.push(`data-can-shrink="${canShrink}"`);
  if (canSplit !== undefined) attrs.push(`data-can-split="${canSplit}"`);

  Object.entries(extraAttrs).forEach(([key, value]) => {
    attrs.push(`${key}="${escapeAttr(value)}"`);
  });

  // Using a clean wrapper div to guarantee hierarchy
  return `<div ${attrs.join(' ')}>\n${content.trim()}\n</div>`;
}
