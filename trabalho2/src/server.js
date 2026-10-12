'use strict';

const env = require('./config/env');
const { criarContainer } = require('./config/container');
const { criarApp } = require('./app');

const container = criarContainer();
const app = criarApp(container);

const servidor = app.listen(env.porta, () => {
  container.logger.info(`Servidor rodando em http://localhost:${env.porta} (repositórios: ${env.repositoryDriver})`);
  container.logger.info(`Documentação disponível em http://localhost:${env.porta}/docs`);
});

// Encerramento limpo: para de aceitar conexões e fecha a conexão com o banco.
async function encerrar() {
  servidor.close(async () => {
    await container.encerrar();
    process.exit(0);
  });
}
process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
