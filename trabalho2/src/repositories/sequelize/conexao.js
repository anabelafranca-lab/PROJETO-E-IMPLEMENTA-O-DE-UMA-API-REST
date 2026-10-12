'use strict';

const { Sequelize } = require('sequelize');
const configuracoes = require('./configuracao');
const { definirModelos } = require('./models');

/**
 * SINGLETON da conexão com o banco.
 *
 * Por que um Singleton aqui (e só aqui)? Uma instância do Sequelize mantém um
 * pool de conexões. Criar uma por repositório (ou por requisição) abriria
 * dezenas de conexões e, no SQLite, causaria erros de "database is locked".
 * Precisamos de EXATAMENTE uma por processo. Usamos um módulo com estado
 * preguiçoso em vez de uma classe com `getInstance()` — é a forma idiomática
 * de Singleton em Node, e `encerrarConexao()` permite fechar e recriar nos testes.
 */
let estado = null;

function obterConexao() {
  if (!estado) {
    const ambiente = process.env.NODE_ENV || 'development';
    const config = configuracoes[ambiente];
    const sequelize = new Sequelize(config.database, config.username, config.password, config);
    estado = { sequelize, modelos: definirModelos(sequelize) };
  }
  return estado;
}

async function encerrarConexao() {
  if (estado) {
    await estado.sequelize.close();
    estado = null;
  }
}

module.exports = { obterConexao, encerrarConexao };
