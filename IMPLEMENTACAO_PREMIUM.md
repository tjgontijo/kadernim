# Implementação do Sistema de Acesso Premium

Este documento descreve a implementação do sistema de acesso premium para o MVP da plataforma KADERNIN.

## Lógica de Negócio

### 1. Quando um usuário adquire o plano premium

```typescript
// Função para processar a compra do plano premium
async function processPremiumPurchase(userId: string, transactionId: string) {
  const db = prisma;
  
  // 1. Criar a assinatura premium
  await db.subscription.create({
    data: {
      userId,
      isActive: true,
      transactionId,
    }
  });
  
  // 2. Conceder acesso a TODOS os recursos premium
  // Primeiro, obtemos todos os recursos premium
  const premiumResources = await db.resource.findMany({
    where: {
      isFree: false,
    },
    select: {
      id: true,
    }
  });
  
  // Criamos os registros de acesso em lote para melhor performance
  const accessRecords = premiumResources.map(resource => ({
    userId,
    resourceId: resource.id,
  }));
  
  // Inserimos em lote (evitando duplicatas)
  await db.$transaction(
    accessRecords.map(record => 
      db.userResourceAccess.upsert({
        where: {
          userId_resourceId: {
            userId: record.userId,
            resourceId: record.resourceId,
          }
        },
        create: record,
        update: {} // Não faz nada se já existir
      })
    )
  );
  
  return { success: true, resourceCount: accessRecords.length };
}
```

### 2. Verificação de acesso a recursos

```typescript
// Hook para verificar se o usuário tem acesso a um recurso
function useResourceAccess(resourceId: string) {
  const { user } = useUser(); // Hook de autenticação
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function checkAccess() {
      if (!user || !resourceId) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }
      
      try {
        // Verificar se o recurso é gratuito
        const resource = await prisma.resource.findUnique({
          where: { id: resourceId },
          select: { isFree: true }
        });
        
        if (resource?.isFree) {
          setHasAccess(true);
          setIsLoading(false);
          return;
        }
        
        // Verificar se o usuário tem assinatura premium ativa
        const subscription = await prisma.subscription.findUnique({
          where: { userId: user.id },
          select: { isActive: true }
        });
        
        if (subscription?.isActive) {
          setHasAccess(true);
          setIsLoading(false);
          return;
        }
        
        // Verificar se o usuário tem acesso específico ao recurso
        const access = await prisma.userResourceAccess.findUnique({
          where: {
            userId_resourceId: {
              userId: user.id,
              resourceId
            }
          }
        });
        
        setHasAccess(!!access);
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao verificar acesso:", error);
        setHasAccess(false);
        setIsLoading(false);
      }
    }
    
    checkAccess();
  }, [user, resourceId]);
  
  return { hasAccess, isLoading };
}
```

### 3. Middleware para proteção de rotas de API

```typescript
// Middleware para proteger endpoints de recursos premium
export async function resourceAccessMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  const session = await getServerSession(req, res);
  const resourceId = req.query.resourceId as string;
  
  if (!session?.user?.id || !resourceId) {
    return res.status(401).json({ error: "Não autorizado" });
  }
  
  const userId = session.user.id;
  
  // Verificar se o recurso é gratuito
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    select: { isFree: true }
  });
  
  if (resource?.isFree) {
    return next();
  }
  
  // Verificar assinatura premium
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { isActive: true }
  });
  
  if (subscription?.isActive) {
    return next();
  }
  
  // Verificar acesso específico
  const access = await prisma.userResourceAccess.findUnique({
    where: {
      userId_resourceId: {
        userId,
        resourceId
      }
    }
  });
  
  if (access) {
    return next();
  }
  
  return res.status(403).json({ 
    error: "Acesso negado", 
    message: "Este recurso requer assinatura premium",
    upgradeToPremium: true
  });
}
```

## Considerações para Escala

Com pelo menos 500 recursos na plataforma, é importante considerar:

1. **Performance de Concessão de Acesso**:
   - Usar operações em lote (batch) para conceder acesso a todos os recursos
   - Considerar processamento assíncrono para grandes volumes

2. **Caching de Verificações de Acesso**:
   - Implementar cache no lado do cliente para verificações frequentes
   - Usar Redis para cache de sessão no servidor

3. **Indexação Adequada**:
   - Garantir que todos os campos usados em consultas frequentes estejam indexados
   - Monitorar performance das queries

4. **Paginação de Recursos**:
   - Implementar paginação eficiente para listar recursos
   - Usar cursor-based pagination para melhor performance

5. **Estratégia para Novos Recursos**:
   - Quando novos recursos são adicionados, conceder acesso automaticamente a todos os usuários premium
   - Usar jobs agendados para sincronização periódica
