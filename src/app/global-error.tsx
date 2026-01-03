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
      <body>
        <h2>Algo de errado aconteceu!</h2>
        <button onClick={() => reset()}>Tente novamente</button>
      </body>
    </html>
  )
}
