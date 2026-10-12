'use strict';

const EmprestimoRepository = require('../EmprestimoRepository');
const { paraEmprestimo } = require('./mapeadores');
const { traduzindo } = require('./traducaoDeErros');

const CAMPOS_ORDENACAO_PERMITIDOS = ['dataEmprestimo', 'dataDevolucaoPrevista', 'status', 'createdAt'];

function montarOrdenacao(ordenar, direcao) {
  const campo = CAMPOS_ORDENACAO_PERMITIDOS.includes(ordenar) ? ordenar : 'id';
  const dir = String(direcao || '').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return [[campo, dir]];
}

const CAMPOS = ['livroId', 'estudanteId', 'dataEmprestimo', 'dataDevolucaoPrevista', 'dataDevolucaoReal', 'status'];
const dadosDe = (emprestimo) => Object.fromEntries(CAMPOS.map((c) => [c, emprestimo[c]]));

class SequelizeEmprestimoRepository extends EmprestimoRepository {
  constructor({ modelos, transacao = null }) {
    super();
    this.modelos = modelos;
    this.transacao = transacao;
  }

  listar({ filtros = {}, pagina = 1, limite = 10, ordenar, direcao } = {}) {
    return traduzindo(async () => {
      const where = {};
      if (filtros.status) where.status = filtros.status;
      if (filtros.estudanteId) where.estudanteId = filtros.estudanteId;
      if (filtros.livroId) where.livroId = filtros.livroId;

      const { rows, count } = await this.modelos.Emprestimo.findAndCountAll({
        where,
        order: montarOrdenacao(ordenar, direcao),
        limit: limite,
        offset: (pagina - 1) * limite,
        transaction: this.transacao
      });
      return { itens: rows.map(paraEmprestimo), total: count };
    });
  }

  // Dados relacionados em UMA consulta (JOIN): evita o problema N+1.
  listarPorEstudante(estudanteId, { filtros = {}, pagina = 1, limite = 10 } = {}) {
    return traduzindo(async () => {
      const where = { estudanteId };
      if (filtros.status) where.status = filtros.status;

      const { rows, count } = await this.modelos.Emprestimo.findAndCountAll({
        where,
        include: [{ model: this.modelos.Livro, as: 'livro', attributes: ['id', 'titulo', 'autor'] }],
        order: [['id', 'ASC']],
        limit: limite,
        offset: (pagina - 1) * limite,
        transaction: this.transacao
      });
      return { itens: rows.map(paraEmprestimo), total: count };
    });
  }

  buscarPorId(id) {
    return traduzindo(async () => paraEmprestimo(await this.modelos.Emprestimo.findByPk(id, { transaction: this.transacao })));
  }

  criar(emprestimo) {
    return traduzindo(async () =>
      paraEmprestimo(await this.modelos.Emprestimo.create(dadosDe(emprestimo), { transaction: this.transacao }))
    );
  }

  atualizar(emprestimo) {
    return traduzindo(async () => {
      const linha = await this.modelos.Emprestimo.findByPk(emprestimo.id, { transaction: this.transacao });
      if (!linha) return null;
      await linha.update(dadosDe(emprestimo), { transaction: this.transacao });
      return paraEmprestimo(linha);
    });
  }

  remover(id) {
    return traduzindo(async () => {
      const linha = await this.modelos.Emprestimo.findByPk(id, { transaction: this.transacao });
      if (!linha) return false;
      await linha.destroy({ transaction: this.transacao });
      return true;
    });
  }

  existeAtivoDoLivro(livroId) {
    return traduzindo(async () =>
      Boolean(await this.modelos.Emprestimo.findOne({ where: { livroId, status: 'ativo' }, transaction: this.transacao }))
    );
  }

  existeAtivoDoEstudante(estudanteId) {
    return traduzindo(async () =>
      Boolean(await this.modelos.Emprestimo.findOne({ where: { estudanteId, status: 'ativo' }, transaction: this.transacao }))
    );
  }
}

module.exports = SequelizeEmprestimoRepository;
