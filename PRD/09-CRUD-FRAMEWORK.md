# PRD 09: Framework de CRUD Padronizado e Reutilizável

## 1. Visão Geral
Atualmente, as telas de administração (Usuários, Recursos) seguem padrões visuais semelhantes, mas o código é replicado e adaptado manualmente. O objetivo deste PRD é definir um framework interno de componentes e hooks para permitir a criação de novos CRUDs com o mínimo de código repetitivo, garantindo a mesma experiência "Premium" (animações fluidas, 100vh, containers 7xl) em todo o sistema.

## 2. Objetivos Principais
- **Velocidade de Desenvolvimento**: Reduzir o tempo de criação de um CRUD simples de horas para minutos.
- **Consistência de UI/UX**: Garantir que todos os Draweres abram com a mesma suavidade e que as tabelas tenham as mesmas funcionalidades de filtro/busca.
- **Manutenibilidade**: Centralizar a lógica de animação, erros de API e permissões em um único lugar.
- **Segurança Nativa**: Integrar validação de cargo (role) diretamente nos componentes de ação.

## 3. Arquitetura do Framework

### 3.1 O Hook Central: `useDataTable`
Um hook genérico que gerencia:
- Estado da query (React Query).
- Filtros, busca e paginação.
- Alternância de visualização (List vs. Cards).
- Estado do item sendo criado ou editado.

### 3.2 O Componente de Layout: `CrudPageShell`
Wrapper principal da página que organiza:
- Cabeçalho com título, subtítulo e botão de ação ("Novo").
- Toolbar de dados (busca, filtros, seletor de visualização).
- Área de conteúdo com scroll independente.
- Paginação fixa no rodapé.

### 3.3 O Componente de Gaveta: `CrudEditDrawer`
A "carcaça" do editor:
- Ocupa 100vh.
- Animação `cubic-bezier(0.32, 0.72, 0, 1)`.
- Largura máxima configurável (default `max-w-7xl`).
- Rodapé padrão com botões de "Salvar" e "Descartar".
- Recebe o formulário específico via `children` ou render prop.

### 3.4 Gestão de Permissões: `PermissionGuard`
Um componente que envolve ações críticas:
- Compara o cargo do usuário logado com as permissões exigidas.
- Esconde ou desabilita botões caso o usuário não tenha acesso.
- Bloqueia visualização de abas sensíveis.

## 4. Estudo de Caso: CRUD de Matérias (Subjects)
Usaremos a model `Subject` para validar o framework.

### Requisitos Técnicos:
- **Campos**: Nome, Slug.
- **Ações**: Listar, Buscar por nome, Criar, Editar Nome, Excluir.
- **Permissão**: Apenas usuários com role `admin` podem gerenciar matérias.

## 5. Fluxo do Usuário
1. O usuário entra em `/admin/subjects`.
2. A tela exibe um shell padronizado.
3. Ao clicar em "+ Matéria", o `CrudEditDrawer` abre suavemente em 100vh.
4. O formulário é enviado via API padronizada.
5. Em caso de sucesso, o drawer fecha e a listagem é atualizada automaticamente.

## 6. Critérios de Aceite
- [ ] A animação do drawer deve ser idêntica à de Usuários/Recursos.
- [ ] O componente deve ser flexível o suficiente para suportar tabelas com diferentes colunas.
- [ ] A lógica de API deve tratar erros globais (401, 403, 500) automaticamente.
- [ ] O código deve ser TypeScript Strict para evitar erros de tipagem.
