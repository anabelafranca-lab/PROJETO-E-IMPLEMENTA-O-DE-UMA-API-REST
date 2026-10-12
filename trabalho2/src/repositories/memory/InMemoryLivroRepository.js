'use strict';

const LivroRepository = require('../LivroRepository');
const Livro = require('../../models/Livro');
const { RegistroDuplicadoError } = require('../../errors/erros');
const { contem, ordenar, paginar } = require('./utilitarios');

const CAMPOS_ORDENACAO_PERMITIDOS = ['titulo', 'autor', 'anoPublicacao', 'quantidadeDisponivel', 'createdAt'];

class InMemoryLivroRepository extends LivroRepository {
  constructor({ armazenamento }) {
    super();
    this.armazenamento = armazenamento;
  }

  // Devolve SEMPRE uma cópia: quem recebe a entidade não consegue alterar o "banco" sem chamar atualizar().
  paraEntidade(registro, generosVisiveis) {
    return new Livro({ ...registro, generos: this.armazenamento.ordenarGeneros(generosVisiveis ?? registro.generos) });
  }

  ativos() {
    return this.armazenamento.livros.filter((l) => !l.deletedAt);
  }

  // Imita a restrição UNIQUE do banco: registros removidos logicamente continuam ocupando o ISBN.
  garantirIsbnUnico(isbn, idIgnorado = null) {
    if (this.armazenamento.livros.some((l) => l.isbn === isbn && l.id !== idIgnorado)) {
      throw new RegistroDuplicadoError('isbn');
    }
  }

  async listar({ filtros = {}, pagina = 1, limite = 10, ordenar: campo, direcao } = {}) {
    let itens = this.ativos();
    if (filtros.titulo) itens = itens.filter((l) => contem(l.titulo, filtros.titulo));
    if (filtros.autor) itens = itens.filter((l) => contem(l.autor, filtros.autor));
    // Mesma precedência da consulta SQL: a faixa de anos substitui o filtro de ano exato.
    if (filtros.anoMin || filtros.anoMax) {
      itens = itens.filter(
        (l) => (!filtros.anoMin || l.anoPublicacao >= filtros.anoMin) && (!filtros.anoMax || l.anoPublicacao <= filtros.anoMax)
      );
    } else if (filtros.anoPublicacao) {
      itens = itens.filter((l) => l.anoPublicacao === filtros.anoPublicacao);
    }
    if (filtros.genero) itens = itens.filter((l) => l.generos.includes(filtros.genero));

    const ordenados = ordenar(itens, { camposPermitidos: CAMPOS_ORDENACAO_PERMITIDOS, ordenar: campo, direcao });
    return {
      // Comportamento herdado do T2: filtrando por gênero, o JOIN só traz o gênero filtrado.
      itens: paginar(ordenados, pagina, limite).map((l) => this.paraEntidade(l, filtros.genero ? [filtros.genero] : undefined)),
      total: ordenados.length
    };
  }

  async buscarPorId(id) {
    const registro = this.ativos().find((l) => l.id === id);
    return registro ? this.paraEntidade(registro) : null;
  }

  async criar(livro) {
    this.garantirIsbnUnico(livro.isbn);
    const agora = new Date();
    this.armazenamento.registrarGeneros(livro.generos);
    const registro = {
      titulo: livro.titulo,
      autor: livro.autor,
      isbn: livro.isbn,
      anoPublicacao: livro.anoPublicacao,
      quantidadeTotal: livro.quantidadeTotal,
      quantidadeDisponivel: livro.quantidadeDisponivel,
      generos: [...livro.generos],
      id: this.armazenamento.proximoId.livro++,
      createdAt: agora,
      updatedAt: agora,
      deletedAt: null
    };
    this.armazenamento.livros.push(registro);
    return this.paraEntidade(registro);
  }

  async atualizar(livro) {
    const registro = this.ativos().find((l) => l.id === livro.id);
    if (!registro) return null;
    this.garantirIsbnUnico(livro.isbn, livro.id);
    this.armazenamento.registrarGeneros(livro.generos);
    Object.assign(registro, {
      titulo: livro.titulo,
      autor: livro.autor,
      isbn: livro.isbn,
      anoPublicacao: livro.anoPublicacao,
      quantidadeTotal: livro.quantidadeTotal,
      quantidadeDisponivel: livro.quantidadeDisponivel,
      generos: [...livro.generos],
      updatedAt: new Date()
    });
    return this.paraEntidade(registro);
  }

  async remover(id) {
    const registro = this.ativos().find((l) => l.id === id);
    if (!registro) return false;
    registro.deletedAt = new Date(); // soft delete
    return true;
  }
}

module.exports = InMemoryLivroRepository;
