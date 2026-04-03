import { PaymentMethod } from '@db'
import { CheckoutRequest } from '@/lib/billing/schemas'
import { CheckoutStatusTokenService } from './checkout-status-token.service'
import { PaymentService } from './payment.service'
import { PixAutomaticService } from './pix-automatic.service'

function sanitizeCreditCardNumber(number: string) {
  return number.replace(/\D/g, '')
}

export class CheckoutService {
  static async createCheckout(
    userId: string,
    input: CheckoutRequest,
    context: { remoteIp?: string } = {},
  ) {
    if (input.paymentMethod === PaymentMethod.PIX_AUTOMATIC) {
      const result = await PixAutomaticService.createAuthorization({
        userId,
        cpfCnpj: input.cpfCnpj,
        planId: input.planId,
      })

      return {
        ...result,
        statusToken: CheckoutStatusTokenService.createAuthorizationToken(result.authorizationId),
      }
    }

    if (input.paymentMethod === PaymentMethod.PIX) {
      const result = await PaymentService.createPixSubscription({
        userId,
        cpfCnpj: input.cpfCnpj,
        planId: input.planId,
      })

      return {
        ...result,
        statusToken: CheckoutStatusTokenService.createInvoiceToken(result.invoiceId),
      }
    }

    if (!input.creditCard) {
      throw new Error('Dados do cartão de crédito obrigatórios')
    }

    return PaymentService.createCreditCardSubscription({
      userId,
      cpfCnpj: input.cpfCnpj,
      planId: input.planId,
      installments: input.installments,
      remoteIp: context.remoteIp,
      creditCard: {
        holderName: input.creditCard.holderName ?? '',
        number: sanitizeCreditCardNumber(input.creditCard.number ?? ''),
        expiryMonth: input.creditCard.expiryMonth ?? '',
        expiryYear: input.creditCard.expiryYear ?? '',
        ccv: input.creditCard.ccv ?? '',
      },
    })
  }
}
