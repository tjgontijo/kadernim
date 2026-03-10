import { PrismaClient } from '@db/client';

export async function seedBilling(prisma: PrismaClient) {
  console.log('💳 Configurando regras de faturamento (Split)...');

  const walletId = process.env.WALLET_ASAAS_ID || 'bd4bedeb-6e30-4d93-af64-5b7e955d35fc';
  
  await prisma.splitConfig.upsert({
    where: { walletId },
    update: {
      companyName: 'Elev8 Negocios Digitais LTDA',
      cnpj: '63.823.086/0001-72',
      isActive: true,
      splitType: 'PERCENTAGE',
      percentualValue: 100,
      description: 'Split 100% para Elev8 Negócios Digitais',
    },
    create: {
      walletId,
      companyName: 'Elev8 Negocios Digitais LTDA',
      cnpj: '63.823.086/0001-72',
      isActive: true,
      splitType: 'PERCENTAGE',
      percentualValue: 100,
      description: 'Split 100% para Elev8 Negócios Digitais',
    }
  });

  console.log('✅ Split da Elev8 configurado com sucesso.');
}
