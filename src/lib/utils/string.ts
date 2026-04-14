/**
 * Converte uma string de busca em uma expressão regular (Regex) para uso
 * no PostgreSQL (~* operator) que ignora acentos, sem precisar da extensão unaccent.
 * O operador ~* já é case-insensitive.
 */
export function buildAccentRegex(str: string): string {
  if (!str) return ''
  
  return str
    // Escapa caracteres especiais de regex
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Mapeia letras simples para grupos contendo a letra e suas variações acentuadas
    .replace(/[aáàãâäAÁÀÃÂÄ]/g, '[aáàãâäAÁÀÃÂÄ]')
    .replace(/[eéèêëEÉÈÊË]/g, '[eéèêëEÉÈÊË]')
    .replace(/[iíìîïIÍÌÎÏ]/g, '[iíìîïIÍÌÎÏ]')
    .replace(/[oóòõôöOÓÒÕÔÖ]/g, '[oóòõôöOÓÒÕÔÖ]')
    .replace(/[uúùûüUÚÙÛÜ]/g, '[uúùûüUÚÙÛÜ]')
    .replace(/[cçCÇ]/g, '[cçCÇ]')
}
