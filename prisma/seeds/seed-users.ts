import type { PrismaClient } from '../generated/prisma/client';
import { auth } from '@/server/auth/auth';
import { UserRole, type UserRoleType } from '@/types/users/user-role';

const usersData = [
  { name: "Thiago Gontijo", email: "tjgontijo@gmail.com", password: "Thi##123", phone: "5561982482100", role: UserRole.admin },
  { name: "Arilson Souza", email: "arilson@arilsonsouza.com.br", password: "123senha@", phone: "5561992532101", role: UserRole.admin }
]

export async function seedUsers(prisma: PrismaClient) {
  console.log('🌱 Populando usuários...');
  console.log(`Preparando ${usersData.length} usuários...`);

  try {
    for (const userData of usersData) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`Usuário ${userData.email} já existe, pulando...`);
        continue;
      }

      try {
        await (auth.api.signUpEmail as unknown as (params: { body: Record<string, unknown> }) => Promise<unknown>)({
          body: {
            name: userData.name,
            email: userData.email,
            password: userData.password
          }
        });

        await prisma.user.update({
          where: { email: userData.email },
          data: {
            role: userData.role as UserRoleType,
            phone: userData.phone,
            emailVerified: true
          }
        });

        console.log(`Usuário criado: ${userData.name} (${userData.email}) com role ${userData.role}`);
      } catch (signUpError) {
        console.error(`Erro ao criar usuário ${userData.email}:`, signUpError);
      }
    }

    console.log('✅ Usuários populados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao popular usuários:', error);
    throw error;
  }
}
