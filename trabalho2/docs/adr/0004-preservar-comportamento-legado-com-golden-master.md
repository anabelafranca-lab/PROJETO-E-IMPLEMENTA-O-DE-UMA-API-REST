# ADR-0004 — Preservar o comportamento do T2 (inclusive imperfeições) e prová-lo com golden master

- **Status:** aceita
- **Data:** 2026-10

## Contexto
O enunciado exige que a API continue "idêntica" para quem a consome. Revisando o T2, apareceram
comportamentos que parecem defeitos, mas que são **contrato de fato**: JSON malformado responde `500`;
filtrar por gênero devolve só o gênero filtrado em `generos`; `POST /estudantes` não traz `deletedAt`;
`POST /emprestimos` não traz `dataDevolucaoReal` (efeitos colaterais de devolver objetos do ORM).

## Decisão
- **Não corrigir nada durante a refatoração.** Refatorar é mudar a estrutura, não o comportamento;
  corrigir é outra mudança, com versão e justificativa próprias.
- Replicar esses formatos **de forma explícita e documentada** nos DTOs (`saidaCriacao`) e nos repositórios.
- Provar a equivalência com um **golden master**: 88 requisições executadas contra o código original do T2
  tiveram status e corpo gravados; `tests/preservacao.test.js` exige resposta idêntica na versão nova.
  Os 28 testes HTTP do T2 foram portados sem alterar asserções, e a coleção Postman roda via Newman.

## Consequências
- ✅ A equivalência é verificada mecanicamente, passo a passo, a cada commit (refatoração segura).
- ✅ Os pontos legados estão catalogados em `ARQUITETURA.md` §6, prontos para uma futura v2.
- ⚠️ O código carrega pequenas "concessões" (ex.: `saidaCriacao`). São visíveis e comentadas, não escondidas.
