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
  cpf: z.string().optional(),
  whatsapp: z.string().optional(),
  product_ids: z.array(z.union([z.string(), z.number()])).min(1, "Pelo menos um product_id deve ser fornecido")
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
    
    let temporaryPassword: string | null = null;
    
    if (!user) {
      // Gerar uma senha temporária
      temporaryPassword = generateTemporaryPassword();
      
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
          emailVerified: true,
          whatsapp: payload.whatsapp,
          cpf: payload.cpf,
          subscriptionTier: "free"
        }
      });
      
      console.log(`Novo usuário criado: ${user.id}`);
    }
    
    // Converter product_ids para string para busca
    const productIds = payload.product_ids.map(id => String(id));
    
    // Verificar se algum dos product_ids é um Plano Premium
    let premiumPlan = null;
    for (const productId of productIds) {
      const plan = await prisma.plan.findUnique({
        where: { productId }
      });
      
      if (plan) {
        premiumPlan = plan;
        break; // Se encontrar um plano premium, para a busca
      }
    }
    
    if (premiumPlan) {
      // COMPROU PLANO PREMIUM - Ignora recursos individuais e libera acesso total
      console.log(`Plano premium detectado: ${premiumPlan.name}`);
      
      // Calcular data de expiração baseado na duração do plano
      const expiresAt = premiumPlan.durationDays 
        ? new Date(Date.now() + premiumPlan.durationDays * 24 * 60 * 60 * 1000)
        : null;
      
      // Criar/atualizar assinatura premium
      await prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          planId: premiumPlan.id,
          productId: premiumPlan.productId,
          expiresAt,
          isActive: true,
          metadata: {
            purchasedAt: new Date().toISOString(),
            store: payload.store,
            planName: premiumPlan.name,
            allProductIds: productIds
          }
        },
        update: {
          planId: premiumPlan.id,
          productId: premiumPlan.productId,
          expiresAt,
          isActive: true,
          purchaseDate: new Date(),
          metadata: {
            updatedAt: new Date().toISOString(),
            store: payload.store,
            planName: premiumPlan.name,
            allProductIds: productIds
          }
        }
      });
      
      // Atualizar subscriptionTier do usuário
      await prisma.user.update({
        where: { id: user.id },
        data: { subscriptionTier: "premium" }
      });
      
      console.log(`Assinatura premium concedida ao usuário ${user.id} - Plano: ${premiumPlan.name}`);
      
      // URL de acesso ao dashboard premium
      const accessUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.kadernim.com'}/dashboard`;
      
      return NextResponse.json({ 
        success: true,
        userId: user.id,
        email: user.email,
        password_temp: temporaryPassword,
        isPremium: true,
        plan: premiumPlan.name,
        accessUrl
      });
      
    } else {
      // COMPROU RECURSOS INDIVIDUAIS (pode ter plano premium ou não)
      console.log(`Processando ${productIds.length} recursos individuais`);
      
      const grantedResources = [];
      const notFoundProducts = [];
      
      // Verificar se usuário tem plano premium ativo
      const existingSubscription = await prisma.subscription.findUnique({
        where: { userId: user.id },
        include: { plan: true }
      });
      
      const hasPremiumPlan = existingSubscription?.isActive && existingSubscription.plan?.slug !== 'free';
      
      for (const productId of productIds) {
        // Buscar o recurso via ExternalProductMapping
        const mapping = await prisma.externalProductMapping.findFirst({
          where: { 
            productId: productId,
            store: payload.store
          },
          include: { resource: true }
        });
        
        if (!mapping) {
          console.error(`Mapeamento não encontrado para productId: ${productId}`);
          notFoundProducts.push(productId);
          continue;
        }
        
        // Conceder acesso ao recurso específico (SEMPRE registra, mesmo se tiver plano premium)
        await prisma.userResourceAccess.upsert({
          where: {
            userId_resourceId: {
              userId: user.id,
              resourceId: mapping.resourceId
            }
          },
          update: {
            isActive: true,
            metadata: {
              updatedAt: new Date().toISOString(),
              purchasedIndividually: true,
              hasPremiumAtPurchase: hasPremiumPlan
            }
          },
          create: {
            userId: user.id,
            resourceId: mapping.resourceId,
            isActive: true,
            metadata: {
              enrolledAt: new Date().toISOString(),
              enrollmentSource: 'api',
              store: payload.store,
              productId: productId,
              purchasedIndividually: true,
              hasPremiumAtPurchase: hasPremiumPlan
            }
          }
        });
        
        // Montar URL de acesso ao recurso
        const resourceUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.kadernim.com'}/resource/${mapping.resource.id}`;
        
        grantedResources.push({
          title: mapping.resource.title,
          id: mapping.resource.id,
          url: resourceUrl
        });
        
        console.log(`Acesso concedido ao recurso ${mapping.resource.title} para o usuário ${user.id}`);
      }
      
      // Garantir que usuário tem subscription com plano free (se não tiver nenhum plano)
      if (!existingSubscription) {
        const freePlan = await prisma.plan.findUnique({
          where: { slug: "free" }
        });
        
        if (freePlan) {
          await prisma.subscription.create({
            data: {
              userId: user.id,
              planId: freePlan.id,
              isActive: true,
              metadata: {
                createdAt: new Date().toISOString(),
                reason: "individual_resource_purchase"
              }
            }
          });
          
          console.log(`Plano free atribuído ao usuário ${user.id}`);
        }
      }
      
      return NextResponse.json({ 
        success: true,
        userId: user.id,
        email: user.email,
        password_temp: temporaryPassword,
        isPremium: hasPremiumPlan,
        resources: grantedResources,
        notFoundProducts: notFoundProducts.length > 0 ? notFoundProducts : undefined
      });
    }
  } catch (error) {
    console.error("Erro ao processar matrícula:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
