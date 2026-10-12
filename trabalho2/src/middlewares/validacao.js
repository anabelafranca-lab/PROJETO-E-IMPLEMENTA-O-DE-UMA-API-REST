'use strict';

const { ZodError } = require('zod');
const { EntradaInvalidaError } = require('../errors/erros');

// Valida `req.body` contra um schema Zod; em caso de falha, responde 400 com mensagem descritiva.
function validar(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (erro) {
      if (erro instanceof ZodError) {
        const mensagens = erro.errors.map((e) => `${e.path.join('.') || 'corpo'}: ${e.message}`).join('; ');
        return next(new EntradaInvalidaError(mensagens));
      }
      next(erro);
    }
  };
}

module.exports = { validar };
