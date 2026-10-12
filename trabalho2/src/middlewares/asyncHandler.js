'use strict';

// Express 4 não repassa para o middleware de erro as falhas de funções `async`.
// Este wrapper captura a Promise rejeitada e chama `next(erro)`.
const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

module.exports = { asyncHandler };
