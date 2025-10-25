import { PrismaClient } from '@prisma/client';
import { usersData } from './data-users';
import { auth } from '@/lib/auth/auth';

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

        await (auth.api.signUpEmail as unknown as (params: {body: Record<string, unknown>}) => Promise<unknown>)({
          body: {
            name: userData.name,
            email: userData.email,
            password: userData.password,
            whatsapp: userData.whatsapp
          }
        });
        
        await prisma.user.update({
          where: { email: userData.email },
          data: { 
            role: userData.role,
            whatsapp: userData.whatsapp,
            emailVerified: true
          }
        });
        
        console.log(`Usuário criado: ${userData.name} (${userData.email}) com role ${userData.role || 'user'}`);
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
