import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, Zap, Shield, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Kadernim</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login/otp">
              <Button variant="ghost">Entrar</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-1 items-center bg-gradient-to-br from-indigo-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-5xl font-bold tracking-tight">
              App de bolso para toda professora moderna
            </h2>
            <p className="mb-8 text-xl text-muted-foreground">
             Tenha acesso a centenas de recursos pedagógicos e conteúdos educacionais prontos para imprimir e aplicar na sala de aula.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">              
              <Link href="/login/otp">
                <Button size="lg" variant="outline">
                  Entrar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <h3 className="mb-12 text-center text-3xl font-bold">
            Por que escolher o Kadernim?
          </h3>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h4 className="mb-2 font-semibold">Rápido e Eficiente</h4>
              <p className="text-sm text-muted-foreground">
                Interface intuitiva que economiza seu tempo
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h4 className="mb-2 font-semibold">Seguro</h4>
              <p className="text-sm text-muted-foreground">
                Seus dados protegidos com criptografia
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h4 className="mb-2 font-semibold">Colaborativo</h4>
              <p className="text-sm text-muted-foreground">
                Trabalhe em equipe de forma integrada
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h4 className="mb-2 font-semibold">Completo</h4>
              <p className="text-sm text-muted-foreground">
                Todas as ferramentas que você precisa
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Kadernim. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
