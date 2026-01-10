import { PrismaClient } from '../generated/prisma';

export async function seedTemplates(prisma: PrismaClient) {
    console.log('📝 Populando templates de notificação...');

    // 1. Template de Email para OTP
    const otpEmail = await prisma.emailTemplate.upsert({
        where: { slug: 'auth-otp-requested' },
        update: {},
        create: {
            slug: 'auth-otp-requested',
            name: 'Código de Verificação (OTP)',
            subject: 'Seu código de acesso: {{otp.code}}',
            preheader: 'Use este código para acessar o Kadernim',
            eventType: 'auth.otp.requested',
            isActive: true,
            body: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333;">Olá, {{user.firstName}}!</h2>
          <p style="color: #666; font-size: 16px;">Você solicitou um código para acessar sua conta no Kadernim.</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000;">{{otp.code}}</span>
          </div>
          <p style="color: #999; font-size: 14px;">Este código expira em {{otp.expiresIn}} minutos.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #bbb; font-size: 12px; text-align: center;">Kadernim - Ferramentas Pedagógicas</p>
        </div>
      `,
        },
    });

    // 2. Template de WhatsApp para OTP
    const otpWhatsApp = await prisma.whatsAppTemplate.upsert({
        where: { slug: 'auth-otp-requested-wa' },
        update: {},
        create: {
            slug: 'auth-otp-requested-wa',
            name: 'Código OTP (WhatsApp)',
            eventType: 'auth.otp.requested',
            isActive: true,
            body: 'Olá, *{{user.firstName}}*! Seu código de acesso ao Kadernim é: *{{otp.code}}*. Ele expira em {{otp.expiresIn}} minutos.',
        },
    });

    console.log(`✅ Templates criados: ${otpEmail.slug}, ${otpWhatsApp.slug}`);
}
