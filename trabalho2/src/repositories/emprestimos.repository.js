const { sequelize, Emprestimo, Livro, Estudante } = require('../../models');
const { ApiError } = require('../middlewares/erro.middleware');

const CAMPOS_ORDENACAO_PERMITIDOS = ['dataEmprestimo', 'dataDevolucaoPrevista', 'status', 'createdAt'];

function montarOrdenacao(ordenar, direcao) {
  const campo = CAMPOS_ORDENACAO_PERMITIDOS.includes(ordenar) ? ordenar : 'id';
  const dir = String(direcao || '').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return [[campo, dir]];
}

async function listar({ filtros = {}, pagina = 1, limite = 10, ordenar, direcao }) {
  const where = {};
  if (filtros.status) where.status = filtros.status;
  if (filtros.estudanteId) where.estudanteId = filtros.estudanteId;
  if (filtros.livroId) where.livroId = filtros.livroId;

  const { rows, count } = await Emprestimo.findAndCountAll({
    where,
    order: montarOrdenacao(ordenar, direcao),
    limit: limite,
    offset: (pagina - 1) * limite
  });
  return { linhas: rows, total: count };
}

function buscarPorId(id, opcoes = {}) {
  return Emprestimo.findByPk(id, { transaction: opcoes.transaction });
}

// Operação transacional exigida pelo Trabalho 2: registrar o empréstimo e
// decrementar o exemplar disponível precisam ser atômicos — se qualquer
// passo falhar (livro/estudante inexistente, sem exemplares, etc.), o
// Sequelize desfaz tudo automaticamente ao propagar o erro para fora do
// callback da transação.
async function criarComTransacao(dados) {
  return sequelize.transaction(async (t) => {
    const livro = await Livro.findByPk(dados.livroId, { transaction: t });
    if (!livro) {
      throw new ApiError(404, 'LIVRO_NAO_ENCONTRADO', `Livro com id ${dados.livroId} não encontrado`);
    }

    const estudante = await Estudante.findByPk(dados.estudanteId, { transaction: t });
    if (!estudante) {
      throw new ApiError(404, 'ESTUDANTE_NAO_ENCONTRADO', `Estudante com id ${dados.estudanteId} não encontrado`);
    }

    if (livro.quantidadeDisponivel < 1) {
      throw new ApiError(409, 'LIVRO_INDISPONIVEL', `Não há exemplares disponíveis do livro "${livro.titulo}"`);
    }

    const emprestimo = await Emprestimo.create(
      {
        livroId: dados.livroId,
        estudanteId: dados.estudanteId,
        dataEmprestimo: dados.dataEmprestimo,
        dataDevolucaoPrevista: dados.dataDevolucaoPrevista,
        status: 'ativo'
      },
      { transaction: t }
    );

    livro.quantidadeDisponivel -= 1;
    await livro.save({ transaction: t });

    return emprestimo;
  });
}

// Também transacional: marcar como "devolvido" repõe o exemplar do livro
// na mesma unidade atômica.
async function atualizarParcialComTransacao(id, dados) {
  return sequelize.transaction(async (t) => {
    const emprestimo = await Emprestimo.findByPk(id, { transaction: t });
    if (!emprestimo) {
      throw new ApiError(404, 'EMPRESTIMO_NAO_ENCONTRADO', `Empréstimo com id ${id} não encontrado`);
    }

    const dadosAtualizados = { ...dados };

    if (dadosAtualizados.status === 'devolvido' && emprestimo.status !== 'devolvido') {
      const livro = await Livro.findByPk(emprestimo.livroId, { transaction: t });
      if (livro) {
        livro.quantidadeDisponivel += 1;
        await livro.save({ transaction: t });
      }
      if (!dadosAtualizados.dataDevolucaoReal) {
        dadosAtualizados.dataDevolucaoReal = new Date().toISOString().slice(0, 10);
      }
    }

    await emprestimo.update(dadosAtualizados, { transaction: t });
    return emprestimo;
  });
}

async function substituir(id, dados) {
  const emprestimo = await Emprestimo.findByPk(id);
  if (!emprestimo) return null;
  await emprestimo.update(dados);
  return emprestimo;
}

// Remover um empréstimo ativo também repõe o exemplar — outra operação
// que precisa ser atômica.
async function removerComTransacao(id) {
  return sequelize.transaction(async (t) => {
    const emprestimo = await Emprestimo.findByPk(id, { transaction: t });
    if (!emprestimo) return false;

    if (emprestimo.status === 'ativo') {
      const livro = await Livro.findByPk(emprestimo.livroId, { transaction: t });
      if (livro) {
        livro.quantidadeDisponivel += 1;
        await livro.save({ transaction: t });
      }
    }

    await emprestimo.destroy({ transaction: t });
    return true;
  });
}

module.exports = {
  listar,
  buscarPorId,
  criarComTransacao,
  atualizarParcialComTransacao,
  substituir,
  removerComTransacao
};
