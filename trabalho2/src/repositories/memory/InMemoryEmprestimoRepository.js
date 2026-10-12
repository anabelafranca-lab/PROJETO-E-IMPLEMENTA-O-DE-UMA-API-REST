'use strict';

const EmprestimoRepository = require('../EmprestimoRepository');
const Emprestimo = require('../../models/Emprestimo');
const { IntegridadeReferencialError } = require('../../errors/erros');
const { ordenar, paginar } = require('./utilitarios');

const CAMPOS_ORDENACAO_PERMITIDOS = ['dataEmprestimo', 'dataDevolucaoPrevista', 'status', 'createdAt'];

class InMemoryEmprestimoRepository extends EmprestimoRepository {
  constructor({ armazenamento }) {
    super();
    this.armazenamento = armazenamento;
  }

  // Imita as chaves estrangeiras: a linha referenciada precisa EXISTIR
  // (mesmo que removida logicamente — a linha continua na tabela).
  garantirReferencias({ livroId, estudanteId }) {
    const livroExiste = this.armazenamento.livros.some((l) => l.id === livroId);
    const estudanteExiste = this.armazenamento.estudantes.some((e) => e.id === estudanteId);
    if (!livroExiste || !estudanteExiste) throw new IntegridadeReferencialError();
  }

  // Resumo do livro, como o JOIN do banco faria (livro removido logicamente => null).
  resumoDoLivro(livroId) {
    const livro = this.armazenamento.livros.find((l) => l.id === livroId && !l.deletedAt);
    return livro ? { id: livro.id, titulo: livro.titulo, autor: livro.autor } : null;
  }

  async listar({ filtros = {}, pagina = 1, limite = 10, ordenar: campo, direcao } = {}) {
    let itens = [...this.armazenamento.emprestimos];
    if (filtros.status) itens = itens.filter((e) => e.status === filtros.status);
    if (filtros.estudanteId) itens = itens.filter((e) => e.estudanteId === filtros.estudanteId);
    if (filtros.livroId) itens = itens.filter((e) => e.livroId === filtros.livroId);
    const ordenados = ordenar(itens, { camposPermitidos: CAMPOS_ORDENACAO_PERMITIDOS, ordenar: campo, direcao });
    return { itens: paginar(ordenados, pagina, limite).map((e) => new Emprestimo(e)), total: ordenados.length };
  }

  async listarPorEstudante(estudanteId, { filtros = {}, pagina = 1, limite = 10 } = {}) {
    let itens = this.armazenamento.emprestimos.filter((e) => e.estudanteId === estudanteId);
    if (filtros.status) itens = itens.filter((e) => e.status === filtros.status);
    const ordenados = ordenar(itens, { camposPermitidos: [], ordenar: 'id', direcao: 'asc' });
    return {
      itens: paginar(ordenados, pagina, limite).map((e) => new Emprestimo({ ...e, livro: this.resumoDoLivro(e.livroId) })),
      total: ordenados.length
    };
  }

  async buscarPorId(id) {
    const registro = this.armazenamento.emprestimos.find((e) => e.id === id);
    return registro ? new Emprestimo(registro) : null;
  }

  async criar(emprestimo) {
    this.garantirReferencias(emprestimo);
    const agora = new Date();
    const registro = {
      livroId: emprestimo.livroId,
      estudanteId: emprestimo.estudanteId,
      dataEmprestimo: emprestimo.dataEmprestimo,
      dataDevolucaoPrevista: emprestimo.dataDevolucaoPrevista,
      dataDevolucaoReal: emprestimo.dataDevolucaoReal,
      status: emprestimo.status,
      id: this.armazenamento.proximoId.emprestimo++,
      createdAt: agora,
      updatedAt: agora
    };
    this.armazenamento.emprestimos.push(registro);
    return new Emprestimo(registro);
  }

  async atualizar(emprestimo) {
    const registro = this.armazenamento.emprestimos.find((e) => e.id === emprestimo.id);
    if (!registro) return null;
    this.garantirReferencias(emprestimo);
    Object.assign(registro, {
      livroId: emprestimo.livroId,
      estudanteId: emprestimo.estudanteId,
      dataEmprestimo: emprestimo.dataEmprestimo,
      dataDevolucaoPrevista: emprestimo.dataDevolucaoPrevista,
      dataDevolucaoReal: emprestimo.dataDevolucaoReal,
      status: emprestimo.status,
      updatedAt: new Date()
    });
    return new Emprestimo(registro);
  }

  async remover(id) {
    const indice = this.armazenamento.emprestimos.findIndex((e) => e.id === id);
    if (indice === -1) return false;
    this.armazenamento.emprestimos.splice(indice, 1);
    return true;
  }

  async existeAtivoDoLivro(livroId) {
    return this.armazenamento.emprestimos.some((e) => e.livroId === livroId && e.status === 'ativo');
  }

  async existeAtivoDoEstudante(estudanteId) {
    return this.armazenamento.emprestimos.some((e) => e.estudanteId === estudanteId && e.status === 'ativo');
  }
}

module.exports = InMemoryEmprestimoRepository;
