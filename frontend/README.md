# Frontend — Interface de Gestão de Funcionários

Interface construída com Vue 3, TypeScript e Bootstrap 5.

---

## Tecnologias

| Pacote           | Função                                      |
|------------------|---------------------------------------------|
| Vue 3            | Framework reativo com Composition API       |
| TypeScript       | Tipagem estática                            |
| Vite             | Bundler e servidor de desenvolvimento       |
| Bootstrap 5      | Estilos e componentes visuais               |
| Bootstrap Icons  | Ícones                                      |
| Axios            | Chamadas HTTP para a API                    |

---

## Estrutura de pastas

```
src/
├── main.ts                          # Ponto de entrada — monta a aplicação e importa o CSS
├── App.vue                          # Componente raiz
├── types/
│   └── employee.ts                  # Interfaces TypeScript (Employee, PaginatedResult, etc.)
├── services/
│   └── api.ts                       # Todas as chamadas HTTP em um único lugar
├── views/
│   └── EmployeeList.vue             # Tela principal — gerencia estado e orquestra os componentes
└── components/
    ├── EmployeeFilters.vue           # Barra de filtros e ordenação
    ├── EmployeeTable.vue            # Tabela com loading state e badges de status
    ├── PaginationBar.vue            # Controles de paginação
    ├── EmployeeForm.vue             # Modal de criação e edição
    └── ConfirmModal.vue             # Modal de confirmação de exclusão
```

---

## Como rodar localmente

**Pré-requisito:** API rodando em `http://localhost:3000` (veja `backend/README.md`).

```bash
cd frontend
npm install
npm run dev
```

A interface estará disponível em `http://localhost:5173`.

O Vite redireciona automaticamente chamadas para `/api/...` ao backend em `localhost:3000`, sem necessidade de configurar CORS.

---

## Scripts disponíveis

| Script             | O que faz                                          |
|--------------------|----------------------------------------------------|
| `npm run dev`      | Inicia em desenvolvimento com hot reload           |
| `npm run build`    | Compila para produção na pasta `dist/`             |
| `npm run type-check` | Verifica tipos TypeScript sem compilar           |
| `npm run preview`  | Visualiza o build de produção localmente           |

---

## Funcionalidades

### Listagem de funcionários
- Tabela com paginação (5, 10, 20 ou 50 por página)
- Filtro por nome e cargo com debounce de 400ms
- Filtro por status (Ativo, Inativo, Férias, Afastado)
- Ordenação por nome, cargo, salário ou data de contrato
- Botão para limpar todos os filtros

### Criação e edição
- Modal único para criar e editar funcionários
- Validação visual com indicadores de campo inválido
- Loader no botão durante o salvamento
- Exibe a mensagem de erro da API quando o servidor rejeita os dados

### Exclusão
- Confirmação obrigatória antes de excluir
- Modal com nome do funcionário para evitar exclusões acidentais

### Importação de planilha
- Upload de arquivo `.xlsx` via botão
- Exibe resumo após o processamento: inseridos, rejeitados e total
- Recarrega a lista automaticamente após importação bem-sucedida

### Exportação de planilha
- Botão "Exportar XLSX" faz download direto
- Respeita os filtros ativos no momento da exportação
- Loader no botão durante a geração do arquivo

---

## Comunicação com a API

Todas as chamadas HTTP estão centralizadas em `src/services/api.ts`.
Em desenvolvimento, o Vite redireciona `/api/...` para `http://localhost:3000`.
Em produção (Docker), o nginx faz o mesmo redirecionamento.

O código Vue sempre usa `/api` como prefixo — nunca precisa saber em qual ambiente está rodando.
