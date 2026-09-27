const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Roda uma única vez, antes de qualquer arquivo de teste. Garante que os
// testes rodem contra um banco SQLite isolado (data/test.sqlite3), sempre
// recriado do zero a partir das migrations + seed reais do projeto — ou
// seja, os testes também validam que "migrate" e "seed" funcionam.
module.exports = async function globalSetup() {
  const dbPath = path.join(__dirname, '..', 'data', 'test.sqlite3');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  const env = { ...process.env, NODE_ENV: 'test' };
  execSync('npx sequelize-cli db:migrate --env test', { stdio: 'inherit', env });
  execSync('npx sequelize-cli db:seed:all --env test', { stdio: 'inherit', env });
};
