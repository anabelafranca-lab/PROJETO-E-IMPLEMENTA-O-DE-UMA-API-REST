'use strict';

const { Op } = require('sequelize');
const LivroRepository = require('../LivroRepository');
const { paraLivro } = require('./mapeadores');
const { traduzindo } = require('./traducaoDeErros');

const CAMPOS_ORDENACAO_PERMITIDOS = ['titulo', 'autor', 'anoPublicacao', 'quantidadeDisponivel', 'createdAt'];

function montarOrdenacao(ordenar, direcao) {
  const campo = CAMPOS_ORDENACAO_PERMITIDOS.includes(ordenar) ? ordenar : 'id';
  const dir = String(direcao || '').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return [[campo, dir]];
}

const mesmoConjunto = (a, b) => a.length === b.length && a.every((item) => b.includes(item));

class SequelizeLivroRepository extends LivroRepository {
  /**
   * @param {object} deps
   * @param {object} deps.sequelize  instância da conexão
   * @param {object} deps.modelos    models do ORM
   * @param {object} [deps.transacao] quando informada, TODAS as consultas rodam dentro dela
   *                                  (é assim que a Unit of Work "amarra" os repositórios)
   */
  constructor({ sequelize, modelos, transacao = null }) {
    super();
    this.sequelize = sequelize;
    this.modelos = modelos;
    this.transacao = transacao;
  }

  get includeGeneros() {
    return { model: this.modelos.Genero, as: 'generos', attributes: ['id', 'nome'], through: { attributes: [] } };
  }

  // Executa `fn(t)` dentro da transação corrente, ou abre uma própria se não houver.
  comTransacao(fn) {
    return this.transacao ? fn(this.transacao) : this.sequelize.transaction(fn);
  }

  // Todos os filtros e a paginação são resolvidos em SQL (WHERE/LIMIT/OFFSET).
  listar({ filtros = {}, pagina = 1, limite = 10, ordenar, direcao } = {}) {
    return traduzindo(async () => {
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

      const include = [{ ...this.includeGeneros }];
      if (filtros.genero) include[0] = { ...this.includeGeneros, where: { nome: filtros.genero }, required: true };

      const { rows, count } = await this.modelos.Livro.findAndCountAll({
        where,
        include,
        order: montarOrdenacao(ordenar, direcao),
        limit: limite,
        offset: (pagina - 1) * limite,
        distinct: true, // evita contagem duplicada por causa do JOIN com gêneros
        transaction: this.transacao
      });
      return { itens: rows.map(paraLivro), total: count };
    });
  }

  buscarPorId(id) {
    return traduzindo(async () => paraLivro(await this.buscarLinha(id, this.transacao)));
  }

  buscarLinha(id, transacao) {
    return this.modelos.Livro.findByPk(id, { include: [this.includeGeneros], transaction: transacao });
  }

  async encontrarOuCriarGeneros(nomes, transacao) {
    return Promise.all(
      nomes.map(async (nome) => {
        const [genero] = await this.modelos.Genero.findOrCreate({ where: { nome }, transaction: transacao });
        return genero;
      })
    );
  }

  criar(livro) {
    return traduzindo(() =>
      this.comTransacao(async (t) => {
        const linha = await this.modelos.Livro.create(
          {
            titulo: livro.titulo,
            autor: livro.autor,
            isbn: livro.isbn,
            anoPublicacao: livro.anoPublicacao,
            quantidadeTotal: livro.quantidadeTotal,
            quantidadeDisponivel: livro.quantidadeDisponivel
          },
          { transaction: t }
        );
        await linha.setGeneros(await this.encontrarOuCriarGeneros(livro.generos, t), { transaction: t });
        return paraLivro(await this.buscarLinha(linha.id, t));
      })
    );
  }

  atualizar(livro) {
    return traduzindo(() =>
      this.comTransacao(async (t) => {
        const linha = await this.buscarLinha(livro.id, t);
        if (!linha) return null;

        await linha.update(
          {
            titulo: livro.titulo,
            autor: livro.autor,
            isbn: livro.isbn,
            anoPublicacao: livro.anoPublicacao,
            quantidadeTotal: livro.quantidadeTotal,
            quantidadeDisponivel: livro.quantidadeDisponivel
          },
          { transaction: t }
        );

        // Só mexe na tabela de junção se os gêneros realmente mudaram.
        if (!mesmoConjunto(linha.generos.map((g) => g.nome), livro.generos)) {
          await linha.setGeneros(await this.encontrarOuCriarGeneros(livro.generos, t), { transaction: t });
        }
        return paraLivro(await this.buscarLinha(livro.id, t));
      })
    );
  }

  // Soft delete: `destroy()` com `paranoid: true` apenas grava `deleted_at`.
  remover(id) {
    return traduzindo(async () => {
      const linha = await this.modelos.Livro.findByPk(id, { transaction: this.transacao });
      if (!linha) return false;
      await linha.destroy({ transaction: this.transacao });
      return true;
    });
  }
}

module.exports = SequelizeLivroRepository;
