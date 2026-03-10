import { billingLog } from './logger'

const ASAAS_API_KEY = process.env.ASAAS_API_KEY
const ASAAS_BASE_URL = process.env.ASAAS_BASE_URL || 'https://sandbox.asaas.com/api/v3'

if (!ASAAS_API_KEY) {
    console.warn('[Billing:AsaasClient] ASAAS_API_KEY is not defined in environment variables.')
}

export class AsaasClient {
    private static async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${ASAAS_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
        const start = Date.now()

        const response = await fetch(url, {
            ...options,
            headers: {
                'access_token': ASAAS_API_KEY || '',
                'Content-Type': 'application/json',
                ...options.headers,
            },
        })

        const duration = Date.now() - start
        const status = response.status

        if (!response.ok) {
            const errorBody = await response.text()
            billingLog('error', `Asaas API Request Failed`, {
                url,
                status,
                duration,
                error: errorBody,
                method: options.method || 'GET',
            })

            // Attempt to parse Asaas error format
            let parsedError = errorBody
            try {
                const json = JSON.parse(errorBody)
                if (json.errors) {
                    parsedError = json.errors.map((e: any) => `${e.code}: ${e.description}`).join(', ')
                }
            } catch {
                // Fallback to raw text
            }

            throw new Error(`Asaas API Error [${status}]: ${parsedError}`)
        }

        const data = await response.json()

        billingLog('info', `Asaas API Request Success`, {
            url,
            status,
            duration,
            method: options.method || 'GET',
        })

        return data as T
    }

    static async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'GET' })
    }

    static async post<T>(endpoint: string, body: any, options: RequestInit = {}): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
        })
    }

    static async put<T>(endpoint: string, body: any, options: RequestInit = {}): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
        })
    }

    static async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' })
    }
}
