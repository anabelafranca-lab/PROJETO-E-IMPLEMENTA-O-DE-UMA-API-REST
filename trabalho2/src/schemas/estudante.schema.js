const { z } = require('zod');

const estudanteSchema = z.object({
  nome: z.string().min(3, 'nome deve ter ao menos 3 caracteres'),
  email: z.string().email('e-mail inválido'),
  matricula: z.string().min(1, 'matrícula é obrigatória'),
  turma: z.string().min(1, 'turma é obrigatória')
});

const estudanteParcialSchema = estudanteSchema.partial();

module.exports = { estudanteSchema, estudanteParcialSchema };
