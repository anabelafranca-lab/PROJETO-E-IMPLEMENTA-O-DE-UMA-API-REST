'use strict';

require('dotenv').config();
const path = require('path');

// Usado tanto pelo CLI do Sequelize (migrations/seeders) quanto pela conexão
// em tempo de execução — uma única fonte de verdade para a configuração do banco.
// Por padrão: SQLite (arquivo local). Para PostgreSQL/MySQL basta preencher as
// variáveis DB_* no .env.
const base = {
  dialect: process.env.DB_DIALECT || 'sqlite',
  storage: process.env.DB_STORAGE || path.join(process.cwd(), 'data', 'dev.sqlite3'),
  host: process.env.DB_HOST || undefined,
  port: process.env.DB_PORT || undefined,
  username: process.env.DB_USER || undefined,
  password: process.env.DB_PASS || undefined,
  database: process.env.DB_NAME || undefined,
  logging: false
};

module.exports = {
  development: { ...base },
  test: { ...base, storage: process.env.DB_STORAGE_TEST || path.join(process.cwd(), 'data', 'test.sqlite3') },
  production: { ...base }
};
