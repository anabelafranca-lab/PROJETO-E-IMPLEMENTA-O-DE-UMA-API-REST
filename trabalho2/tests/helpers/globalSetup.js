const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Roda uma vez antes de toda a suíte. Com o driver "sequelize" (padrão), recria o
// banco de teste do zero a partir das migrations e do seed REAIS do projeto.
// Com `REPOSITORY_DRIVER=memory` não há banco: nada a preparar.
module.exports = async function globalSetup() {
  if (process.env.REPOSITORY_DRIVER === 'memory') return;

  const caminhoDoBanco = path.join(__dirname, '..', '..', 'data', 'test.sqlite3');
  if (fs.existsSync(caminhoDoBanco)) fs.unlinkSync(caminhoDoBanco);

  const env = { ...process.env, NODE_ENV: 'test' };
  execSync('npx sequelize-cli db:migrate --env test', { stdio: 'ignore', env });
  execSync('npx sequelize-cli db:seed:all --env test', { stdio: 'ignore', env });
};
