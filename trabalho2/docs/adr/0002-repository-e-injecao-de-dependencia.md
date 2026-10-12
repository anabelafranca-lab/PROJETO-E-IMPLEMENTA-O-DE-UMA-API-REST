# ADR-0002 — Repository com contratos explícitos e Injeção de Dependência manual

- **Status:** aceita
- **Data:** 2026-10

## Contexto
Os repositórios do T2 devolviam instâncias do Sequelize, lançavam `ApiError` (classe HTTP) e abrigavam
regra de negócio (baixar estoque). Os controllers faziam `require` direto dos repositórios.
Resultado: impossível trocar a persistência, impossível testar uma regra sem SQLite.

## Decisão
1. Definir **contratos** (`LivroRepository`, `EstudanteRepository`, `EmprestimoRepository`, `UnitOfWork`)
   cujas assinaturas públicas falam só em **entidades de domínio** — nenhum tipo do ORM atravessa a fronteira.
2. Manter o Sequelize **isolado** em `src/repositories/sequelize`, que também traduz erros do banco em
   erros da aplicação (a mensagem bruta do SGBD nunca sobe).
3. Serviços e controllers recebem colaboradores **pelo construtor**. Só `src/config/container.js` usa `new`
   para compor as peças (DI manual, sem biblioteca). Uma **Factory** (`criarPersistencia`) escolhe a família
   de implementações por `REPOSITORY_DRIVER`.
4. Criar uma segunda implementação, **em memória**, para provar que a abstração é real.

## Consequências
- ✅ A **mesma suíte** (147 testes, incluindo o golden master) passa com `sequelize` e com `memory`,
  sem alterar uma linha de serviço (bônus de troca de implementação).
- ✅ Serviços testáveis com repositórios em memória ou "fakes" de poucas linhas.
- ⚠️ A implementação em memória precisa imitar o banco (UNIQUE, FK, soft delete, ordenação). Os testes
  de paridade garantem que ela não se afasta do comportamento real.

## Alternativas consideradas
Container de DI com decorators/reflexão (rejeitado: poucas dezenas de linhas de composição manual são legíveis e
não exigem "mágica"); acessar o ORM direto nos serviços (rejeitado: viola a regra de dependência).
