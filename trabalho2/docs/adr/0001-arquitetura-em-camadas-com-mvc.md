# ADR-0001 — Arquitetura em camadas com MVC e regra de dependência para dentro

- **Status:** aceita
- **Data:** 2026-10

## Contexto
No Trabalho 2, os controllers conheciam repositórios e Sequelize, devolviam instâncias do ORM direto no
`res.json(...)` e continham regras de negócio (ex.: "livro com empréstimo ativo não pode ser removido").
As regras só podiam ser testadas passando por HTTP e banco de dados, e qualquer mudança no ORM
atravessava toda a aplicação.

## Decisão
Organizar o código em camadas — `routes → controllers → services → repositories` — com `models`
(entidades de domínio), `dtos`, `errors`, `events` e `middlewares` de apoio. A dependência aponta sempre para
dentro: o domínio não importa Express nem ORM; **nenhuma camada pula níveis**; a camada de serviço **não
conhece `req` nem `res`**. A regra é imposta por ESLint e por `tests/arquitetura.test.js`.

## Consequências
- ✅ Regras de negócio vivem em `services`/`models` e são testáveis sem HTTP nem banco.
- ✅ Violações da arquitetura quebram o build em vez de dependerem de revisão humana.
- ✅ Trocar o framework web ou o ORM afeta uma camada só.
- ⚠️ Mais arquivos e mais indireção para um CRUD pequeno. Aceito de propósito: o objetivo do trabalho é
  "fazer durar", e o custo é pago uma vez.

## Alternativas consideradas
Manter MVC "clássico" sem camada de serviço (rejeitado: a regra de negócio voltaria para o controller).
