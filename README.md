# API REST — Sistema de Biblioteca Escolar

Trabalho 1 — Design e Implementação de uma API REST.
API construída com **Node.js + Express**, dados mantidos **em memória** (sem
banco de dados nesta etapa), com documentação em **OpenAPI/Swagger**.

## Domínio escolhido

Sistema de biblioteca escolar, com três recursos principais:

| Recurso | Descrição |
|---|---|
| `/livros` | Acervo de livros disponíveis na biblioteca |
| `/estudantes` | Usuários do sistema |
| `/emprestimos` | Relação entre livros e estudantes |

O recurso `/estudantes/:id/emprestimos` é o **recurso aninhado** exigido
pelo enunciado: lista os empréstimos de um estudante específico.

### Regras de negócio implementadas

- Um livro só pode ser emprestado (`POST /emprestimos`) se
  `quantidadeDisponivel > 0`; caso contrário, retorna `409 LIVRO_INDISPONIVEL`.
- Criar um empréstimo decrementa `quantidadeDisponivel` do livro.
- Marcar um empréstimo como `devolvido` (via `PATCH /emprestimos/:id`)
  repõe `quantidadeDisponivel` do livro.
- Um livro ou estudante com empréstimo **ativo** não pode ser removido
  (`409 LIVRO_EM_USO` / `409 ESTUDANTE_COM_EMPRESTIMO_ATIVO`).
- ISBN, matrícula e e-mail são únicos (violações retornam `409`).

## Instalação e execução

Pré-requisitos: Node.js LTS instalado.

```bash
# 1. Instalar dependências
npm install

# 2. (opcional) copiar variáveis de ambiente
cp .env.example .env

# 3. Rodar em modo desenvolvimento (com reload automático)
npm run dev

# ...ou rodar normalmente
npm start
```

O servidor sobe por padrão em `http://localhost:3000`.

- Documentação interativa (Swagger UI): `http://localhost:3000/docs`
- Endpoint raiz com informações da API: `http://localhost:3000/`

### Rodando os testes automatizados (bônus)

```bash
npm test
```

Os testes usam **Jest + Supertest** e cobrem os principais fluxos de
sucesso e de erro (400, 404, 409) de cada recurso.

## Endpoints

A API é versionada em `/api/v1`.

### Livros

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/v1/livros` | Lista livros (filtros, busca, paginação, ordenação) |
| GET | `/api/v1/livros/:id` | Retorna um livro específico |
| POST | `/api/v1/livros` | Cria um novo livro |
| PUT | `/api/v1/livros/:id` | Substitui um livro existente |
| PATCH | `/api/v1/livros/:id` | Atualiza parcialmente um livro |
| DELETE | `/api/v1/livros/:id` | Remove um livro |

Query params suportados em `GET /livros`: `genero`, `titulo` (busca por
palavra-chave), `autor`, `anoPublicacao`, `ano_min`, `ano_max`,
`sort` (ex.: `sort=-anoPublicacao,titulo`), `page`, `limit`.

### Estudantes

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/v1/estudantes` | Lista estudantes (filtros, paginação) |
| GET | `/api/v1/estudantes/:id` | Retorna um estudante específico |
| GET | `/api/v1/estudantes/:id/emprestimos` | **(aninhado)** Empréstimos do estudante |
| POST | `/api/v1/estudantes` | Cria um novo estudante |
| PUT | `/api/v1/estudantes/:id` | Substitui um estudante existente |
| PATCH | `/api/v1/estudantes/:id` | Atualiza parcialmente um estudante |
| DELETE | `/api/v1/estudantes/:id` | Remove um estudante |

Query params suportados em `GET /estudantes`: `turma`, `nome` (busca),
`page`, `limit`.

### Empréstimos

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/v1/emprestimos` | Lista empréstimos (filtros, paginação) |
| GET | `/api/v1/emprestimos/:id` | Retorna um empréstimo específico |
| POST | `/api/v1/emprestimos` | Registra um novo empréstimo |
| PUT | `/api/v1/emprestimos/:id` | Substitui um empréstimo existente |
| PATCH | `/api/v1/emprestimos/:id` | Atualiza parcialmente (ex.: registrar devolução) |
| DELETE | `/api/v1/emprestimos/:id` | Remove um empréstimo |

Query params suportados em `GET /emprestimos`: `status`, `estudanteId`,
`livroId`, `page`, `limit`.

## Formato padronizado de erro

Todas as respostas de erro seguem o mesmo formato:

```json
{
  "erro": {
    "codigo": "RECURSO_NAO_ENCONTRADO",
    "mensagem": "Livro com id 42 não encontrado"
  }
}
```

Códigos HTTP utilizados: `400` (entrada inválida), `404` (recurso
inexistente), `409` (conflito) e `500` (erro interno, tratado por
middleware centralizado em `src/middlewares/erro.middleware.js`).

## Estrutura do projeto

```
trabalho1/
├── src/
│   ├── routes/            # definição das rotas HTTP
│   ├── controllers/       # lógica de negócio de cada recurso
│   ├── schemas/           # schemas de validação (Zod)
│   ├── data/
│   │   └── db-memoria.js  # dados em memória
│   ├── middlewares/
│   │   ├── erro.middleware.js
│   │   └── validacao.middleware.js
│   ├── docs/
│   │   └── openapi.yaml   # contrato OpenAPI 3.x
│   └── app.js
├── tests/                 # testes automatizados (Jest + Supertest)
├── postman_collection.json
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Como a equipe se organizou

- **Anabela França dos Santos** e **Levy Cálide Pereira** desenvolveram o
  trabalho em conjunto, atuando juntos em todas as etapas: modelagem dos
  recursos, implementação dos endpoints, validação e tratamento de erros,
  documentação OpenAPI/Swagger, coleção Postman e testes automatizados.

## Observações

- Não há persistência em banco de dados nesta etapa — os dados são
  reiniciados a cada reinício do servidor (comportamento esperado).
- A API é versionada em `/api/v1` (bônus de versionamento).
- `GET /livros` suporta filtros combinados e ordenação (bônus).
- Testes automatizados com Jest + Supertest (bônus).