import { prisma } from '@/lib/db'
import { resendProvider } from '@/services/mail/resend'
import { renderBaseEmail } from '@/services/mail/templates/base-email'

export function renderTemplate(template: string, context: Record<string, any>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const keys = path.trim().split('.')
    let value: any = context

    for (const key of keys) {
      if (value === null || value === undefined) return match
      value = value[key]
    }

    return value !== null && value !== undefined ? String(value) : match
  })
}

export async function sendEmailFromTemplate(
  templateId: string,
  recipientEmail: string,
  context: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      return { success: false, error: `Template não encontrado: ${templateId}` }
    }

    if (!template.isActive) {
      return { success: false, error: `Template desativado: ${template.name}` }
    }

    const renderedBody = renderTemplate(template.body, context)
    const renderedSubject = template.subject ? renderTemplate(template.subject, context) : 'Notificação do Kadernim'
    const renderedPreheader = template.preheader ? renderTemplate(template.preheader, context) : ''

    const finalHtml = await renderBaseEmail({
      htmlContent: renderedBody,
      preheader: renderedPreheader,
    })

    if (!resendProvider.isConfigured()) {
      console.error('[Email] Resend não está configurado')
      return { success: false, error: 'Serviço de email não configurado (RESEND_API_KEY)' }
    }

    const result = await resendProvider.send({
      to: recipientEmail,
      subject: renderedSubject,
      html: finalHtml,
      text: renderedBody.replace(/<[^>]*>?/gm, ''),
    })

    if (!result.success) {
      return {
        success: false,
        error: result.error instanceof Error ? result.error.message : String(result.error),
      }
    }

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('[Email] Erro ao enviar:', error)
    return { success: false, error: errorMessage }
  }
}

export function extractRecipientEmail(payload: Record<string, any>): string | null {
  if (payload.email) return payload.email
  if (payload.authorEmail) return payload.authorEmail
  if (payload.recipientEmail) return payload.recipientEmail
  if (payload.user?.email) return payload.user.email
  if (payload.author?.email) return payload.author.email
  return null
}

export function extractRecipientPhone(payload: Record<string, any>): string | null {
  if (payload.phone) return payload.phone
  if (payload.whatsapp) return payload.whatsapp
  if (payload.recipientPhone) return payload.recipientPhone
  if (payload.user?.phone) return payload.user.phone
  if (payload.user?.whatsapp) return payload.user.whatsapp
  return null
}

export function buildTemplateContext(payload: Record<string, any>, eventName: string): Record<string, any> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kadernim.com.br'

  return {
    user: {
      name: payload.name || payload.userName || payload.user?.name || 'Usuário',
      email: payload.email || payload.authorEmail || payload.user?.email || '',
      id: payload.userId || payload.user?.id || '',
      firstName: (payload.name || payload.userName || payload.user?.name || '').split(' ')[0] || 'Usuário',
    },
    resource: {
      id: payload.resourceId || payload.resource?.id || '',
      title: payload.resourceTitle || payload.resource?.title || '',
      description: payload.resourceDescription || payload.resource?.description || '',
      url: payload.resourceId ? `${appUrl}/recursos/${payload.resourceId}` : payload.resource?.url || '',
      category: payload.categorySlug || payload.resource?.category || '',
      price: payload.price || payload.resource?.price || '',
    },
    subscription: {
      id: payload.subscriptionId || payload.subscription?.id || '',
      planName: payload.planName || payload.subscription?.planName || 'Plano',
      planId: payload.planId || payload.subscription?.planId || '',
      expiresAt: payload.expiresAt || payload.subscription?.expiresAt || '',
      daysRemaining: payload.daysRemaining || payload.subscription?.daysRemaining || '',
      status: payload.subscriptionStatus || payload.subscription?.status || 'active',
    },
    lessonPlan: {
      id: payload.lessonPlanId || payload.lessonPlan?.id || '',
      title: payload.lessonPlanTitle || payload.title || payload.lessonPlan?.title || '',
      subject: payload.subject || payload.lessonPlan?.subject || '',
      grade: payload.grade || payload.lessonPlan?.grade || '',
      url: payload.lessonPlanId ? `${appUrl}/planos-de-aula/${payload.lessonPlanId}` : '',
      numberOfClasses: payload.numberOfClasses || payload.lessonPlan?.numberOfClasses || '',
    },
    request: {
      id: payload.requestId || payload.request?.id || '',
      title: payload.title || payload.requestTitle || payload.request?.title || '',
      description: payload.description || payload.request?.description || '',
      url: payload.requestId ? `${appUrl}/comunidade/pedidos/${payload.requestId}` : '',
      status: payload.status || payload.request?.status || '',
      voteCount: payload.voteCount || payload.request?.voteCount || 0,
      reason: payload.reason || payload.unfeasibleReason || payload.request?.reason || '',
    },
    purchase: {
      id: payload.purchaseId || payload.purchase?.id || '',
      amount: payload.amount || payload.purchase?.amount || '',
      method: payload.paymentMethod || payload.purchase?.method || '',
      date: payload.purchaseDate || new Date().toLocaleDateString('pt-BR'),
    },
    app: {
      name: 'Kadernim',
      url: appUrl,
      support: {
        email: 'contato@kadernim.com.br',
        whatsapp: '+55 61 9869-8704',
      },
    },
    event: {
      name: eventName,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString('pt-BR'),
    },
    ...payload,
  }
}
