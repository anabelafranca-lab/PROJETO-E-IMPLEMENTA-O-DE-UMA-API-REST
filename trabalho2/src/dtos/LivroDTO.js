'use strict';

const { z } = require('zod');
const { lerPaginacao, lerOrdenacao } = require('./consulta');

// ---- Contrato de ENTRADA ----------------------------------------------------
const livroSchema = z.object({
  titulo: z.string().min(1, 'título é obrigatório'),
  autor: z.string().min(1, 'autor é obrigatório'),
  isbn: z.string().min(10, 'ISBN inválido'),
  anoPublicacao: z
    .number({ invalid_type_error: 'anoPublicacao deve ser um número' })
    .int('anoPublicacao deve ser um número inteiro')
    .gte(1000, 'anoPublicacao inválido')
    .lte(new Date().getFullYear(), 'anoPublicacao não pode estar no futuro'),
  quantidadeTotal: z
    .number({ invalid_type_error: 'quantidadeTotal deve ser um número' })
    .int('quantidadeTotal deve ser um número inteiro')
    .nonnegative('quantidadeTotal deve ser maior ou igual a zero'),
  quantidadeDisponivel: z.number().int().nonnegative().optional(),
  generos: z.array(z.string().min(1)).min(1, 'informe ao menos um gênero')
});

const livroParcialSchema = livroSchema.partial();

function lerConsulta(query) {
  const { genero, titulo, autor, anoPublicacao, ano_min: anoMin, ano_max: anoMax } = query;
  return {
    filtros: {
      genero,
      titulo,
      autor,
      anoPublicacao: anoPublicacao ? Number(anoPublicacao) : undefined,
      anoMin: anoMin ? Number(anoMin) : undefined,
      anoMax: anoMax ? Number(anoMax) : undefined
    },
    ...lerPaginacao(query),
    ...lerOrdenacao(query)
  };
}

// ---- Contrato de SAÍDA ------------------------------------------------------
// A API publica exatamente estes campos — independentemente de como a entidade
// ou o ORM evoluam por baixo.
function saida(livro) {
  return {
    id: livro.id,
    titulo: livro.titulo,
    autor: livro.autor,
    isbn: livro.isbn,
    anoPublicacao: livro.anoPublicacao,
    quantidadeTotal: livro.quantidadeTotal,
    quantidadeDisponivel: livro.quantidadeDisponivel,
    generos: [...livro.generos],
    createdAt: livro.createdAt,
    updatedAt: livro.updatedAt
  };
}

module.exports = { livroSchema, livroParcialSchema, lerConsulta, saida };
