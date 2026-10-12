'use strict';

const { z } = require('zod');
const { lerPaginacao, lerOrdenacao } = require('./consulta');

const estudanteSchema = z.object({
  nome: z.string().min(3, 'nome deve ter ao menos 3 caracteres'),
  email: z.string().email('e-mail inválido'),
  matricula: z.string().min(1, 'matrícula é obrigatória'),
  turma: z.string().min(1, 'turma é obrigatória')
});

const estudanteParcialSchema = estudanteSchema.partial();

function lerConsulta(query) {
  return {
    filtros: { turma: query.turma, nome: query.nome },
    ...lerPaginacao(query),
    ...lerOrdenacao(query)
  };
}

function saida(estudante) {
  return {
    id: estudante.id,
    nome: estudante.nome,
    email: estudante.email,
    matricula: estudante.matricula,
    turma: estudante.turma,
    createdAt: estudante.createdAt,
    updatedAt: estudante.updatedAt,
    deletedAt: null
  };
}

// Formato legado preservado (ver ADR-0004): na criação, o Trabalho 2 devolvia o
// objeto recém-gravado pelo ORM, que ainda não trazia o campo `deletedAt`.
function saidaCriacao(estudante) {
  const { deletedAt, ...semDeletedAt } = saida(estudante); // eslint-disable-line no-unused-vars
  return semDeletedAt;
}

module.exports = { estudanteSchema, estudanteParcialSchema, lerConsulta, saida, saidaCriacao };
