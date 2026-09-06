const { z } = require('zod');

const livroSchema = z.object({
  titulo: z.string().min(1, 'título é obrigatório'),
  autor: z.string().min(1, 'autor é obrigatório'),
  genero: z.string().min(1, 'gênero é obrigatório'),
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
  quantidadeDisponivel: z
    .number()
    .int()
    .nonnegative()
    .optional()
});

const livroParcialSchema = livroSchema.partial();

module.exports = { livroSchema, livroParcialSchema };
