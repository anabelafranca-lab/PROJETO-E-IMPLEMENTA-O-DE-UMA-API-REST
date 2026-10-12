const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const request = require('supertest');

/**
 * TESTE DE PRESERVAÇÃO DE COMPORTAMENTO (golden master).
 *
 * Reexecuta, contra a arquitetura nova, a MESMA sequência de 88 requisições
 * que foi executada contra a implementação do Trabalho 2 (antes da refatoração)
 * e exige que cada resposta (status + corpo) seja idêntica à gravada.
 * Funciona com os dois drivers de persistência (sequelize e memory).
 */
const driver = process.env.REPOSITORY_DRIVER || 'sequelize';
const caminhoDoBanco = path.join(__dirname, '..', 'data', 'golden.sqlite3');

// Precisa partir de um banco recém-semeado e isolado dos demais testes.
if (driver === 'sequelize') process.env.DB_STORAGE_TEST = caminhoDoBanco;

const { criarAppDeTeste } = require('./helpers/criarAppDeTeste');
const { executar, sequencia } = require('./golden/sequencia');
const esperado = JSON.parse(fs.readFileSync(path.join(__dirname, 'golden', 'comportamento-trabalho2.json'), 'utf8'));

let container;
let obtido;

beforeAll(async () => {
  if (driver === 'sequelize') {
    if (fs.existsSync(caminhoDoBanco)) fs.unlinkSync(caminhoDoBanco);
    const env = { ...process.env, NODE_ENV: 'test' };
    execSync('npx sequelize-cli db:migrate --env test', { stdio: 'ignore', env });
    execSync('npx sequelize-cli db:seed:all --env test', { stdio: 'ignore', env });
  }
  const montado = criarAppDeTeste();
  container = montado.container;
  obtido = await executar(request, montado.app);
}, 60000);

afterAll(async () => {
  await container.encerrar();
  if (driver === 'sequelize' && fs.existsSync(caminhoDoBanco)) fs.unlinkSync(caminhoDoBanco);
});

describe(`Preservação do comportamento do Trabalho 2 (driver: ${driver})`, () => {
  it('a sequência de caracterização tem o mesmo tamanho do golden master', () => {
    expect(sequencia.length).toBe(esperado.length);
    expect(obtido.length).toBe(esperado.length);
  });

  test.each(esperado.map((passo, indice) => [indice + 1, passo.nome]))('passo %i — %s', (numero, nome) => {
    const passo = esperado[numero - 1];
    expect(obtido[numero - 1].nome).toBe(nome);
    expect(obtido[numero - 1].status).toBe(passo.status);
    expect(obtido[numero - 1].corpo).toEqual(passo.corpo);
  });
});
