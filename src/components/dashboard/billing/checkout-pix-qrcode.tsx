'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import Image from 'next/image'
import { InvoiceStatus } from '@db'

interface PixQrCodeProps {
    payload: string
    image: string
    expirationDate: string
    invoiceId: string
    isAutomatic?: boolean
    onSuccess: () => void
}

export function PixQrCode({ payload, image, expirationDate, invoiceId, isAutomatic, onSuccess }: PixQrCodeProps) {
    const [copied, setCopied] = useState(false)
    const [timeLeft, setTimeLeft] = useState<{ m: number; s: number }>({ m: 15, s: 0 })

    // Initialize countdown
    useEffect(() => {
        const expire = new Date(expirationDate).getTime()

        const intervalId = setInterval(() => {
            const now = new Date().getTime()
            const diff = expire - now

            if (diff <= 0) {
                clearInterval(intervalId)
                setTimeLeft({ m: 0, s: 0 })
            } else {
                setTimeLeft({
                    m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                    s: Math.floor((diff % (1000 * 60)) / 1000)
                })
            }
        }, 1000)

        return () => clearInterval(intervalId)
    }, [expirationDate])

    // Poll for payment status
    useEffect(() => {
        let pollingActive = true

        const checkStatus = async () => {
            try {
                const url = isAutomatic
                    ? `/api/v1/billing/pix-automatic/${invoiceId}/status`
                    : `/api/v1/billing/checkout/${invoiceId}/status`

                const res = await fetch(url)
                if (res.ok) {
                    const { status } = await res.json()
                    if (status === InvoiceStatus.RECEIVED || status === InvoiceStatus.CONFIRMED || status === 'ACTIVE') {
                        pollingActive = false
                        toast.success('Pagamento confirmado com sucesso!')
                        onSuccess()
                    }
                }
            } catch (err) {
                // silently ignore polling errors
            }

            if (pollingActive) {
                setTimeout(checkStatus, 3000) // Poll every 3 seconds
            }
        }

        checkStatus()

        return () => { pollingActive = false }
    }, [invoiceId, onSuccess])

    const handleCopy = () => {
        navigator.clipboard.writeText(payload)
        setCopied(true)
        toast.success('Código Pix Copiado!')
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex flex-col items-center space-y-6 text-center animate-in fade-in zoom-in duration-500">
            <div className="space-y-2">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                    Quase lá!
                </h3>
                <p className="text-muted-foreground">
                    Escaneie o QR Code abaixo com o app do seu banco para ativar sua conta Kadernim Pro.
                </p>
            </div>

            <Card className="border-2 border-primary/20 bg-background overflow-hidden relative shadow-lg shadow-primary/5">
                <CardContent className="p-6">
                    {image ? (
                        <div className="relative w-48 h-48 mx-auto">
                            <Image
                                src={`data:image/png;base64,${image}`}
                                alt="PIX QR Code"
                                fill
                                className="object-contain"
                            />
                        </div>
                    ) : (
                        <div className="w-48 h-48 mx-auto rounded-lg bg-muted flex items-center justify-center animate-pulse">
                            Carregando...
                        </div>
                    )}
                </CardContent>
                <div className="bg-primary/5 px-6 py-3 border-t border-primary/10 flex items-center justify-center gap-2 text-sm font-medium">
                    <span>
                        Expira em: <strong className="text-primary">{timeLeft.m}m {timeLeft.s}s</strong>
                    </span>
                </div>
            </Card>

            <div className="w-full max-w-sm space-y-3">
                <p className="text-sm font-medium mb-1">Ou copie o código PIX (Copia e Cola):</p>
                <div className="relative flex items-center">
                    <input
                        readOnly
                        value={payload}
                        className="w-full bg-muted border border-border/50 text-muted-foreground rounded-l-md px-3 py-2 text-xs font-mono outline-none truncate"
                    />
                    <Button
                        variant="default"
                        className="rounded-l-none"
                        onClick={handleCopy}
                    >
                        {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
                Aguardando confirmação do pagamento...
            </div>
        </div>
    )
}
