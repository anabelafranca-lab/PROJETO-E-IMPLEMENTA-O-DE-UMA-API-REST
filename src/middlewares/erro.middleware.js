// Erro de aplicação com código HTTP e código semântico próprios.
// Lançar um ApiError dentro de qualquer controller (mesmo de forma síncrona)
// é suficiente: o Express repassa a exceção para este middleware central.
class ApiError extends Error {
  constructor(status, codigo, mensagem) {
    super(mensagem);
    this.status = status;
    this.codigo = codigo;
  }
}

function tratadorErros(err, req, res, next) {
  // Em produção isso seria substituído por um logger estruturado.
  console.error(`[erro] ${req.method} ${req.originalUrl} ->`, err.message);

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      erro: {
        codigo: err.codigo,
        mensagem: err.message
      }
    });
  }

  return res.status(500).json({
    erro: {
      codigo: 'ERRO_INTERNO',
      mensagem: 'Ocorreu um erro inesperado no servidor.'
    }
  });
}

function rotaNaoEncontrada(req, res, next) {
  next(new ApiError(404, 'ROTA_NAO_ENCONTRADA', `A rota ${req.method} ${req.originalUrl} não existe.`));
}

module.exports = { ApiError, tratadorErros, rotaNaoEncontrada };
