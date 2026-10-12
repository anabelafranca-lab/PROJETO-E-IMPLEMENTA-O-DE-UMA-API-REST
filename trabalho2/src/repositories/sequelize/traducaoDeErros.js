'use strict';

const {
  ErroDaAplicacao,
  EntradaInvalidaError,
  RegistroDuplicadoError,
  IntegridadeReferencialError,
  FalhaDeConexaoError
} = require('../../errors/erros');

/**
 * Tradutor de erros do Sequelize/SGBD para erros da aplicação.
 *
 * Fica dentro da camada de persistência de propósito: nenhum código fora dela
 * precisa saber que existe um `SequelizeUniqueConstraintError`. Os serviços e
 * controladores só veem `RegistroDuplicadoError`, `IntegridadeReferencialError`...
 * (e a mensagem bruta do banco nunca chega ao cliente).
 */
function traduzirErro(erro) {
  if (erro instanceof ErroDaAplicacao) return erro; // já é um erro da aplicação (ex.: regra de negócio)

  switch (erro.name) {
    case 'SequelizeUniqueConstraintError':
      return new RegistroDuplicadoError(erro.errors?.[0]?.path || 'campo único');
    case 'SequelizeForeignKeyConstraintError':
      return new IntegridadeReferencialError();
    case 'SequelizeValidationError':
      return new EntradaInvalidaError(erro.errors.map((e) => `${e.path}: ${e.message}`).join('; '));
    case 'SequelizeConnectionError':
    case 'SequelizeConnectionRefusedError':
      return new FalhaDeConexaoError();
    default:
      return erro;
  }
}

// Executa `fn` e converte qualquer erro do ORM em erro da aplicação.
async function traduzindo(fn) {
  try {
    return await fn();
  } catch (erro) {
    throw traduzirErro(erro);
  }
}

module.exports = { traduzirErro, traduzindo };
