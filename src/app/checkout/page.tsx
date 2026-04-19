import { Metadata } from 'next'
import { headers } from 'next/headers'
import { getBillingCheckoutCatalog } from '@/lib/billing/queries'
import { auth } from '@/server/auth/auth'
import { GuestCheckoutForm } from '@/components/dashboard/billing/checkout-form'
import Image from 'next/image'
import { Lock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Checkout | Kadernim Pro',
  description: 'Adquira agora o Kadernim Pro.',
}

export default async function CheckoutPage(props: {
  searchParams: Promise<{ plan?: string }>
}) {
  const searchParams = await props.searchParams
  const planId = searchParams.plan as any
  
  let prefilledUser: { id: string; name: string; email: string } | null = null
  const catalog = await getBillingCheckoutCatalog()

  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (session?.user) {
      prefilledUser = {
        id: session.user.id,
        name: session.user.name || '',
        email: session.user.email,
      }
    }
  } catch {
    // guest checkout
  }

  return (
    <div className="min-h-screen bg-paper font-body paper-grain">
      <header className="bg-surface-card border-b border-line h-16 flex items-center px-4 sm:px-8 shadow-1">
        <div className="flex items-center gap-3">
          <div className="relative size-[34px] rounded-[10px] bg-ink text-paper flex items-center justify-center font-display font-semibold text-lg after:absolute after:-top-[3px] after:-right-[3px] after:size-2 after:rounded-full after:bg-mustard shrink-0">
            K
          </div>
          <div className="hidden sm:block">
            <div className="font-display font-semibold text-xl tracking-tight leading-none text-ink">Kadernim</div>
            <div className="font-hand text-sm text-terracotta leading-none mt-0.5">da Professora</div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 text-ink-mute">
          <Lock className="h-4 w-4 text-terracotta" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wider">Compra segura</span>
        </div>
      </header>

      <main className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <GuestCheckoutForm prefilledUser={prefilledUser} catalog={catalog} initialPlan={planId} />
      </main>
    </div>
  )
}
