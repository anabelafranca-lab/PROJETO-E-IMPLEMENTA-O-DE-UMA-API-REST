const repo = require('../repositories/livros.repository');
const { ApiError } = require('../middlewares/erro.middleware');
const { asyncHandler } = require('../middlewares/asyncHandler');

function montarPaginacao(total, pagina, limite) {
  return { total, paginaAtual: pagina, totalPaginas: Math.max(Math.ceil(total / limite), 1), limit: limite };
}

function serializar(livro) {
  const json = livro.toJSON();
  return {
    id: json.id,
    titulo: json.titulo,
    autor: json.autor,
    isbn: json.isbn,
    anoPublicacao: json.anoPublicacao,
    quantidadeTotal: json.quantidadeTotal,
    quantidadeDisponivel: json.quantidadeDisponivel,
    generos: (json.generos || []).map((g) => g.nome),
    createdAt: json.createdAt,
    updatedAt: json.updatedAt
  };
}

const listar = asyncHandler(async (req, res) => {
  const { genero, titulo, autor, anoPublicacao, ano_min: anoMin, ano_max: anoMax, ordenar, direcao } = req.query;
  const pagina = Number(req.query.page) || 1;
  const limite = Number(req.query.limit) || 10;

  const { linhas, total } = await repo.listar({
    filtros: {
      genero,
      titulo,
      autor,
      anoPublicacao: anoPublicacao ? Number(anoPublicacao) : undefined,
      anoMin: anoMin ? Number(anoMin) : undefined,
      anoMax: anoMax ? Number(anoMax) : undefined
    },
    pagina,
    limite,
    ordenar,
    direcao
  });

  res.status(200).json({ dados: linhas.map(serializar), paginacao: montarPaginacao(total, pagina, limite) });
});

const buscarPorId = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const livro = await repo.buscarPorId(id);
  if (!livro) throw new ApiError(404, 'LIVRO_NAO_ENCONTRADO', `Livro com id ${id} não encontrado`);
  res.status(200).json(serializar(livro));
});

const criar = asyncHandler(async (req, res) => {
  const livro = await repo.criar(req.body);
  res.status(201).json(serializar(livro));
});

const substituir = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const livro = await repo.substituir(id, req.body);
  if (!livro) throw new ApiError(404, 'LIVRO_NAO_ENCONTRADO', `Livro com id ${id} não encontrado`);
  res.status(200).json(serializar(livro));
});

const atualizarParcial = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const livro = await repo.atualizarParcial(id, req.body);
  if (!livro) throw new ApiError(404, 'LIVRO_NAO_ENCONTRADO', `Livro com id ${id} não encontrado`);
  res.status(200).json(serializar(livro));
});

const remover = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const existente = await repo.buscarPorId(id);
  if (!existente) throw new ApiError(404, 'LIVRO_NAO_ENCONTRADO', `Livro com id ${id} não encontrado`);

  const emUso = await repo.possuiEmprestimoAtivo(id);
  if (emUso) {
    throw new ApiError(409, 'LIVRO_EM_USO', `Livro com id ${id} possui empréstimos ativos e não pode ser removido`);
  }

  await repo.remover(id);
  res.status(204).send();
});

module.exports = { listar, buscarPorId, criar, substituir, atualizarParcial, remover };
