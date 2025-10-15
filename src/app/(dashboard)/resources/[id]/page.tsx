export const dynamic = 'force-dynamic';

// app/(dashboard)/resources/[id]/page.tsx
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/PageHeader';
import { BookOpen, Download, ExternalLink, FileText, Lock } from 'lucide-react';

type PageParams = {
  params: Promise<{ id: string }>;
};

type SubscriptionPlan = {
  slug: string | null;
};

type Subscription = {
  isActive: boolean;
  expiresAt: string | null;
  plan: SubscriptionPlan | null;
} | null;

type ResourceAccess = {
  id: string;
  isActive: boolean;
  expiresAt: string | null;
};

type ResourceFile = {
  id: string;
  fileName: string | null;
  fileType: string | null;
  storageType: string;
  externalUrl: string | null;
};

type ResourceBnccCode = {
  id: string;
  bnccCode: {
    code: string;
  };
};

type ResourceExternalMapping = {
  id: string;
  productId: string | null;
  store: string | null;
};

type ResourceEntity = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  isFree: boolean;
  subject: { name: string } | null;
  educationLevel: { name: string } | null;
  files: ResourceFile[];
  externalMappings: ResourceExternalMapping[];
  bnccCodes: ResourceBnccCode[];
  accesses?: ResourceAccess[] | null;
};

type ResourceResponse = {
  resource: ResourceEntity;
  subscription: Subscription;
} | null;

async function getResource(id: string): Promise<ResourceResponse> {
  const incomingHeaders = await headers();
  const protocol = incomingHeaders.get('x-forwarded-proto') ?? 'http';
  const host = incomingHeaders.get('host');
  const baseUrl = host
    ? `${protocol}://${host}`
    : process.env.NEXT_PUBLIC_APP_URL;

  if (!baseUrl) {
    throw new Error('Base URL is not defined for resource fetch');
  }

  const requestHeaders = new Headers();
  const cookie = incomingHeaders.get('cookie');
  if (cookie) {
    requestHeaders.set('cookie', cookie);
  }

  const res = await fetch(`${baseUrl}/api/v1/resources/${id}`, {
    headers: requestHeaders,
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch resource');
  }

  const data = (await res.json()) as ResourceResponse;
  return data;
}

export default async function ResourcePage({ params }: PageParams) {
  const { id } = await params;
  const data = await getResource(id);

  if (!data?.resource) {
    notFound();
  }

  const resource = data.resource;
  const subscription = data.subscription;

  const now = new Date();
  const subscriptionExpiresAt = subscription?.expiresAt
    ? new Date(subscription.expiresAt)
    : null;

  const hasActivePremium = Boolean(
    subscription?.isActive &&
      (subscriptionExpiresAt === null || subscriptionExpiresAt > now) &&
      subscription?.plan?.slug &&
      subscription.plan.slug !== 'free'
  );

  const hasIndividualAccess = resource.accesses?.some((access) => {
    const accessExpiresAt = access.expiresAt ? new Date(access.expiresAt) : null;
    return access.isActive && (accessExpiresAt === null || accessExpiresAt > now);
  }) ?? false;

  const hasAccess = resource.isFree || hasActivePremium || hasIndividualAccess;
  const isPremiumResource = !resource.isFree;
  const hasFiles = resource.files.length > 0;
  const hasBnccCodes = resource.bnccCodes.length > 0;
  const hasImage = Boolean(resource.imageUrl);

  const renderDescription = () => {
    if (!resource.description) {
      return (
        <p className="text-base text-muted-foreground">
          Em breve adicionaremos uma descrição detalhada para este material.
        </p>
      );
    }

    return (
      <div
        className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: resource.description }}
      />
    );
  };

  const renderFileMetadata = (file: ResourceFile) => {
    const parts: string[] = [];
    if (file.storageType) parts.push(file.storageType);
    if (file.fileType) parts.push(file.fileType.toUpperCase());
    return parts.join(' • ');
  };

  return (
    <>
      <PageHeader
        title={resource.title}
        icon={<BookOpen className="h-5 w-5" />}
      />

      <main className="container mx-auto max-w-4xl space-y-10 px-4 py-10">
        <article className="space-y-8">
          <div className="overflow-hidden rounded-3xl border bg-muted/40 shadow-sm">
            {hasImage ? (
              <div className="relative aspect-video">
                <Image
                  src={resource.imageUrl as string}
                  alt={resource.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
                />
              </div>
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-gradient-to-br from-muted to-background text-center text-sm text-muted-foreground">
                <FileText className="h-10 w-10" />
                <span>Este recurso ainda não possui imagem de destaque.</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {resource.subject && (
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">
                  {resource.subject.name}
                </Badge>
              )}

              {resource.educationLevel && (
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">
                  {resource.educationLevel.name}
                </Badge>
              )}

              {resource.isFree && (
                <Badge variant="outline" className="rounded-full px-3 py-1 text-sm">
                  Gratuito
                </Badge>
              )}

              {hasActivePremium && (
                <Badge variant="outline" className="rounded-full px-3 py-1 text-sm">
                  Assinatura Ativa
                </Badge>
              )}
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground">
              {resource.title}
            </h1>

            {renderDescription()}
          </div>

          <section className="space-y-6 rounded-3xl border bg-card/80 p-6 shadow-sm">
            <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Acesso ao material</h2>
                <p className="text-sm text-muted-foreground">
                  Consulte os arquivos disponíveis ou acesse via links externos.
                </p>
              </div>
              {isPremiumResource && (
                <Badge variant="outline" className="rounded-full px-3 py-1 text-sm">
                  Conteúdo exclusivo
                </Badge>
              )}
            </header>

            {hasAccess ? (
              hasFiles ? (
                <div className="grid gap-4">
                  {resource.files.map((file) => {
                    const label = file.fileName ?? (file.externalUrl ? 'Abrir link' : 'Arquivo disponível');
                    const canOpenExternal = Boolean(file.externalUrl);
                    const metadata = renderFileMetadata(file);

                    return (
                      <div
                        key={file.id}
                        className="flex flex-col gap-4 rounded-2xl border bg-background/60 p-5 transition-colors hover:border-primary/40 hover:bg-primary/5 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex items-start gap-4 md:items-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-base font-semibold text-foreground">{label}</p>
                            {metadata && (
                              <p className="text-sm text-muted-foreground">{metadata}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex w-full gap-2 md:w-auto">
                          {canOpenExternal ? (
                            <Button asChild size="sm" variant="outline" className="w-full md:w-auto">
                              <a
                                href={file.externalUrl as string}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Acessar
                              </a>
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" disabled className="w-full md:w-auto">
                              <Download className="mr-2 h-4 w-4" />
                              Indisponível
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                  Nenhum arquivo foi adicionado para este recurso até o momento.
                </div>
              )
            ) : (
              <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed bg-muted/20 p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Lock className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Conteúdo bloqueado</h3>
                  <p className="text-sm text-muted-foreground">
                    Este material é exclusivo para assinantes. Assine um plano premium e obtenha acesso imediato a todos os arquivos.
                  </p>
                </div>
                <Button asChild size="sm" className="px-6">
                  <Link href="/plans">Conhecer planos</Link>
                </Button>
              </div>
            )}
          </section>


          {hasBnccCodes && (
            <section className="space-y-3 rounded-3xl border bg-background/60 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground">Códigos BNCC</h3>
              <div className="flex flex-wrap gap-2">
                {resource.bnccCodes.map((item) => (
                  <Badge key={item.id} variant="outline" className="rounded-full px-3 py-1 text-sm">
                    {item.bnccCode.code}
                  </Badge>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>
    </>
  );
}