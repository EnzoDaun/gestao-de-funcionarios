# Backend — API REST de Funcionários

API REST construída com Node.js, Express e TypeScript. Banco de dados MySQL via Knex.

---

## Tecnologias

| Pacote         | Função                                 |
|----------------|----------------------------------------|
| Express        | Framework HTTP                         |
| TypeScript     | Tipagem estática                       |
| Knex           | Query builder e migrations             |
| mysql2         | Driver do MySQL                        |
| multer         | Upload de arquivos (import .xlsx)      |
| xlsx (SheetJS) | Leitura e geração de planilhas         |
| uuid           | Geração de chaves primárias            |
| Jest + ts-jest | Testes unitários                       |

---

## Estrutura de pastas

```
src/
├── server.ts                        # Ponto de entrada — inicia o servidor
├── app.ts                           # Configura o Express e registra as rotas
├── types/
│   └── employee.ts                  # Interfaces TypeScript do domínio
├── db/
│   ├── knex.ts                      # Instância compartilhada do banco
│   ├── migrations/
│   │   └── 20250101000000_create_employees.ts
│   └── seeds/
│       └── 01_employees.ts          # 10 funcionários de exemplo
├── repositories/
│   └── employee.repository.ts       # Queries SQL — única camada que acessa o banco
├── services/
│   └── employee.service.ts          # Lógica de negócio e validação
├── controllers/
│   └── employee.controller.ts       # Recebe HTTP, chama o service, responde
├── routes/
│   └── employee.routes.ts           # Define os endpoints e seus handlers
└── middlewares/
    └── error.middleware.ts          # Padroniza respostas de erro
```

---

## Como rodar localmente

**Pré-requisitos:** Node.js 18+ e MySQL 8 rodando localmente.

```bash
cd backend
npm install
```

Configure as variáveis de ambiente (ou use os valores padrão do `knexfile.js`):

```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=root
export DB_NAME=employees_db
```

Rode as migrations e o seed:

```bash
npm run migrate
npm run seed
```

Inicie o servidor em modo de desenvolvimento (com hot reload):

```bash
npm run dev
```

A API estará disponível em `http://localhost:3000`.

---

## Scripts disponíveis

| Script                  | O que faz                                      |
|-------------------------|------------------------------------------------|
| `npm run dev`           | Inicia em desenvolvimento com hot reload       |
| `npm run build`         | Compila TypeScript para `dist/`                |
| `npm start`             | Inicia a versão compilada (produção)           |
| `npm run migrate`       | Aplica as migrations pendentes                 |
| `npm run migrate:rollback` | Desfaz a última migration                  |
| `npm run seed`          | Insere os dados de exemplo                     |
| `npm test`              | Roda os testes unitários                       |

---

## Endpoints

Todos os endpoints ficam sob o prefixo `/funcionarios`.

| Método | Rota                      | Descrição                        |
|--------|---------------------------|----------------------------------|
| GET    | /funcionarios             | Lista com paginação e filtros    |
| POST   | /funcionarios             | Cria um funcionário              |
| GET    | /funcionarios/:uuid       | Busca um funcionário pelo UUID   |
| PUT    | /funcionarios/:uuid       | Atualiza um funcionário          |
| DELETE | /funcionarios/:uuid       | Remove um funcionário            |
| POST   | /funcionarios/import      | Importa planilha `.xlsx`         |
| GET    | /funcionarios/export      | Exporta planilha `.xlsx`         |
| GET    | /health                   | Health check da API              |

### Parâmetros do GET /funcionarios

| Parâmetro | Tipo   | Descrição                             |
|-----------|--------|---------------------------------------|
| page      | number | Página atual (padrão: 1)              |
| limit     | number | Itens por página (padrão: 10)         |
| name      | string | Filtra por nome (parcial)             |
| role      | string | Filtra por cargo (parcial)            |
| status    | string | Filtra por status (exato)             |
| sort      | string | Ordena por: name, role, salary, contract_date, status |

**Resposta:**

```json
{
  "data": [...],
  "meta": {
    "total": 20,
    "page": 1,
    "totalPages": 2
  }
}
```

### POST /funcionarios/import

Envie um arquivo `.xlsx` via `multipart/form-data` usando o campo `file`.
A primeira linha da planilha deve ser o cabeçalho com os nomes exatos das colunas:
`name`, `address`, `neighborhood`, `zipcode`, `phone`, `salary`, `contract_date`, `role`, `status`.

**Resposta:**

```json
{
  "total": 10,
  "inseridos": 8,
  "rejeitados": 2
}
```

### Erros

Todos os erros retornam no mesmo formato:

```json
{
  "error": "Mensagem descrevendo o problema"
}
```

---

## Testes

```bash
npm test
```

Os testes são unitários — não precisam de banco de dados. O repositório é substituído por um mock (`jest.fn()`), permitindo testar a lógica do service de forma isolada.

**Cobertura atual:** 8 testes — validação de campos obrigatórios, criação de funcionário, tratamento de não-encontrado e estrutura de resposta paginada.

---

## Variáveis de ambiente

| Variável    | Padrão       | Descrição             |
|-------------|-------------|-----------------------|
| DB_HOST     | localhost   | Host do MySQL         |
| DB_PORT     | 3306        | Porta do MySQL        |
| DB_USER     | root        | Usuário do MySQL      |
| DB_PASSWORD | root        | Senha do MySQL        |
| DB_NAME     | employees_db| Nome do banco         |
| PORT        | 3000        | Porta da API          |
