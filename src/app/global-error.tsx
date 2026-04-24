'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="bg-paper flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full p-8 text-center">
          <h2 className="text-2xl font-display font-bold text-ink mb-4">Algo de errado aconteceu!</h2>
          <p className="text-ink-soft mb-8">Tivemos um problema crítico e não conseguimos carregar a página.</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => reset()}
              className="bg-terracotta text-white rounded-full px-8 py-3 font-semibold hover:bg-terracotta-hover transition-colors"
            >
              Tentar novamente
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="text-ink-mute text-sm hover:underline"
            >
              Recarregar página inteira
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
