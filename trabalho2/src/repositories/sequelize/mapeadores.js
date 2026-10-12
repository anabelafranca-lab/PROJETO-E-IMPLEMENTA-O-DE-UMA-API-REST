'use strict';

const Livro = require('../../models/Livro');
const Estudante = require('../../models/Estudante');
const Emprestimo = require('../../models/Emprestimo');

// Convertem linhas do ORM em ENTIDADES DE DOMÍNIO. É este arquivo que garante
// que nenhuma instância do Sequelize "vaza" pelas assinaturas públicas dos repositórios.

function paraLivro(linha) {
  if (!linha) return null;
  const dados = linha.get({ plain: true });
  return new Livro({ ...dados, generos: (dados.generos || []).map((g) => g.nome) });
}

function paraEstudante(linha) {
  if (!linha) return null;
  return new Estudante(linha.get({ plain: true }));
}

function paraEmprestimo(linha) {
  if (!linha) return null;
  const dados = linha.get({ plain: true });
  return new Emprestimo({ ...dados, livro: dados.livro });
}

module.exports = { paraLivro, paraEstudante, paraEmprestimo };
