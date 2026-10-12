const { criarContainer } = require('../../src/config/container');
const { criarApp } = require('../../src/app');

// Monta a aplicação completa para os testes HTTP. O driver de persistência vem de
// REPOSITORY_DRIVER (padrão "sequelize"); `npm run test:memoria` roda a MESMA
// suíte contra os repositórios em memória.
function criarAppDeTeste(opcoes = {}) {
  const container = criarContainer(opcoes);
  return { app: criarApp(container), container };
}

module.exports = { criarAppDeTeste };
