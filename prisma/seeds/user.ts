import { PrismaClient } from "@prisma/client";
import { auth } from "../../src/lib/auth/auth";

const userData = [
    {
        name: "Thiago Gontijo",
        email: "tjgontijo@gmail.com",
        password: "Thi##123",
        role: "admin"
    }
];

export async function seedUsers(prisma: PrismaClient) {
    console.log('🌱 Populando usuários...');
    
    for (const user of userData) {
        // Criar o usuário
        const response = await auth.api.signUpEmail({
            body: {
                name: user.name,
                email: user.email,
                password: user.password
            }
        });

        // Atualizar o role para admin
        if (response) {
            await prisma.user.update({
                where: { email: user.email },
                data: { 
                    role: user.role,
                    emailVerified: true // Marcar email como verificado
                }
            });
            console.log(`✅ Usuário ${user.email} criado como ${user.role}`);
        }
    }
}