'use strict';

/**
 * Gera `postman_collection.json` a partir da sequência de caracterização
 * (tests/golden/sequencia.js) e dos status/erros gravados do Trabalho 2
 * (tests/golden/comportamento-trabalho2.json). Cada requisição vira um item
 * com testes automáticos (`pm.test`) — assim a coleção do Postman e o golden
 * master nunca divergem. Uso: node scripts/gerarColecaoPostman.js
 */
const fs = require('fs');
const path = require('path');
const { sequencia } = require('../tests/golden/sequencia');

const esperado = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'tests', 'golden', 'comportamento-trabalho2.json'), 'utf8'));

function testesDoItem(passo, resposta) {
  const linhas = [`pm.test('status ${resposta.status}', function () { pm.response.to.have.status(${resposta.status}); });`];
  const corpo = resposta.corpo;

  if (corpo && corpo.erro) {
    linhas.push(
      `pm.test('erro padronizado: ${corpo.erro.codigo}', function () { pm.expect(pm.response.json().erro.codigo).to.eql(${JSON.stringify(corpo.erro.codigo)}); });`
    );
  } else if (corpo && corpo.dados && corpo.paginacao) {
    linhas.push(
      `pm.test('lista paginada (total ${corpo.paginacao.total})', function () { const j = pm.response.json(); pm.expect(j.dados).to.be.an('array'); pm.expect(j.paginacao.total).to.eql(${corpo.paginacao.total}); });`
    );
  } else if (corpo && corpo.id !== undefined) {
    linhas.push(`pm.test('devolve o recurso com id ${corpo.id}', function () { pm.expect(pm.response.json().id).to.eql(${corpo.id}); });`);
  }
  return linhas;
}

function montarItem(passo, resposta) {
  const requisicao = { method: passo.metodo, header: [], url: `{{baseUrl}}${passo.caminho}` };
  if (passo.bruto !== undefined || passo.corpo !== undefined) {
    requisicao.header.push({ key: 'Content-Type', value: 'application/json' });
    requisicao.body = { mode: 'raw', raw: passo.bruto !== undefined ? passo.bruto : JSON.stringify(passo.corpo, null, 2) };
  }
  return {
    name: `${passo.nome} [${resposta.status}]`,
    event: [{ listen: 'test', script: { type: 'text/javascript', exec: testesDoItem(passo, resposta) } }],
    request: requisicao
  };
}

// As requisições são dependentes de estado; os grupos são CONTÍGUOS para preservar a ordem.
const inicioEstudantes = sequencia.findIndex((p) => p.nome.startsWith('estudantes:'));
const inicioEmprestimos = sequencia.findIndex((p) => p.nome.startsWith('empréstimos:'));
const inicioLivros = sequencia.findIndex((p) => p.nome.startsWith('livros:'));

const grupos = [
  ['0 - Geral', 0, inicioLivros],
  ['1 - Livros', inicioLivros, inicioEstudantes],
  ['2 - Estudantes', inicioEstudantes, inicioEmprestimos],
  ['3 - Empréstimos e transações', inicioEmprestimos, sequencia.length]
];

const colecao = {
  info: {
    name: 'API Biblioteca Escolar — Trabalho 3 (comportamento idêntico ao Trabalho 2)',
    description:
      'Cobre todos os endpoints e os casos de erro (400/404/409). Execute os itens EM ORDEM, contra um banco recém-semeado (as requisições dependem de estado). Via linha de comando: npm run test:postman',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  variable: [{ key: 'baseUrl', value: 'http://localhost:3000' }],
  item: grupos.map(([nome, de, ate]) => ({
    name: nome,
    item: sequencia.slice(de, ate).map((passo, i) => montarItem(passo, esperado[de + i]))
  }))
};

fs.writeFileSync(path.join(__dirname, '..', 'postman_collection.json'), JSON.stringify(colecao, null, 2));
console.log(`postman_collection.json gerado com ${sequencia.length} requisições em ${grupos.length} pastas.`); // eslint-disable-line no-console
