'use strict';

const Livro = require('../models/Livro');
const { LivroNaoEncontradoError, LivroEmUsoError } = require('../errors/erros');

/**
 * Casos de uso de livros. Recebe suas dependências pelo construtor (injeção de
 * dependência) e depende apenas dos CONTRATOS de repositório — não sabe se o
 * armazenamento é SQLite, PostgreSQL ou memória.
 */
class LivroService {
  constructor({ livroRepository, emprestimoRepository }) {
    this.livroRepository = livroRepository;
    this.emprestimoRepository = emprestimoRepository;
  }

  listar(consulta) {
    return this.livroRepository.listar(consulta);
  }

  async obter(id) {
    const livro = await this.livroRepository.buscarPorId(id);
    if (!livro) throw new LivroNaoEncontradoError(id);
    return livro;
  }

  cadastrar(dados) {
    return this.livroRepository.criar(Livro.criar(dados));
  }

  async substituir(id, dados) {
    const livro = await this.obter(id);
    livro.substituir(dados);
    return this.livroRepository.atualizar(livro);
  }

  async atualizar(id, dados) {
    const livro = await this.obter(id);
    livro.atualizar(dados);
    return this.livroRepository.atualizar(livro);
  }

  // Regra de negócio: livro com empréstimo ativo não pode ser removido.
  async remover(id) {
    await this.obter(id);
    if (await this.emprestimoRepository.existeAtivoDoLivro(id)) throw new LivroEmUsoError(id);
    await this.livroRepository.remover(id);
  }
}

module.exports = LivroService;
