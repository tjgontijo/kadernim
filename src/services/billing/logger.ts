/**
 * Billing Domain Structured Logger
 * 
 * Logs financial events in a structured JSON format for easier auditing
 * and observability in production tools (Vercel Logs, Axiom, etc).
 */

export type BillingLogLevel = 'info' | 'warn' | 'error'

export function billingLog(
    level: BillingLogLevel,
    message: string,
    data: Record<string, unknown> = {}
) {
    const log = {
        timestamp: new Date().toISOString(),
        level,
        domain: 'billing',
        message,
        ...data,
    }

    // In production, we usually want serialized JSON
    if (process.env.NODE_ENV === 'production') {
        if (level === 'error') {
            console.error(JSON.stringify(log))
        } else {
            console.info(JSON.stringify(log))
        }
    } else {
        // In development, pretty print or just object is fine
        const colors = {
            info: '\x1b[32m', // green
            warn: '\x1b[33m', // yellow
            error: '\x1b[31m', // red
        }
        const reset = '\x1b[0m'

        console.log(
            `${colors[level]}[Billing:${level.toUpperCase()}]${reset} ${message}`,
            data
        )
    }
}
