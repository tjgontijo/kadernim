'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Copy, MessageCircle, Mail, QrCode } from 'lucide-react'
import Image from 'next/image'
import { useMobile } from '@/hooks/layout/use-mobile'
import { InvoiceStatus } from '@db'
import { toast } from 'sonner'
import { fetchBillingPixStatus } from '@/lib/billing/api-client'
import { Button } from '@/components/ui/button'

interface PixQrCodeProps {
  payload: string
  image: string
  expirationDate: string
  statusId: string
  amountLabel: string
  invoiceId?: string
  statusToken?: string
  isAutomatic?: boolean
  onSuccess: () => void
}

export function PixQrCode({
  payload,
  image,
  expirationDate,
  statusId,
  amountLabel,
  invoiceId,
  statusToken,
  isAutomatic,
  onSuccess,
}: PixQrCodeProps) {
  const [copied, setCopied] = useState(false)
  const [resending, setResending] = useState<'email' | 'whatsapp' | null>(null)
  const { isMobile } = useMobile()
  const [timeLeft, setTimeLeft] = useState<{ m: number; s: number }>({ m: 15, s: 0 })
  const [showQrOverride, setShowQrOverride] = useState<boolean | null>(null)

  // Visibilidade do QR Code: se o usuário já clicou, segue o clique.
  // Caso contrário, mostra no Desktop e esconde no Mobile.
  const showQr = showQrOverride !== null ? showQrOverride : !isMobile

  useEffect(() => {
    const expire = new Date(expirationDate).getTime()
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const updateCountdown = () => {
      const now = new Date().getTime()
      const diff = expire - now
      if (diff <= 0) {
        setTimeLeft({ m: 0, s: 0 })
      } else {
        setTimeLeft({
          m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((diff % (1000 * 60)) / 1000),
        })
        timeoutId = setTimeout(updateCountdown, 1000)
      }
    }

    updateCountdown()
    return () => { if (timeoutId) clearTimeout(timeoutId) }
  }, [expirationDate])

  const { data: paymentStatus } = useQuery<string | null>({
    queryKey: ['billing-pix-status', statusId, isAutomatic, statusToken],
    queryFn: async () => {
      try {
        const data = await fetchBillingPixStatus({ statusId, isAutomatic, statusToken })
        return data.status ?? null
      } catch {
        return null
      }
    },
    refetchInterval: (query) => {
      const status = query.state.data
      return status === InvoiceStatus.RECEIVED || status === InvoiceStatus.CONFIRMED || status === 'ACTIVE'
        ? false
        : 3000
    },
  })

  useEffect(() => {
    if (paymentStatus === InvoiceStatus.RECEIVED || paymentStatus === InvoiceStatus.CONFIRMED || paymentStatus === 'ACTIVE') {
      toast.success('Pagamento confirmado com sucesso!')
      onSuccess()
    }
  }, [onSuccess, paymentStatus])

  const handleCopy = () => {
    navigator.clipboard.writeText(payload)
    setCopied(true)
    toast.success('Código PIX copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleResend = async (channel: 'email' | 'whatsapp') => {
    if (!invoiceId) return
    setResending(channel)
    try {
      const res = await fetch(`/api/v1/billing/pix-checkout/${invoiceId}/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel }),
      })
      const data = await res.json()

      if (res.status === 429) {
        const seconds = data.retryAfterSeconds ?? 300
        const minutes = Math.ceil(seconds / 60)
        toast.warning(`Aguarde ${minutes} min antes de reenviar novamente.`)
        return
      }

      if (!res.ok) {
        toast.error(data.error ?? 'Erro ao reenviar.')
        return
      }

      const label = channel === 'email' ? 'e-mail' : 'WhatsApp'
      toast.success(`Código PIX reenviado para seu ${label}!`)
    } catch {
      toast.error('Erro de conexão.')
    } finally {
      setResending(null)
    }
  }

  return (
    <div className="flex flex-col space-y-5 animate-in fade-in zoom-in duration-500">

      {/* Cabeçalho */}
      <div className="text-center space-y-1">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
          Quase lá!
        </h3>
        <p className="text-sm text-muted-foreground">
          Cole o código abaixo no app do seu banco para pagar.
        </p>
        <div className="inline-flex items-baseline gap-1 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
          <span className="text-emerald-700 text-sm font-semibold">Valor:</span>
          <span className="text-emerald-800 text-xl font-black">{amountLabel}</span>
        </div>
      </div>

      {/* Copia e Cola — destaque principal */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-center">1. Copie o código PIX</p>
        <button
          onClick={handleCopy}
          className="w-full flex items-center gap-3 bg-muted hover:bg-muted/80 active:scale-95 border border-border/60 rounded-xl px-4 py-4 transition-all cursor-pointer group"
        >
          <div className="flex-1 text-left">
            <p className="text-xs text-muted-foreground mb-1">Código Copia e Cola</p>
            <p className="text-xs font-mono text-foreground/80 truncate">{payload.slice(0, 40)}...</p>
          </div>
          <div className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold flex items-center gap-1.5 transition-colors ${
            copied
              ? 'bg-emerald-500 text-white'
              : 'bg-primary text-primary-foreground group-hover:bg-primary/90'
          }`}>
            {copied
              ? <><CheckCircle2 className="h-4 w-4" /> Copiado!</>
              : <><Copy className="h-4 w-4" /> Copiar</>
            }
          </div>
        </button>
      </div>

      {/* Instruções rápidas */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl px-4 py-3">
        <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">2. Abra o app do banco e pague</p>
        <ol className="space-y-1">
          <li className="text-xs text-blue-700 dark:text-blue-400">→ Escolha <strong>PIX → Copia e Cola</strong></li>
          <li className="text-xs text-blue-700 dark:text-blue-400">→ Cole o código copiado</li>
          <li className="text-xs text-blue-700 dark:text-blue-400">→ Confirme o pagamento ✅</li>
        </ol>
      </div>

      {/* Temporizador */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
          Aguardando pagamento...
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          Expira em <strong className="text-orange-500">{timeLeft.m}m {timeLeft.s}s</strong>
        </span>
      </div>

      {/* Reenvio */}
      {invoiceId && (
        <div className="border-t border-border/50 pt-4 space-y-2">
          <p className="text-xs text-center text-muted-foreground">Vai pagar depois? Salve o código:</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={resending !== null}
              onClick={() => handleResend('whatsapp')}
              className="text-xs gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-950/40"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {resending === 'whatsapp' ? 'Enviando...' : 'Enviar WhatsApp'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={resending !== null}
              onClick={() => handleResend('email')}
              className="text-xs gap-1.5"
            >
              <Mail className="h-3.5 w-3.5" />
              {resending === 'email' ? 'Enviando...' : 'Enviar E-mail'}
            </Button>
          </div>
        </div>
      )}

      {/* QR Code colapsável — para quem está no PC */}
      <div className="border-t border-border/50 pt-4">
        <button
          onClick={() => setShowQrOverride(!showQr)}
          className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <QrCode className="h-3.5 w-3.5" />
          {showQr ? 'Ocultar QR Code' : 'Ver QR Code para escaneamento'}
        </button>

        {showQr && (
          <div className="mt-4 flex flex-col items-center gap-3 animate-in fade-in duration-300">
            <div className="border-2 border-primary/20 rounded-xl p-4 bg-white shadow-sm">
              {image ? (
                <div className="relative w-44 h-44">
                  <Image
                    src={`data:image/png;base64,${image}`}
                    alt="PIX QR Code"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="w-44 h-44 rounded-lg bg-muted flex items-center justify-center animate-pulse text-xs text-muted-foreground">
                  Carregando...
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Escaneie com a câmera do celular ou pelo app do banco
            </p>
          </div>
        )}
      </div>

    </div>
  )
}
