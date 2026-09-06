const { z } = require('zod');

const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
const mensagemFormatoData = 'deve estar no formato AAAA-MM-DD';

const emprestimoSchema = z.object({
  livroId: z
    .number({ invalid_type_error: 'livroId é obrigatório e deve ser um número' })
    .int()
    .positive('livroId deve ser um número positivo'),
  estudanteId: z
    .number({ invalid_type_error: 'estudanteId é obrigatório e deve ser um número' })
    .int()
    .positive('estudanteId deve ser um número positivo'),
  dataEmprestimo: z.string().regex(dataRegex, `dataEmprestimo ${mensagemFormatoData}`),
  dataDevolucaoPrevista: z.string().regex(dataRegex, `dataDevolucaoPrevista ${mensagemFormatoData}`)
});

const emprestimoParcialSchema = z.object({
  livroId: z.number().int().positive().optional(),
  estudanteId: z.number().int().positive().optional(),
  dataEmprestimo: z.string().regex(dataRegex, `dataEmprestimo ${mensagemFormatoData}`).optional(),
  dataDevolucaoPrevista: z.string().regex(dataRegex, `dataDevolucaoPrevista ${mensagemFormatoData}`).optional(),
  dataDevolucaoReal: z.string().regex(dataRegex, `dataDevolucaoReal ${mensagemFormatoData}`).nullable().optional(),
  status: z.enum(['ativo', 'devolvido', 'atrasado'], {
    errorMap: () => ({ message: 'status deve ser ativo, devolvido ou atrasado' })
  }).optional()
});

module.exports = { emprestimoSchema, emprestimoParcialSchema };
