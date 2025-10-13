export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/PageHeader';
import { BookOpen } from 'lucide-react';

type PageParams = {
  params: Promise<{ id: string }>;
};

export default async function ResourcePage({ params }: PageParams) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id || null;

  // Buscar o recurso com todas as relações necessárias
  const resource = await prisma.resource.findUnique({
    where: { id },
    include: {
      subject: true,
      educationLevel: true,
      files: true,
      externalMappings: true,
      bnccCodes: {
        include: {
          bnccCode: true,
        },
      },
      accesses: userId
        ? {
            where: { userId },
            select: {
              id: true,
              isActive: true,
              expiresAt: true,
            },
          }
        : false,
    },
  });

  if (!resource) {
    return notFound();
  }

  // Verificar assinatura premium ativa
  let hasActivePremium = false;
  if (userId) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: {
        isActive: true,
        expiresAt: true,
        plan: {
          select: {
            slug: true
          }
        }
      },
    });

    const notExpired =
      !subscription?.expiresAt || subscription.expiresAt > new Date();

    // Considerar premium se isActive e não expirada, e plano diferente de "free"
    hasActivePremium =
      !!subscription?.isActive && notExpired && subscription?.plan?.slug !== 'free';
  }

  // Verificar acesso individual concedido
  const hasIndividualAccess = resource.accesses?.some(
    (acc) => acc.isActive && (!acc.expiresAt || acc.expiresAt > new Date())
  ) ?? false;

  // Usuário tem acesso se: recurso gratuito, assinatura premium ou acesso individual
  const hasAccess = resource.isFree || hasActivePremium || hasIndividualAccess;

  return (
    <>
      <PageHeader 
        title={resource.title}
        icon={<BookOpen className="h-5 w-5" />}
      />
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{resource.title}</h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          {resource.subject && (
            <Badge variant="secondary">{resource.subject.name}</Badge>
          )}
          {resource.educationLevel && (
            <Badge variant="secondary">{resource.educationLevel.name}</Badge>
          )}
          {resource.isFree ? (
            <Badge variant="outline">Gratuito</Badge>
          ) : (
            <Badge variant="outline">Premium</Badge>
          )}
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <div className="relative aspect-square overflow-hidden rounded-md border">
              <Image
                src={resource.imageUrl}
                alt={resource.title}
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="prose max-w-none">
              {/* Descrição: inicialmente pode estar vazia, vamos exibir placeholder */}
              {resource.description ? (
                <div
                  dangerouslySetInnerHTML={{ __html: resource.description }}
                />
              ) : (
                <p className="text-muted-foreground">
                  Em breve adicionaremos a descrição detalhada deste material.
                </p>
              )}
            </div>

            {/* Códigos BNCC */}
            {resource.bnccCodes && resource.bnccCodes.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold">BNCC</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {resource.bnccCodes.map((rel) => (
                    <Badge key={rel.id} variant="secondary">
                      {rel.bnccCode.code}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Informações do produto externo */}
            {resource.externalMappings && resource.externalMappings.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold">Informações do Produto</h3>
                <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                  {resource.externalMappings.map((m) => (
                    <li key={m.id}>
                      Loja: {m.store || '—'} | Produto ID: {m.productId || '—'}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Acesso aos arquivos */}
            <div className="mt-6">
              {hasAccess ? (
                <>
                  <h3 className="text-sm font-semibold">Acesso ao Material</h3>
                  {resource.files && resource.files.length > 0 ? (
                    <div className="mt-3 flex flex-col gap-3">
                      {resource.files.map((file) => {
                        const label =
                          file.fileName ||
                          (file.externalUrl
                            ? 'Abrir Link'
                            : 'Baixar Arquivo');
                        const canOpenExternal = !!file.externalUrl;

                        return (
                          <div
                            key={file.id}
                            className="flex items-center justify-between rounded-md border p-3"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {label}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {file.storageType}
                                {file.fileType ? ` • ${file.fileType}` : ''}
                              </p>
                            </div>

                            {canOpenExternal ? (
                              <a
                                href={file.externalUrl!}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button size="sm">Acessar material</Button>
                              </a>
                            ) : (
                              <Button size="sm" disabled>
                                Indisponível
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhum arquivo cadastrado para este recurso.
                    </p>
                  )}
                </>
              ) : (
                <div className="rounded-md border bg-muted/30 p-4">
                  <p className="text-sm">
                    Você não tem acesso a este recurso. Assine um plano para liberar.
                  </p>
                  <div className="mt-3">
                    <Link href="/plans">
                      <Button>
                        Assinar agora
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
    </>
  );
}