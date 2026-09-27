// Express 4 não repassa automaticamente erros lançados dentro de funções
// async para o middleware de erro — é preciso capturar a Promise rejeitada
// e chamar next(err) manualmente. Este wrapper evita repetir try/catch em
// cada controller.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };
