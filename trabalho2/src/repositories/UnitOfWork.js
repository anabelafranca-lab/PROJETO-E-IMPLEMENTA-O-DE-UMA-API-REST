'use strict';

const { naoImplementado } = require('./contrato');

/**
 * CONTRATO da Unidade de Trabalho (Unit of Work).
 *
 *   executar(trabalho) -> Promise<resultado de trabalho>
 *
 * `trabalho` é uma função que recebe `{ livros, estudantes, emprestimos }`
 * — repositórios já ligados à MESMA transação. Se `trabalho` terminar
 * normalmente, tudo é confirmado (commit); se lançar qualquer erro, tudo é
 * desfeito (rollback) e o erro é propagado.
 *
 * Isso permite que um caso de uso (ex.: registrar empréstimo + baixar
 * estoque) seja atômico SEM que o serviço conheça `sequelize.transaction`.
 */
class UnitOfWork {}
UnitOfWork.prototype.executar = naoImplementado('UnitOfWork', 'executar');

module.exports = UnitOfWork;
