/**
 * Máscara para WhatsApp no formato brasileiro
 * Usuário digita: (11) 98888-8888
 * Armazena: 556182493200 (com 55 + sem espaços + sem o nono dígito)
 */

/**
 * Aplica máscara visual no input (sem o código do país)
 * @param value - Valor do input
 * @returns Valor formatado para exibição: (11) 98888-8888
 */
export function applyWhatsAppMask(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos (DDD + 9 dígitos)
  const limited = numbers.slice(0, 11);
  
  // Aplica a máscara
  if (limited.length <= 2) {
    return limited.length === 0 ? '' : `(${limited}`; // (11
  } else if (limited.length <= 6) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`; // (11) 8888
  } else {
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`; // (11) 8888-8888
  }
}

/**
 * Remove a máscara e retorna apenas números
 * @param value - Valor formatado
 * @returns Apenas números (formato para salvar no banco)
 */
export function removeWhatsAppMask(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Valida se o WhatsApp está no formato correto
 * @param value - Valor sem máscara (apenas números do DDD + número)
 * @returns true se válido
 */
export function validateWhatsApp(value: string): boolean {
  // Remove qualquer caractere não numérico
  const numbers = value.replace(/\D/g, '');
  
  // Deve ter 10 ou 11 dígitos (DDD + número)
  // 10 dígitos: DDD (2) + número (8) - sem nono dígito
  // 11 dígitos: DDD (2) + número (9) - com nono dígito (será removido)
  if (numbers.length < 10 || numbers.length > 11) {
    return false;
  }
  
  return true;
}

/**
 * Normaliza o WhatsApp para salvar no banco
 * Adiciona 55 no início e remove o nono dígito se presente
 * @param value - Valor com ou sem máscara (DDD + número)
 * @returns Formato normalizado: 556182493200 (12 dígitos com 55)
 */
export function normalizeWhatsApp(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Se tiver 11 dígitos (DDD + 9 + número), remove o nono dígito
  if (numbers.length === 11) {
    // DDD (2) + 9 + número (8)
    // Remove o dígito na posição 2 (índice 2) que é o 9
    const withoutNine = numbers.slice(0, 2) + numbers.slice(3);
    return '55' + withoutNine; // Adiciona 55 no início
  }
  
  // Se tiver 10 dígitos (DDD + número sem o 9), apenas adiciona 55
  if (numbers.length === 10) {
    return '55' + numbers;
  }
  
  // Caso contrário, adiciona 55 no que vier
  return '55' + numbers;
}
