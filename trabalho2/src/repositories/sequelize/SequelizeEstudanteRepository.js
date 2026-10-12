'use strict';

const { Op } = require('sequelize');
const EstudanteRepository = require('../EstudanteRepository');
const { paraEstudante } = require('./mapeadores');
const { traduzindo } = require('./traducaoDeErros');

const CAMPOS_ORDENACAO_PERMITIDOS = ['nome', 'turma', 'matricula', 'createdAt'];

function montarOrdenacao(ordenar, direcao) {
  const campo = CAMPOS_ORDENACAO_PERMITIDOS.includes(ordenar) ? ordenar : 'id';
  const dir = String(direcao || '').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return [[campo, dir]];
}

const CAMPOS = ['nome', 'email', 'matricula', 'turma'];
const dadosDe = (estudante) => Object.fromEntries(CAMPOS.map((c) => [c, estudante[c]]));

class SequelizeEstudanteRepository extends EstudanteRepository {
  constructor({ modelos, transacao = null }) {
    super();
    this.modelos = modelos;
    this.transacao = transacao;
  }

  listar({ filtros = {}, pagina = 1, limite = 10, ordenar, direcao } = {}) {
    return traduzindo(async () => {
      const where = {};
      if (filtros.turma) where.turma = filtros.turma;
      if (filtros.nome) where.nome = { [Op.like]: `%${filtros.nome}%` };

      const { rows, count } = await this.modelos.Estudante.findAndCountAll({
        where,
        order: montarOrdenacao(ordenar, direcao),
        limit: limite,
        offset: (pagina - 1) * limite,
        transaction: this.transacao
      });
      return { itens: rows.map(paraEstudante), total: count };
    });
  }

  buscarPorId(id) {
    return traduzindo(async () => paraEstudante(await this.modelos.Estudante.findByPk(id, { transaction: this.transacao })));
  }

  criar(estudante) {
    return traduzindo(async () =>
      paraEstudante(await this.modelos.Estudante.create(dadosDe(estudante), { transaction: this.transacao }))
    );
  }

  atualizar(estudante) {
    return traduzindo(async () => {
      const linha = await this.modelos.Estudante.findByPk(estudante.id, { transaction: this.transacao });
      if (!linha) return null;
      await linha.update(dadosDe(estudante), { transaction: this.transacao });
      return paraEstudante(linha);
    });
  }

  // Soft delete (paranoid): preserva o histórico de empréstimos.
  remover(id) {
    return traduzindo(async () => {
      const linha = await this.modelos.Estudante.findByPk(id, { transaction: this.transacao });
      if (!linha) return false;
      await linha.destroy({ transaction: this.transacao });
      return true;
    });
  }
}

module.exports = SequelizeEstudanteRepository;
