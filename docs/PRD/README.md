# Product Requirements Documents

Documentação de requisitos técnicos e de produto para features em desenvolvimento.

## 📋 Documentos

### 1. **PIX Automatic Failure Handling**
Status: **Draft**  
Prioridade: **Alta**  
Timeline: **30h em 3 fases**

Tratamento completo de falhas em pagamentos PIX automático, incluindo notificações via Email + WhatsApp, retry automático, e visibilidade no dashboard.

**Arquivos:**
- [`pix-automatic-failure-handling.md`](./pix-automatic-failure-handling.md) - PRD principal com escopo, solução e timeline
- [`pix-failure-implementation-guide.md`](./pix-failure-implementation-guide.md) - Guia técnico detalhado para desenvolvimento

**Resumo:**
- ❌ **Problema:** Usuário não sabe que perdeu acesso quando PIX falha
- ✅ **Solução:** Notificar + oferecer reativação + exibir status no dashboard
- 📧 **Delivery:** Email (Resend) + WhatsApp (UAZAPI)
- 🎯 **Resultado Esperado:** Churn -40%, Reativação +60%

---

### 2. **PIX Checkout UX Improvements**
Status: **Draft**  
Prioridade: **Média**  
Timeline: **20h em 4 fases**

Melhoria na experiência de checkout PIX permitindo que o usuário receba o QR Code por email e WhatsApp, com opção de reenvio.

**Arquivos:**
- [`pix-checkout-ux-improvements.md`](./pix-checkout-ux-improvements.md) - PRD com fluxo, templates e implementação

**Resumo:**
- ❌ **Problema:** QR Code só existe no navegador; se fechar a aba, precisa voltar ao checkout
- ✅ **Solução:** Enviar QR Code por Email + WhatsApp + permitir reenvio
- 👥 **Cenários:** PC → email, Smartphone → WhatsApp, Perdeu → reenviar
- 🎯 **Resultado Esperado:** Conversão +15%, Suporte -20%, Email delivery 99%+

---

### 3. **Resource Details - Sistema Completo** ⭐
Status: **Pronto para Implementação**  
Prioridade: **Alta**  
Timeline: **40-50h em 7 fases (5-6 semanas)**

Sistema completo de detalhes de recurso com Autoria, Reviews, Interações de Usuário, Relacionamentos e Métricas.

**Arquivos:**
- [`Resource_Details_Implementation_Plan.md`](./Resource_Details_Implementation_Plan.md) ⭐ **LEITURA OBRIGATÓRIA** - Plano arquitetral detalhado com schema completo
- [`IMPLEMENTATION_CHECKLIST.md`](./IMPLEMENTATION_CHECKLIST.md) - Checklist executável por fase
- [`Resource_Details_Models.md`](./Resource_Details_Models.md) - PRD original (referência)

**Resumo Arquitetural:**
- 👤 **Autoria:** Modelo Author desacoplado de User + curadoria editorial
- ⭐ **Reviews:** Sistema com moderação (PENDING → APPROVED/REJECTED/FLAGGED)
- 💾 **Interações:** UserResourceInteraction unificado (Salvar, Planejar, Download)
- 🔗 **Relacionamentos:** RelatedResource unidirecional com scoring (1-5)
- 🎓 **Conteúdo Pedagógico:** JSON com Objectives + Steps (flexível, sem migrations)
- 📈 **Métricas:** Lazy aggregate (Fase 1) → Materialized View (Fase 2)

**Decisões Arquitetais Aplicadas:**
- UUID Postgres padrão (conforme projeto)
- Soft delete com `archivedAt`
- Índices otimizados para cada use case
- Validação JSON em aplicação (Zod)
- Performance < 100ms com query lazy

**Fases:**
1. Autoria + Metadados (5-6h)
2. Reviews + Moderação (5-6h)
3. Interações do Usuário (6-8h)
4. Recursos Relacionados (5-6h)
5. Conteúdo Pedagógico (6-8h)
6. Métricas + Cache (8-10h)
7. Integração E2E + Testes (8-10h)

---

### 4. **Dashboard Loading UX Standardization (Skeleton-First)**
Status: **Draft**  
Prioridade: **Alta**  
Timeline: **36-54h em 5 fases**

Padronização de loading no dashboard com foco em skeleton 1:1, eliminação de spinner full-page e regras únicas para loading/refetch/empty/error.

**Arquivos:**
- [`dashboard-loading-skeleton-standardization.md`](./dashboard-loading-skeleton-standardization.md) - PRD principal com princípios, fases, critérios e checklist

**Resumo:**
- ❌ **Problema:** cada rota carrega de um jeito (spinner, skeleton parcial, render antecipada)
- ✅ **Solução:** padrão único `loading.tsx` + skeleton de layout equivalente por rota
- 🧭 **Piloto:** `/resources` e `/resources/[id]`
- 🎯 **Resultado Esperado:** UX consistente e sem flicker perceptível no dashboard

---

## 🎯 Roadmap de Implementação

```
SEMANA 1-2:
├─ PIX Automatic Failure (Fase 1 - MVP)
│  └─ Email + WhatsApp + Retry Manual (8h)
└─ PIX Checkout UX (Fase 1 - Email)
   └─ Email com QR Code (5h)

SEMANA 3:
├─ PIX Automatic Failure (Fase 2)
│  └─ Retry Automático (12h)
└─ PIX Checkout UX (Fase 2-3)
   └─ WhatsApp + Reenvio (11h)

SEMANA 4:
├─ PIX Automatic Failure (Fase 3)
│  └─ Dashboard UX (10h)
└─ PIX Checkout UX (Fase 4)
   └─ Persistência BD (4h)
```

Total estimado: **50 horas em 4 semanas**

---

## 🚀 Como Usar Este Diretório

Cada PRD é um documento independente que pode ser:
- **Compartilhado** com stakeholders para aprovação
- **Referenciado** durante desenvolvimento
- **Atualizado** conforme learnings
- **Arquivado** quando feature está em produção

### Estrutura de Um PRD

```
1. Visão Geral          - O que é esta feature?
2. Problema             - Por que ela é necessária?
3. Objetivos            - Qual é o resultado esperado?
4. Escopo               - O que entra e o que não entra?
5. Solução Proposta     - Como vamos implementar?
6. User Experience      - Como o usuário vê isso?
7. Implementação        - Arquitetura técnica e plano de trabalho
8. Critério de Aceitação - Quando está pronto?
9. Métricas de Sucesso  - Como medimos?
10. Timeline            - Quanto tempo vai levar?
11. Riscos              - O que pode dar errado?
```

---

## 📊 Status de PRDs

| Feature | Status | Prioridade | Fase |
|---------|--------|-----------|------|
| PIX Automatic Failure Handling | Draft | Alta | Design |
| PIX Checkout UX | Draft | Média | Design |
| **Resource Details** | **Pronto para Implementação** | **Alta** | **Fase 1** |
| Dashboard Loading UX Standardization | Draft | Alta | Planejamento |

---

## 📚 Referências

- [Better Auth Documentation](https://www.better-auth.com/)
- [Asaas API Docs](https://docs.asaas.com/)
- [Resend Email Service](https://resend.com/)
- [UAZAPI WhatsApp](https://docs.uazapi.com/)

---

**Última Atualização:** 2026-04-19
