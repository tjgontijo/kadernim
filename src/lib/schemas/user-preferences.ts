import { z } from 'zod';

/**
 * Schema Zod para preferências do usuário
 */
export const userPreferencesSchema = z.object({
  // Aparência
  theme: z.enum(['light', 'dark', 'system']).optional().default('system'),
  
  // Notificações
  pushNotifications: z.boolean().optional().default(true),
  emailNotifications: z.boolean().optional().default(true),
  
  // Futuras preferências podem ser adicionadas aqui
  // Ex: language: z.string().optional(),
  // Ex: timezone: z.string().optional(),
});

/**
 * Tipo inferido do schema
 */
export type UserPreferences = z.infer<typeof userPreferencesSchema>;

/**
 * Valores padrão para preferências
 */
export const defaultPreferences: UserPreferences = {
  theme: 'system',
  pushNotifications: true,
  emailNotifications: true,
};

/**
 * Valida e mescla preferências do banco com valores padrão
 */
export function parsePreferences(data: unknown): UserPreferences {
  try {
    // Se for string JSON, faz parse
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    
    // Valida com Zod e retorna com defaults
    return userPreferencesSchema.parse(parsed || {});
  } catch (error) {
    // Se falhar, retorna defaults
    console.error('Erro ao parsear preferências:', error);
    return defaultPreferences;
  }
}

/**
 * Schema para atualização parcial de preferências
 */
export const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  pushNotifications: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
}).strict(); // Não permite campos extras

export type UpdatePreferences = z.infer<typeof updatePreferencesSchema>;
