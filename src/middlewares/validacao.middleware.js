const { ZodError } = require('zod');
const { ApiError } = require('./erro.middleware');

// Recebe um schema Zod e devolve um middleware que valida req.body.
// Em caso de falha, responde 400 com mensagem descritiva (formato padronizado de erro).
function validar(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const mensagens = err.errors
          .map((e) => `${e.path.join('.') || 'corpo'}: ${e.message}`)
          .join('; ');
        return next(new ApiError(400, 'ENTRADA_INVALIDA', mensagens));
      }
      next(err);
    }
  };
}

module.exports = { validar };
