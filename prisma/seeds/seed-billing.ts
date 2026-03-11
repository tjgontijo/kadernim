import { PrismaClient } from '@db/client';

const billingPlans = [
  {
    code: 'monthly' as const,
    name: 'Kadernim Pro Mensal',
    cycle: 'MONTHLY' as const,
    accessDays: 30,
    sortOrder: 1,
    offers: [
      {
        code: 'offer_monthly_pix_automatic_default',
        paymentMethod: 'PIX_AUTOMATIC' as const,
        amount: '27.00',
        maxInstallments: 1,
        installmentRate: null,
      },
      {
        code: 'offer_monthly_credit_card_default',
        paymentMethod: 'CREDIT_CARD' as const,
        amount: '27.00',
        maxInstallments: 1,
        installmentRate: null,
      },
    ],
  },
  {
    code: 'annual' as const,
    name: 'Kadernim Pro Anual',
    cycle: 'YEARLY' as const,
    accessDays: 365,
    sortOrder: 2,
    offers: [
      {
        code: 'offer_annual_pix_default',
        paymentMethod: 'PIX' as const,
        amount: '197.00',
        maxInstallments: 1,
        installmentRate: null,
      },
      {
        code: 'offer_annual_credit_card_default',
        paymentMethod: 'CREDIT_CARD' as const,
        amount: '197.00',
        maxInstallments: 12,
        installmentRate: '0.0349',
      },
    ],
  },
];

export async function seedBilling(prisma: PrismaClient) {
  console.log('💳 Configurando catálogo de billing e regras de split...');

  for (const plan of billingPlans) {
    const persistedPlan = await prisma.billingPlan.upsert({
      where: { code: plan.code },
      update: {
        name: plan.name,
        cycle: plan.cycle,
        accessDays: plan.accessDays,
        sortOrder: plan.sortOrder,
        isActive: true,
      },
      create: {
        code: plan.code,
        name: plan.name,
        cycle: plan.cycle,
        accessDays: plan.accessDays,
        sortOrder: plan.sortOrder,
        isActive: true,
      },
      select: {
        id: true,
        code: true,
      },
    });

    for (const offer of plan.offers) {
      await prisma.billingOffer.upsert({
        where: { code: offer.code },
        update: {
          planId: persistedPlan.id,
          paymentMethod: offer.paymentMethod,
          amount: offer.amount,
          currency: 'BRL',
          maxInstallments: offer.maxInstallments,
          installmentRate: offer.installmentRate,
          isActive: true,
          validUntil: null,
        },
        create: {
          code: offer.code,
          planId: persistedPlan.id,
          paymentMethod: offer.paymentMethod,
          amount: offer.amount,
          currency: 'BRL',
          maxInstallments: offer.maxInstallments,
          installmentRate: offer.installmentRate,
          isActive: true,
        },
      });
    }
  }

  console.log('✅ Catálogo de billing configurado com sucesso.');

  const walletId = process.env.WALLET_ASAAS_ID?.trim();

  if (!walletId) {
    throw new Error('WALLET_ASAAS_ID is required to seed billing split configuration.');
  }

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
