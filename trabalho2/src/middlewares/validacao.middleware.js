const { ZodError } = require('zod');
const { ApiError } = require('./erro.middleware');

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
