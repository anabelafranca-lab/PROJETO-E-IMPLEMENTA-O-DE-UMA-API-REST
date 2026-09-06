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
  let resultado = [...db.estudantes];
  const { turma, nome } = req.query;

  if (turma) {
    resultado = resultado.filter((e) => e.turma.toLowerCase() === String(turma).toLowerCase());
  }
  if (nome) {
    const termo = String(nome).toLowerCase();
    resultado = resultado.filter((e) => e.nome.toLowerCase().includes(termo));
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { itens, paginacao } = paginar(resultado, page, limit);

  res.status(200).json({ dados: itens, paginacao });
}

function buscarPorId(req, res) {
  const id = Number(req.params.id);
  const estudante = db.estudantes.find((e) => e.id === id);
  if (!estudante) {
    throw new ApiError(404, 'ESTUDANTE_NAO_ENCONTRADO', `Estudante com id ${id} não encontrado`);
  }
  res.status(200).json(estudante);
}

function criar(req, res) {
  const dados = req.body;

  if (db.estudantes.some((e) => e.matricula === dados.matricula)) {
    throw new ApiError(409, 'MATRICULA_DUPLICADA', `Já existe um estudante cadastrado com a matrícula ${dados.matricula}`);
  }
  if (db.estudantes.some((e) => e.email === dados.email)) {
    throw new ApiError(409, 'EMAIL_DUPLICADO', `Já existe um estudante cadastrado com o e-mail ${dados.email}`);
  }

  const novoEstudante = { id: db.gerarIdEstudante(), ...dados };
  db.estudantes.push(novoEstudante);
  res.status(201).json(novoEstudante);
}

function substituir(req, res) {
  const id = Number(req.params.id);
  const indice = db.estudantes.findIndex((e) => e.id === id);
  if (indice === -1) {
    throw new ApiError(404, 'ESTUDANTE_NAO_ENCONTRADO', `Estudante com id ${id} não encontrado`);
  }

  const dados = req.body;
  const conflito = db.estudantes.some(
    (e) => (e.matricula === dados.matricula || e.email === dados.email) && e.id !== id
  );
  if (conflito) {
    throw new ApiError(409, 'DADOS_DUPLICADOS', 'Matrícula ou e-mail já cadastrados para outro estudante');
  }

  const estudanteAtualizado = { id, ...dados };
  db.estudantes[indice] = estudanteAtualizado;
  res.status(200).json(estudanteAtualizado);
}

function atualizarParcial(req, res) {
  const id = Number(req.params.id);
  const indice = db.estudantes.findIndex((e) => e.id === id);
  if (indice === -1) {
    throw new ApiError(404, 'ESTUDANTE_NAO_ENCONTRADO', `Estudante com id ${id} não encontrado`);
  }

  const dados = req.body;
  const conflito = db.estudantes.some(
    (e) =>
      ((dados.matricula && e.matricula === dados.matricula) || (dados.email && e.email === dados.email)) &&
      e.id !== id
  );
  if (conflito) {
    throw new ApiError(409, 'DADOS_DUPLICADOS', 'Matrícula ou e-mail já cadastrados para outro estudante');
  }

  db.estudantes[indice] = { ...db.estudantes[indice], ...dados };
  res.status(200).json(db.estudantes[indice]);
}

function remover(req, res) {
  const id = Number(req.params.id);
  const indice = db.estudantes.findIndex((e) => e.id === id);
  if (indice === -1) {
    throw new ApiError(404, 'ESTUDANTE_NAO_ENCONTRADO', `Estudante com id ${id} não encontrado`);
  }

  const possuiEmprestimoAtivo = db.emprestimos.some((emp) => emp.estudanteId === id && emp.status === 'ativo');
  if (possuiEmprestimoAtivo) {
    throw new ApiError(
      409,
      'ESTUDANTE_COM_EMPRESTIMO_ATIVO',
      `Estudante com id ${id} possui empréstimos ativos e não pode ser removido`
    );
  }

  db.estudantes.splice(indice, 1);
  res.status(204).send();
}

// GET /estudantes/:id/emprestimos — recurso aninhado exigido pelo enunciado
function listarEmprestimosDoEstudante(req, res) {
  const id = Number(req.params.id);
  const estudante = db.estudantes.find((e) => e.id === id);
  if (!estudante) {
    throw new ApiError(404, 'ESTUDANTE_NAO_ENCONTRADO', `Estudante com id ${id} não encontrado`);
  }

  let resultado = db.emprestimos.filter((e) => e.estudanteId === id);

  const { status } = req.query;
  if (status) {
    resultado = resultado.filter((e) => e.status === status);
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { itens, paginacao } = paginar(resultado, page, limit);

  res.status(200).json({ dados: itens, paginacao });
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  substituir,
  atualizarParcial,
  remover,
  listarEmprestimosDoEstudante
};
