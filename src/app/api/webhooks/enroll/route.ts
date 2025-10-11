import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth/auth";
import { z } from "zod";

// Criando uma instância do Prisma
const prisma = new PrismaClient();

// Chave de API para segurança
const API_KEY = process.env.WEBHOOK_API_KEY || "kadernim_webhook_secret_key";

/**
 * Gera uma senha temporária aleatória com requisitos de segurança
 */
function generateTemporaryPassword(): string {
  // Gera uma senha que atende aos requisitos de segurança do Better Auth
  // Pelo menos uma letra maiúscula, uma minúscula e um número
  const randomString = Math.random().toString(36).slice(-6);
  const upperCase = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const number = Math.floor(Math.random() * 10).toString();
  
  return `${upperCase}${randomString}${number}`;
}

/**
 * Schema Zod para validar o payload recebido
 */
const enrollmentSchema = z.object({
  store: z.string().min(1, "Loja é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  resources: z.array(z.string().min(1)).min(1, "Pelo menos um recurso deve ser fornecido"),
  grantedAt: z.string().datetime().optional().describe("Data de início do acesso"),
  expiresAt: z.string().datetime().nullable().optional().describe("Data de expiração do acesso (null = vitalício)"),
  isActive: z.boolean().optional().default(true).describe("Se o acesso está ativo")
});

/**
 * Processa a matrícula de um usuário em recursos
 */
export async function POST(request: Request) {
  try {
    // Verificar a chave de API para segurança
    const apiKey = request.headers.get("x-api-key");
    if (apiKey !== API_KEY) {
      console.error("Chave de API inválida");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Obter o corpo da requisição
    const body = await request.json();
    
    // Validar payload com Zod
    const result = enrollmentSchema.safeParse(body);
    
    if (!result.success) {
      const formattedErrors = result.error.format();
      return NextResponse.json({ 
        error: "Payload inválido", 
        details: formattedErrors 
      }, { status: 400 });
    }
    
    const payload = result.data;
    
    // Verificar se o usuário já existe ou criar um novo
    let user = await prisma.user.findUnique({
      where: { email: payload.email }
    });
    
    if (!user) {
      // Gerar uma senha temporária
      const temporaryPassword = generateTemporaryPassword();
      
      // Criar um novo usuário usando Better Auth
      const response = await auth.api.signUpEmail({
        body: {
          name: payload.name,
          email: payload.email,
          password: temporaryPassword
        }
      });
      
      if (!response) {
        throw new Error('Falha ao criar usuário');
      }
      
      // Buscar o usuário criado
      user = await prisma.user.findUnique({
        where: { email: payload.email }
      });
      
      if (!user) {
        throw new Error('Usuário não encontrado após criação');
      }
      
      // Atualizar campos adicionais
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true, // Marcar email como verificado
          whatsapp: payload.phone
        }
      });
      
      console.log(`Novo usuário criado: ${user.id}`);
    }
    
    // Processar cada recurso
    for (const resourceId of payload.resources) {
      // Verificar se o recurso existe
      const resource = await prisma.resource.findUnique({
        where: { id: resourceId }
      });
      
      if (!resource) {
        console.error(`Recurso não encontrado: ${resourceId}`);
        continue;
      }
      
      // Preparar dados de acesso com base no payload
      const grantedAt = payload.grantedAt ? new Date(payload.grantedAt) : new Date();
      const expiresAt = payload.expiresAt ? new Date(payload.expiresAt) : null;
      const isActive = payload.isActive ?? true;
      
      // Conceder acesso ao recurso
      await prisma.userResourceAccess.upsert({
        where: {
          userId_resourceId: {
            userId: user.id,
            resourceId: resourceId
          }
        },
        update: {
          grantedAt,
          expiresAt,
          isActive
        },
        create: {
          userId: user.id,
          resourceId: resourceId,
          grantedAt,
          expiresAt,
          isActive,
          metadata: {
            enrolledAt: grantedAt.toISOString(),
            enrollmentSource: 'api',
            store: payload.store
          }
        }
      });
      
      console.log(`Acesso concedido ao recurso ${resourceId} para o usuário ${user.id}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao processar matrícula:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
