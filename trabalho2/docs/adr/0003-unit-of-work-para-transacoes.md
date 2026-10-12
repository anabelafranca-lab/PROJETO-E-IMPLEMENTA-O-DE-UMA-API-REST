# ADR-0003 — Unit of Work para transações sem vazar o ORM

- **Status:** aceita
- **Data:** 2026-10

## Contexto
"Registrar empréstimo + baixar estoque" precisa ser atômico. No T2, isso era feito por
`sequelize.transaction` **dentro do repositório**, junto com a regra "sem estoque não empresta" — ou seja, regra
de negócio na camada de persistência. Mover a transação para o serviço exigiria que ele conhecesse o ORM.

## Decisão
Introduzir o contrato `UnitOfWork.executar(trabalho)`. O serviço descreve **o que** fazer; a Unit of Work
entrega repositórios ligados à mesma transação e decide **como** confirmar (commit) ou desfazer (rollback).
A regra de negócio ("não se empresta sem exemplar") passa a viver na entidade `Livro`
(`emprestarExemplar()`). Há implementação Sequelize (transação gerenciada) e em memória (rollback por *snapshot*).
Eventos de domínio são publicados **somente depois** do commit.

## Consequências
- ✅ Regras de negócio no domínio; transação continua atômica; o serviço segue sem conhecer o ORM.
- ✅ Rollback verificado por teste (falha simulada após criar o empréstimo ⇒ nada permanece gravado).
- ⚠️ Mais um conceito para aprender. Compensa: sem ele, ou a regra ficava presa no repositório, ou o ORM vazava.
- ⚠️ A Unit of Work em memória serializa as transações (fila); suficiente para este escopo.
