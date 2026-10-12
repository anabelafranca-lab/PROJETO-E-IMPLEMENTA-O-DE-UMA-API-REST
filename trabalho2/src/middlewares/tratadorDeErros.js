'use strict';

const { ErroDaAplicacao, TIPOS, RotaNaoEncontradaError } = require('../errors/erros');

// ÚNICO lugar do sistema que sabe como um erro da aplicação vira status HTTP.
const STATUS_POR_TIPO = {
  [TIPOS.NAO_ENCONTRADO]: 404,
  [TIPOS.ENTRADA_INVALIDA]: 400,
  [TIPOS.CONFLITO]: 409,
  [TIPOS.INDISPONIVEL]: 503
};

const rotaNaoEncontrada = (req, res, next) => next(new RotaNaoEncontradaError(req.method, req.originalUrl));

function criarTratadorDeErros({ logger }) {
  // eslint-disable-next-line no-unused-vars
  return (erro, req, res, next) => {
    logger.erro(`${req.method} ${req.originalUrl} -> ${erro.message}`);

    if (erro instanceof ErroDaAplicacao) {
      return res.status(STATUS_POR_TIPO[erro.tipo] ?? 500).json({ erro: { codigo: erro.codigo, mensagem: erro.message } });
    }

    // Qualquer outra coisa é um defeito inesperado: nunca vazamos detalhes ao cliente.
    return res.status(500).json({ erro: { codigo: 'ERRO_INTERNO', mensagem: 'Ocorreu um erro inesperado no servidor.' } });
  };
}

module.exports = { criarTratadorDeErros, rotaNaoEncontrada };
