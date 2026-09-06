const db = require('../data/db-memoria');
const { ApiError } = require('../middlewares/erro.middleware');

function paginar(lista, page, limit) {
  const totalItens = lista.length;
  const totalPaginas = Math.max(Math.ceil(totalItens / limit), 1);
  const paginaAtual = Math.min(Math.max(page, 1), totalPaginas);
  const inicio = (paginaAtual - 1) * limit;
  const itens = lista.slice(inicio, inicio + limit);
  return {
    itens,
    paginacao: { total: totalItens, paginaAtual, totalPaginas, limit }
  };
}

function listar(req, res) {
  let resultado = [...db.emprestimos];
  const { status, estudanteId, livroId } = req.query;

  if (status) resultado = resultado.filter((e) => e.status === status);
  if (estudanteId) resultado = resultado.filter((e) => e.estudanteId === Number(estudanteId));
  if (livroId) resultado = resultado.filter((e) => e.livroId === Number(livroId));

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { itens, paginacao } = paginar(resultado, page, limit);

  res.status(200).json({ dados: itens, paginacao });
}

function buscarPorId(req, res) {
  const id = Number(req.params.id);
  const emprestimo = db.emprestimos.find((e) => e.id === id);
  if (!emprestimo) {
    throw new ApiError(404, 'EMPRESTIMO_NAO_ENCONTRADO', `Empréstimo com id ${id} não encontrado`);
  }
  res.status(200).json(emprestimo);
}

function criar(req, res) {
  const dados = req.body;

  const livro = db.livros.find((l) => l.id === dados.livroId);
  if (!livro) {
    throw new ApiError(404, 'LIVRO_NAO_ENCONTRADO', `Livro com id ${dados.livroId} não encontrado`);
  }

  const estudante = db.estudantes.find((e) => e.id === dados.estudanteId);
  if (!estudante) {
    throw new ApiError(404, 'ESTUDANTE_NAO_ENCONTRADO', `Estudante com id ${dados.estudanteId} não encontrado`);
  }

  if (livro.quantidadeDisponivel < 1) {
    throw new ApiError(409, 'LIVRO_INDISPONIVEL', `Não há exemplares disponíveis do livro "${livro.titulo}"`);
  }

  const novoEmprestimo = {
    id: db.gerarIdEmprestimo(),
    livroId: dados.livroId,
    estudanteId: dados.estudanteId,
    dataEmprestimo: dados.dataEmprestimo,
    dataDevolucaoPrevista: dados.dataDevolucaoPrevista,
    dataDevolucaoReal: null,
    status: 'ativo'
  };

  livro.quantidadeDisponivel -= 1;
  db.emprestimos.push(novoEmprestimo);
  res.status(201).json(novoEmprestimo);
}

function substituir(req, res) {
  const id = Number(req.params.id);
  const indice = db.emprestimos.findIndex((e) => e.id === id);
  if (indice === -1) {
    throw new ApiError(404, 'EMPRESTIMO_NAO_ENCONTRADO', `Empréstimo com id ${id} não encontrado`);
  }

  const dados = req.body;
  const emprestimoAtualizado = { id, ...dados };
  db.emprestimos[indice] = emprestimoAtualizado;
  res.status(200).json(emprestimoAtualizado);
}

// PATCH /emprestimos/:id — usado também para registrar a devolução de um livro
// (status: 'devolvido'), o que repõe a quantidade disponível do exemplar.
function atualizarParcial(req, res) {
  const id = Number(req.params.id);
  const indice = db.emprestimos.findIndex((e) => e.id === id);
  if (indice === -1) {
    throw new ApiError(404, 'EMPRESTIMO_NAO_ENCONTRADO', `Empréstimo com id ${id} não encontrado`);
  }

  const dados = { ...req.body };
  const emprestimoAtual = db.emprestimos[indice];

  if (dados.status === 'devolvido' && emprestimoAtual.status !== 'devolvido') {
    const livro = db.livros.find((l) => l.id === emprestimoAtual.livroId);
    if (livro) livro.quantidadeDisponivel += 1;
    if (!dados.dataDevolucaoReal) {
      dados.dataDevolucaoReal = new Date().toISOString().slice(0, 10);
    }
  }

  db.emprestimos[indice] = { ...emprestimoAtual, ...dados };
  res.status(200).json(db.emprestimos[indice]);
}

function remover(req, res) {
  const id = Number(req.params.id);
  const indice = db.emprestimos.findIndex((e) => e.id === id);
  if (indice === -1) {
    throw new ApiError(404, 'EMPRESTIMO_NAO_ENCONTRADO', `Empréstimo com id ${id} não encontrado`);
  }

  const emprestimo = db.emprestimos[indice];
  if (emprestimo.status === 'ativo') {
    const livro = db.livros.find((l) => l.id === emprestimo.livroId);
    if (livro) livro.quantidadeDisponivel += 1;
  }

  db.emprestimos.splice(indice, 1);
  res.status(204).send();
}

module.exports = { listar, buscarPorId, criar, substituir, atualizarParcial, remover };
