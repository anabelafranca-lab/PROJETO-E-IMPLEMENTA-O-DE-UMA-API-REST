const { Op } = require('sequelize');
const { Estudante, Emprestimo, Livro } = require('../../models');

const CAMPOS_ORDENACAO_PERMITIDOS = ['nome', 'turma', 'matricula', 'createdAt'];

function montarOrdenacao(ordenar, direcao) {
  const campo = CAMPOS_ORDENACAO_PERMITIDOS.includes(ordenar) ? ordenar : 'id';
  const dir = String(direcao || '').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return [[campo, dir]];
}

async function listar({ filtros = {}, pagina = 1, limite = 10, ordenar, direcao }) {
  const where = {};
  if (filtros.turma) where.turma = filtros.turma;
  if (filtros.nome) where.nome = { [Op.like]: `%${filtros.nome}%` };

  const { rows, count } = await Estudante.findAndCountAll({
    where,
    order: montarOrdenacao(ordenar, direcao),
    limit: limite,
    offset: (pagina - 1) * limite
  });
  return { linhas: rows, total: count };
}

function buscarPorId(id) {
  return Estudante.findByPk(id);
}

function criar(dados) {
  return Estudante.create(dados);
}

async function substituir(id, dados) {
  const estudante = await Estudante.findByPk(id);
  if (!estudante) return null;
  await estudante.update(dados);
  return estudante;
}

async function atualizarParcial(id, dados) {
  const estudante = await Estudante.findByPk(id);
  if (!estudante) return null;
  await estudante.update(dados);
  return estudante;
}

// Soft delete (paranoid): mantém o histórico de empréstimos íntegro.
async function remover(id) {
  const estudante = await Estudante.findByPk(id);
  if (!estudante) return null;
  await estudante.destroy();
  return true;
}

function possuiEmprestimoAtivo(id) {
  return Emprestimo.findOne({ where: { estudanteId: id, status: 'ativo' } });
}

// Endpoint que retorna dados relacionados: empréstimos de um estudante,
// já trazendo os dados básicos do livro correspondente (evita N+1).
async function listarEmprestimos(id, { filtros = {}, pagina = 1, limite = 10 }) {
  const where = { estudanteId: id };
  if (filtros.status) where.status = filtros.status;

  const { rows, count } = await Emprestimo.findAndCountAll({
    where,
    include: [{ model: Livro, as: 'livro', attributes: ['id', 'titulo', 'autor'] }],
    order: [['id', 'ASC']],
    limit: limite,
    offset: (pagina - 1) * limite
  });
  return { linhas: rows, total: count };
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  substituir,
  atualizarParcial,
  remover,
  possuiEmprestimoAtivo,
  listarEmprestimos
};
