# Gestão de Funcionários

Aplicação Full Stack para gerenciamento de funcionários.

**Stack:** Node.js + Express + TypeScript · MySQL 8 · Vue 3 · Docker

---

## Como subir com Docker Compose

Com o Docker Desktop aberto, rode na raiz do projeto:

```bash
docker compose up -d --build
```

Na primeira execução, aguarde cerca de **40 segundos** para o MySQL inicializar. O Docker Compose automaticamente roda as migrations e popula o banco com dados de exemplo antes de iniciar a API.

| Serviço  | Endereço                        |
|----------|---------------------------------|
| Frontend | http://localhost:8080           |
| API      | http://localhost:3000           |
| MySQL    | localhost:3307                  |

> **Porta 3307:** usada no host para evitar conflito com MySQL instalado localmente. Dentro do Docker, a comunicação entre os serviços continua usando a porta padrão 3306.

Para acompanhar os logs em tempo real:

```bash
docker compose logs -f api
```

Para parar tudo:

```bash
docker compose down
```

---

## Como rodar as migrations

As migrations rodam automaticamente ao subir com Docker Compose. Se precisar rodá-las manualmente:

```bash
cd backend
npm install
npm run migrate
```

Para desfazer a última migration:

```bash
npm run migrate:rollback
```

Para popular o banco com os dados de exemplo:

```bash
npm run seed
```

---

## Como acessar a API

A API fica disponível em `http://localhost:3000`.

| Método | Endpoint                  | Descrição                        |
|--------|---------------------------|----------------------------------|
| GET    | /funcionarios             | Lista com paginação e filtros    |
| POST   | /funcionarios             | Cria um funcionário              |
| GET    | /funcionarios/:uuid       | Busca um funcionário pelo UUID   |
| PUT    | /funcionarios/:uuid       | Atualiza um funcionário          |
| DELETE | /funcionarios/:uuid       | Remove um funcionário            |
| POST   | /funcionarios/import      | Importa planilha `.xlsx`         |
| GET    | /funcionarios/export      | Exporta planilha `.xlsx`         |
| GET    | /health                   | Verifica se a API está no ar     |

**Filtros disponíveis no GET /funcionarios:**

```
GET /funcionarios?page=1&limit=10&name=ana&role=dev&status=Ativo&sort=name
```

**Exemplo de criação:**

```json
POST /funcionarios
{
  "name": "João Silva",
  "address": "Rua A, 123",
  "salary": 4500.00,
  "contract_date": "2024-01-15",
  "role": "Desenvolvedor",
  "status": "Ativo"
}
```

---

## Como rodar os testes

Os testes são unitários e **não precisam do banco rodando**.

```bash
cd backend
npm install
npm test
```

Resultado esperado: **8 testes passando** — 4 de validação e 4 do service.

---

## Estrutura do projeto

```
employees-app/
├── docker-compose.yml
├── README.md
├── backend/          # API REST — veja backend/README.md
└── frontend/         # Interface Vue 3 — veja frontend/README.md
```
