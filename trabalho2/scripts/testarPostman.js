'use strict';

/**
 * Executa a coleção do Postman com o Newman contra uma instância REAL da API,
 * subida num banco recém-criado (migrate + seed) — ou, com `--memoria`, com os
 * repositórios em memória. Termina com código != 0 se qualquer requisição falhar.
 * Uso: npm run test:postman   |   node scripts/testarPostman.js --memoria
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const newman = require('newman');

const usarMemoria = process.argv.includes('--memoria');
const caminhoDoBanco = path.join(__dirname, '..', 'data', 'postman.sqlite3');

process.env.NODE_ENV = 'test'; // logger silencioso
process.env.REPOSITORY_DRIVER = usarMemoria ? 'memory' : 'sequelize';
process.env.DB_STORAGE_TEST = caminhoDoBanco;

if (!usarMemoria) {
  if (fs.existsSync(caminhoDoBanco)) fs.unlinkSync(caminhoDoBanco);
  execSync('npx sequelize-cli db:migrate --env test', { stdio: 'ignore', env: process.env });
  execSync('npx sequelize-cli db:seed:all --env test', { stdio: 'ignore', env: process.env });
}

const { criarContainer } = require('../src/config/container');
const { criarApp } = require('../src/app');

const container = criarContainer();
const servidor = criarApp(container).listen(0, () => {
  const baseUrl = `http://localhost:${servidor.address().port}`;
  newman.run(
    {
      collection: require('../postman_collection.json'),
      envVar: [{ key: 'baseUrl', value: baseUrl }],
      reporters: 'cli',
      reporter: { cli: { noBanner: true } }
    },
    async (erro, resumo) => {
      servidor.close();
      await container.encerrar();
      if (!usarMemoria && fs.existsSync(caminhoDoBanco)) fs.unlinkSync(caminhoDoBanco);
      const falhas = erro ? 1 : resumo.run.failures.length;
      process.exit(falhas > 0 ? 1 : 0);
    }
  );
});
