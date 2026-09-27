class ApiError extends Error {
  constructor(status, codigo, mensagem) {
    super(mensagem);
    this.status = status;
    this.codigo = codigo;
  }
}

// Traduz erros específicos do Sequelize/SGBD para o formato padronizado da API.
// Isso garante que a mensagem bruta do banco nunca "vaze" para o cliente.
function traduzirErroSequelize(err) {
  if (err.name === 'SequelizeUniqueConstraintError') {
    const campo = err.errors?.[0]?.path || 'campo único';
    return new ApiError(409, 'REGISTRO_DUPLICADO', `Já existe um registro com o mesmo valor para '${campo}'`);
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return new ApiError(
      409,
      'VIOLACAO_INTEGRIDADE_REFERENCIAL',
      'A operação foi rejeitada porque violaria a integridade referencial do banco (chave estrangeira em uso ou inexistente).'
    );
  }

  if (err.name === 'SequelizeValidationError') {
    const mensagens = err.errors.map((e) => `${e.path}: ${e.message}`).join('; ');
    return new ApiError(400, 'ENTRADA_INVALIDA', mensagens);
  }

  if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
    return new ApiError(503, 'FALHA_DE_CONEXAO', 'Não foi possível conectar ao banco de dados no momento.');
  }

  return null;
}

function tratadorErros(err, req, res, next) {
  console.error(`[erro] ${req.method} ${req.originalUrl} ->`, err.message);

  if (err instanceof ApiError) {
    return res.status(err.status).json({ erro: { codigo: err.codigo, mensagem: err.message } });
  }

  const erroTraduzido = traduzirErroSequelize(err);
  if (erroTraduzido) {
    return res.status(erroTraduzido.status).json({ erro: { codigo: erroTraduzido.codigo, mensagem: erroTraduzido.message } });
  }

  return res.status(500).json({
    erro: { codigo: 'ERRO_INTERNO', mensagem: 'Ocorreu um erro inesperado no servidor.' }
  });
}

function rotaNaoEncontrada(req, res, next) {
  next(new ApiError(404, 'ROTA_NAO_ENCONTRADA', `A rota ${req.method} ${req.originalUrl} não existe.`));
}

module.exports = { ApiError, tratadorErros, rotaNaoEncontrada };
