const repo = require('../repositories/emprestimos.repository');
const { ApiError } = require('../middlewares/erro.middleware');
const { asyncHandler } = require('../middlewares/asyncHandler');

function montarPaginacao(total, pagina, limite) {
  return { total, paginaAtual: pagina, totalPaginas: Math.max(Math.ceil(total / limite), 1), limit: limite };
}

const listar = asyncHandler(async (req, res) => {
  const { status, estudanteId, livroId, ordenar, direcao } = req.query;
  const pagina = Number(req.query.page) || 1;
  const limite = Number(req.query.limit) || 10;

  const { linhas, total } = await repo.listar({
    filtros: {
      status,
      estudanteId: estudanteId ? Number(estudanteId) : undefined,
      livroId: livroId ? Number(livroId) : undefined
    },
    pagina,
    limite,
    ordenar,
    direcao
  });

  res.status(200).json({ dados: linhas, paginacao: montarPaginacao(total, pagina, limite) });
});

const buscarPorId = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const emprestimo = await repo.buscarPorId(id);
  if (!emprestimo) throw new ApiError(404, 'EMPRESTIMO_NAO_ENCONTRADO', `Empréstimo com id ${id} não encontrado`);
  res.status(200).json(emprestimo);
});

// Operação transacional: criar o empréstimo e decrementar o exemplar
// disponível do livro (ver repositories/emprestimos.repository.js).
const criar = asyncHandler(async (req, res) => {
  const emprestimo = await repo.criarComTransacao(req.body);
  res.status(201).json(emprestimo);
});

const substituir = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const emprestimo = await repo.substituir(id, req.body);
  if (!emprestimo) throw new ApiError(404, 'EMPRESTIMO_NAO_ENCONTRADO', `Empréstimo com id ${id} não encontrado`);
  res.status(200).json(emprestimo);
});

const atualizarParcial = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const emprestimo = await repo.atualizarParcialComTransacao(id, req.body);
  res.status(200).json(emprestimo);
});

const remover = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const ok = await repo.removerComTransacao(id);
  if (!ok) throw new ApiError(404, 'EMPRESTIMO_NAO_ENCONTRADO', `Empréstimo com id ${id} não encontrado`);
  res.status(204).send();
});

module.exports = { listar, buscarPorId, criar, substituir, atualizarParcial, remover };
