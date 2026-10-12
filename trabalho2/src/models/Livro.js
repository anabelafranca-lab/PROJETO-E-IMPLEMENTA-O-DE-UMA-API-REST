'use strict';

const { LivroIndisponivelError } = require('../errors/erros');

// Regra de domínio: gêneros são tratados sem diferenciar maiúsculas de
// minúsculas e nunca se repetem. (No Trabalho 2 essa regra estava escondida
// dentro de um repositório; agora pertence ao domínio.)
const normalizarGeneros = (generos = []) => [...new Set(generos.map((g) => g.toLowerCase()))];

class Livro {
  constructor({
    id = null,
    titulo,
    autor,
    isbn,
    anoPublicacao,
    quantidadeTotal,
    quantidadeDisponivel,
    generos = [],
    createdAt = null,
    updatedAt = null
  }) {
    this.id = id;
    this.titulo = titulo;
    this.autor = autor;
    this.isbn = isbn;
    this.anoPublicacao = anoPublicacao;
    this.quantidadeTotal = quantidadeTotal;
    this.quantidadeDisponivel = quantidadeDisponivel;
    this.generos = [...generos];
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Novo livro: se o estoque disponível não for informado, todos os
  // exemplares estão disponíveis.
  static criar(dados) {
    return new Livro({
      ...dados,
      quantidadeDisponivel: dados.quantidadeDisponivel ?? dados.quantidadeTotal,
      generos: normalizarGeneros(dados.generos)
    });
  }

  // PUT: substituição completa dos dados do livro.
  substituir(dados) {
    this.titulo = dados.titulo;
    this.autor = dados.autor;
    this.isbn = dados.isbn;
    this.anoPublicacao = dados.anoPublicacao;
    this.quantidadeTotal = dados.quantidadeTotal;
    this.quantidadeDisponivel = dados.quantidadeDisponivel ?? dados.quantidadeTotal;
    this.generos = normalizarGeneros(dados.generos);
  }

  // PATCH: só os campos informados mudam.
  atualizar(dados) {
    for (const campo of ['titulo', 'autor', 'isbn', 'anoPublicacao', 'quantidadeTotal', 'quantidadeDisponivel']) {
      if (dados[campo] !== undefined) this[campo] = dados[campo];
    }
    if (dados.generos) this.generos = normalizarGeneros(dados.generos);
  }

  temExemplarDisponivel() {
    return this.quantidadeDisponivel >= 1;
  }

  // Invariante central do domínio: não se empresta o que não está disponível.
  emprestarExemplar() {
    if (!this.temExemplarDisponivel()) throw new LivroIndisponivelError(this.titulo);
    this.quantidadeDisponivel -= 1;
  }

  reporExemplar() {
    this.quantidadeDisponivel += 1;
  }
}

module.exports = Livro;
