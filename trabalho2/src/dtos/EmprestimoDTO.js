'use strict';

const { z } = require('zod');
const { lerPaginacao, lerOrdenacao } = require('./consulta');

const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
const msgData = 'deve estar no formato AAAA-MM-DD';

const emprestimoSchema = z.object({
  livroId: z
    .number({ invalid_type_error: 'livroId é obrigatório e deve ser um número' })
    .int()
    .positive('livroId deve ser um número positivo'),
  estudanteId: z
    .number({ invalid_type_error: 'estudanteId é obrigatório e deve ser um número' })
    .int()
    .positive('estudanteId deve ser um número positivo'),
  dataEmprestimo: z.string().regex(dataRegex, `dataEmprestimo ${msgData}`),
  dataDevolucaoPrevista: z.string().regex(dataRegex, `dataDevolucaoPrevista ${msgData}`)
});

const emprestimoParcialSchema = z.object({
  livroId: z.number().int().positive().optional(),
  estudanteId: z.number().int().positive().optional(),
  dataEmprestimo: z.string().regex(dataRegex, `dataEmprestimo ${msgData}`).optional(),
  dataDevolucaoPrevista: z.string().regex(dataRegex, `dataDevolucaoPrevista ${msgData}`).optional(),
  dataDevolucaoReal: z.string().regex(dataRegex, `dataDevolucaoReal ${msgData}`).nullable().optional(),
  status: z
    .enum(['ativo', 'devolvido', 'atrasado'], {
      errorMap: () => ({ message: 'status deve ser ativo, devolvido ou atrasado' })
    })
    .optional()
});

function lerConsulta(query) {
  const { status, estudanteId, livroId } = query;
  return {
    filtros: {
      status,
      estudanteId: estudanteId ? Number(estudanteId) : undefined,
      livroId: livroId ? Number(livroId) : undefined
    },
    ...lerPaginacao(query),
    ...lerOrdenacao(query)
  };
}

function lerConsultaDoEstudante(query) {
  return { filtros: { status: query.status }, ...lerPaginacao(query) };
}

function saida(emprestimo) {
  return {
    id: emprestimo.id,
    livroId: emprestimo.livroId,
    estudanteId: emprestimo.estudanteId,
    dataEmprestimo: emprestimo.dataEmprestimo,
    dataDevolucaoPrevista: emprestimo.dataDevolucaoPrevista,
    dataDevolucaoReal: emprestimo.dataDevolucaoReal,
    status: emprestimo.status,
    createdAt: emprestimo.createdAt,
    updatedAt: emprestimo.updatedAt
  };
}

// Formato legado preservado (ver ADR-0004): na criação, o Trabalho 2 não incluía
// `dataDevolucaoReal` (o ORM ainda não tinha o campo nulo no objeto recém-criado).
function saidaCriacao(emprestimo) {
  const { dataDevolucaoReal, ...semDevolucao } = saida(emprestimo); // eslint-disable-line no-unused-vars
  return semDevolucao;
}

// Usado em GET /estudantes/:id/emprestimos — inclui o resumo do livro.
function saidaComLivro(emprestimo) {
  return { ...saida(emprestimo), livro: emprestimo.livro };
}

module.exports = {
  emprestimoSchema,
  emprestimoParcialSchema,
  lerConsulta,
  lerConsultaDoEstudante,
  saida,
  saidaCriacao,
  saidaComLivro
};
