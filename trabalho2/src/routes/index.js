'use strict';

const express = require('express');
const criarRotasLivros = require('./livros.routes');
const criarRotasEstudantes = require('./estudantes.routes');
const criarRotasEmprestimos = require('./emprestimos.routes');

// Monta todas as rotas da API sob /api/v1.
function criarRotas({ livro, estudante, emprestimo }) {
  const router = express.Router();
  router.use('/livros', criarRotasLivros({ controller: livro }));
  router.use('/estudantes', criarRotasEstudantes({ controller: estudante }));
  router.use('/emprestimos', criarRotasEmprestimos({ controller: emprestimo }));
  return router;
}

module.exports = criarRotas;
