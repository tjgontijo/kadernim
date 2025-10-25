export const UserRole = {
  user: 'user',
  subscriber: 'subscriber', 
  admin: 'admin'
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Função helper para validar se um valor é um UserRole válido
export function isValidUserRole(value: string): value is UserRoleType {
  return Object.values(UserRole).includes(value as UserRoleType);
}

// Array com todos os valores válidos para facilitar validações
export const USER_ROLE_VALUES = Object.values(UserRole) as UserRoleType[];