const { Op } = require('sequelize');
const { sequelize, Livro, Genero, Emprestimo } = require('../../models');
const generosRepository = require('./generos.repository');

const CAMPOS_ORDENACAO_PERMITIDOS = ['titulo', 'autor', 'anoPublicacao', 'quantidadeDisponivel', 'createdAt'];

function montarOrdenacao(ordenar, direcao) {
  const campo = CAMPOS_ORDENACAO_PERMITIDOS.includes(ordenar) ? ordenar : 'id';
  const dir = String(direcao || '').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return [[campo, dir]];
}

const INCLUDE_GENEROS = { model: Genero, as: 'generos', attributes: ['id', 'nome'], through: { attributes: [] } };

// Todos os filtros e a paginação abaixo são resolvidos em SQL (WHERE/LIMIT/OFFSET),
// nunca carregando a tabela inteira para filtrar em memória.
async function listar({ filtros = {}, pagina = 1, limite = 10, ordenar, direcao }) {
  const where = {};
  if (filtros.titulo) where.titulo = { [Op.like]: `%${filtros.titulo}%` };
  if (filtros.autor) where.autor = { [Op.like]: `%${filtros.autor}%` };
  if (filtros.anoPublicacao) where.anoPublicacao = filtros.anoPublicacao;
  if (filtros.anoMin || filtros.anoMax) {
    where.anoPublicacao = {
      ...(filtros.anoMin && { [Op.gte]: filtros.anoMin }),
      ...(filtros.anoMax && { [Op.lte]: filtros.anoMax })
    };
  }

  const include = [{ ...INCLUDE_GENEROS }];
  if (filtros.genero) {
    include[0] = { ...INCLUDE_GENEROS, where: { nome: filtros.genero }, required: true };
  }

  const { rows, count } = await Livro.findAndCountAll({
    where,
    include,
    order: montarOrdenacao(ordenar, direcao),
    limit: limite,
    offset: (pagina - 1) * limite,
    distinct: true // evita contagem duplicada por causa do JOIN com gêneros
  });

  return { linhas: rows, total: count };
}

function buscarPorId(id, opcoes = {}) {
  return Livro.findByPk(id, { include: [INCLUDE_GENEROS], transaction: opcoes.transaction });
}

async function criar(dados) {
  return sequelize.transaction(async (t) => {
    const livro = await Livro.create(
      {
        titulo: dados.titulo,
        autor: dados.autor,
        isbn: dados.isbn,
        anoPublicacao: dados.anoPublicacao,
        quantidadeTotal: dados.quantidadeTotal,
        quantidadeDisponivel: dados.quantidadeDisponivel ?? dados.quantidadeTotal
      },
      { transaction: t }
    );
    const generos = await generosRepository.encontrarOuCriarPorNomes(dados.generos, t);
    await livro.setGeneros(generos, { transaction: t });
    return buscarPorId(livro.id, { transaction: t });
  });
}

async function substituir(id, dados) {
  return sequelize.transaction(async (t) => {
    const livro = await Livro.findByPk(id, { transaction: t });
    if (!livro) return null;

    await livro.update(
      {
        titulo: dados.titulo,
        autor: dados.autor,
        isbn: dados.isbn,
        anoPublicacao: dados.anoPublicacao,
        quantidadeTotal: dados.quantidadeTotal,
        quantidadeDisponivel: dados.quantidadeDisponivel ?? dados.quantidadeTotal
      },
      { transaction: t }
    );
    const generos = await generosRepository.encontrarOuCriarPorNomes(dados.generos, t);
    await livro.setGeneros(generos, { transaction: t });
    return buscarPorId(id, { transaction: t });
  });
}

async function atualizarParcial(id, dados) {
  return sequelize.transaction(async (t) => {
    const livro = await Livro.findByPk(id, { transaction: t });
    if (!livro) return null;

    const { generos, ...camposSimples } = dados;
    if (Object.keys(camposSimples).length > 0) {
      await livro.update(camposSimples, { transaction: t });
    }
    if (generos) {
      const generosInstancias = await generosRepository.encontrarOuCriarPorNomes(generos, t);
      await livro.setGeneros(generosInstancias, { transaction: t });
    }
    return buscarPorId(id, { transaction: t });
  });
}

// Soft delete: `livro.destroy()` com `paranoid: true` apenas grava `deleted_at`.
async function remover(id) {
  const livro = await Livro.findByPk(id);
  if (!livro) return null;
  await livro.destroy();
  return true;
}

function possuiEmprestimoAtivo(id) {
  return Emprestimo.findOne({ where: { livroId: id, status: 'ativo' } });
}

module.exports = { listar, buscarPorId, criar, substituir, atualizarParcial, remover, possuiEmprestimoAtivo };
