require('dotenv').config();

// Por padrão o projeto usa SQLite (arquivo local, zero configuração — ver
// justificativa no README). Para usar PostgreSQL/MySQL em produção, basta
// preencher as variáveis DB_DIALECT/DB_HOST/DB_USER/DB_PASS/DB_NAME/DB_PORT
// no .env; a mesma config.js atende os dois casos.
const base = {
  dialect: process.env.DB_DIALECT || 'sqlite',
  storage: process.env.DB_STORAGE || path_join('data', 'dev.sqlite3'),
  host: process.env.DB_HOST || undefined,
  port: process.env.DB_PORT || undefined,
  username: process.env.DB_USER || undefined,
  password: process.env.DB_PASS || undefined,
  database: process.env.DB_NAME || undefined,
  logging: false
};

function path_join(...parts) {
  return require('path').join(process.cwd(), ...parts);
}

module.exports = {
  development: { ...base },
  test: {
    ...base,
    storage: process.env.DB_STORAGE_TEST || path_join('data', 'test.sqlite3')
  },
  production: { ...base }
};
