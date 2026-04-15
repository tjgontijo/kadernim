# Product Requirements Documents

Documentação de requisitos técnicos e de produto para features em desenvolvimento.

## 📋 Documentos

### 1. **PIX Automatic Failure Handling**
Status: **Draft**  
Prioridade: **Alta**

Tratamento completo de falhas em pagamentos PIX automático, incluindo notificações via Email + WhatsApp, retry automático, e visibilidade no dashboard.

**Arquivos:**
- [`pix-automatic-failure-handling.md`](./pix-automatic-failure-handling.md) - PRD principal com escopo, solução e timeline
- [`pix-failure-implementation-guide.md`](./pix-failure-implementation-guide.md) - Guia técnico detalhado para desenvolvimento

**Resumo:**
- ❌ **Problema Atual:** Usuário não sabe que perdeu acesso quando PIX falha
- ✅ **Solução:** Notificar + oferec reativação + exibir status no dashboard
- ⏱️ **Timeline:** 30 horas em 3 fases
- 📧 **Delivery:** Email (Resend) + WhatsApp (UAZAPI)
- 🎯 **Resultado Esperado:** Churn -40%, Reativação +60%

**Próximos Passos:**
1. [ ] Revisar e aprovar PRD
2. [ ] Implementar Fase 1 (MVP: Email + WhatsApp + Retry Manual)
3. [ ] Deploy + Testes
4. [ ] Implementar Fase 2 (Retry Automático com Jobs)
5. [ ] Implementar Fase 3 (Dashboard UX)

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

---

## 📚 Referências

- [Better Auth Documentation](https://www.better-auth.com/)
- [Asaas API Docs](https://docs.asaas.com/)
- [Resend Email Service](https://resend.com/)
- [UAZAPI WhatsApp](https://docs.uazapi.com/)

---

**Última Atualização:** 2026-04-15
