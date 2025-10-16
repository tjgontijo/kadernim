import { PrismaClient } from '@prisma/client';
import { usersData } from './data-users';
import { auth } from '@/lib/auth/auth';

// Interface para tipagem dos dados de usuário
interface UserData {
  name: string;
  email: string;
  password: string;
  whatsapp: string;
  role: string;
}

export async function seedUsers(prisma: PrismaClient) {
  console.log('🌱 Populando usuários...');
  console.log(`Preparando ${usersData.length} usuários...`);
  
  try {
    // Criar usuários usando better-auth
    for (const userData of usersData) {
      // Verificar se o usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      
      if (existingUser) {
        console.log(`Usuário ${userData.email} já existe, pulando...`);
        continue;
      }

      try {

        const result = await (auth.api.signUpEmail as any)({
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
            whatsapp: userData.whatsapp, // Garantir que whatsapp seja salvo
            emailVerified: true // Marcar como verificado
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
