const repo = require('../repositories/estudantes.repository');
const { ApiError } = require('../middlewares/erro.middleware');
const { asyncHandler } = require('../middlewares/asyncHandler');

function montarPaginacao(total, pagina, limite) {
  return { total, paginaAtual: pagina, totalPaginas: Math.max(Math.ceil(total / limite), 1), limit: limite };
}

const listar = asyncHandler(async (req, res) => {
  const { turma, nome, ordenar, direcao } = req.query;
  const pagina = Number(req.query.page) || 1;
  const limite = Number(req.query.limit) || 10;

  const { linhas, total } = await repo.listar({ filtros: { turma, nome }, pagina, limite, ordenar, direcao });
  res.status(200).json({ dados: linhas, paginacao: montarPaginacao(total, pagina, limite) });
});

const buscarPorId = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const estudante = await repo.buscarPorId(id);
  if (!estudante) throw new ApiError(404, 'ESTUDANTE_NAO_ENCONTRADO', `Estudante com id ${id} não encontrado`);
  res.status(200).json(estudante);
});

const criar = asyncHandler(async (req, res) => {
  const estudante = await repo.criar(req.body);
  res.status(201).json(estudante);
});

const substituir = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const estudante = await repo.substituir(id, req.body);
  if (!estudante) throw new ApiError(404, 'ESTUDANTE_NAO_ENCONTRADO', `Estudante com id ${id} não encontrado`);
  res.status(200).json(estudante);
});

const atualizarParcial = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const estudante = await repo.atualizarParcial(id, req.body);
  if (!estudante) throw new ApiError(404, 'ESTUDANTE_NAO_ENCONTRADO', `Estudante com id ${id} não encontrado`);
  res.status(200).json(estudante);
});

const remover = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const existente = await repo.buscarPorId(id);
  if (!existente) throw new ApiError(404, 'ESTUDANTE_NAO_ENCONTRADO', `Estudante com id ${id} não encontrado`);

  const emUso = await repo.possuiEmprestimoAtivo(id);
  if (emUso) {
    throw new ApiError(
      409,
      'ESTUDANTE_COM_EMPRESTIMO_ATIVO',
      `Estudante com id ${id} possui empréstimos ativos e não pode ser removido`
    );
  }

  await repo.remover(id);
  res.status(204).send();
});

// GET /estudantes/:id/emprestimos — endpoint que retorna dados relacionados
const listarEmprestimosDoEstudante = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const estudante = await repo.buscarPorId(id);
  if (!estudante) throw new ApiError(404, 'ESTUDANTE_NAO_ENCONTRADO', `Estudante com id ${id} não encontrado`);

  const { status } = req.query;
  const pagina = Number(req.query.page) || 1;
  const limite = Number(req.query.limit) || 10;

  const { linhas, total } = await repo.listarEmprestimos(id, { filtros: { status }, pagina, limite });
  res.status(200).json({ dados: linhas, paginacao: montarPaginacao(total, pagina, limite) });
});

module.exports = {
  listar,
  buscarPorId,
  criar,
  substituir,
  atualizarParcial,
  remover,
  listarEmprestimosDoEstudante
};
