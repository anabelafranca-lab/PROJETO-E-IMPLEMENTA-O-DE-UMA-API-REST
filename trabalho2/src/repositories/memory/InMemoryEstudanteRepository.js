'use strict';

const EstudanteRepository = require('../EstudanteRepository');
const Estudante = require('../../models/Estudante');
const { RegistroDuplicadoError } = require('../../errors/erros');
const { contem, ordenar, paginar } = require('./utilitarios');

const CAMPOS_ORDENACAO_PERMITIDOS = ['nome', 'turma', 'matricula', 'createdAt'];

class InMemoryEstudanteRepository extends EstudanteRepository {
  constructor({ armazenamento }) {
    super();
    this.armazenamento = armazenamento;
  }

  ativos() {
    return this.armazenamento.estudantes.filter((e) => !e.deletedAt);
  }

  // UNIQUE em e-mail e matrícula (registros removidos logicamente continuam valendo).
  garantirUnicos({ email, matricula }, idIgnorado = null) {
    const outros = this.armazenamento.estudantes.filter((e) => e.id !== idIgnorado);
    if (outros.some((e) => e.email === email)) throw new RegistroDuplicadoError('email');
    if (outros.some((e) => e.matricula === matricula)) throw new RegistroDuplicadoError('matricula');
  }

  async listar({ filtros = {}, pagina = 1, limite = 10, ordenar: campo, direcao } = {}) {
    let itens = this.ativos();
    if (filtros.turma) itens = itens.filter((e) => e.turma === filtros.turma);
    if (filtros.nome) itens = itens.filter((e) => contem(e.nome, filtros.nome));
    const ordenados = ordenar(itens, { camposPermitidos: CAMPOS_ORDENACAO_PERMITIDOS, ordenar: campo, direcao });
    return { itens: paginar(ordenados, pagina, limite).map((e) => new Estudante(e)), total: ordenados.length };
  }

  async buscarPorId(id) {
    const registro = this.ativos().find((e) => e.id === id);
    return registro ? new Estudante(registro) : null;
  }

  async criar(estudante) {
    this.garantirUnicos(estudante);
    const agora = new Date();
    const registro = {
      nome: estudante.nome,
      email: estudante.email,
      matricula: estudante.matricula,
      turma: estudante.turma,
      id: this.armazenamento.proximoId.estudante++,
      createdAt: agora,
      updatedAt: agora,
      deletedAt: null
    };
    this.armazenamento.estudantes.push(registro);
    return new Estudante(registro);
  }

  async atualizar(estudante) {
    const registro = this.ativos().find((e) => e.id === estudante.id);
    if (!registro) return null;
    this.garantirUnicos(estudante, estudante.id);
    Object.assign(registro, {
      nome: estudante.nome,
      email: estudante.email,
      matricula: estudante.matricula,
      turma: estudante.turma,
      updatedAt: new Date()
    });
    return new Estudante(registro);
  }

  async remover(id) {
    const registro = this.ativos().find((e) => e.id === id);
    if (!registro) return false;
    registro.deletedAt = new Date();
    return true;
  }
}

module.exports = InMemoryEstudanteRepository;
