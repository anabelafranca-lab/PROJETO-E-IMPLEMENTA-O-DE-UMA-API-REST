'use strict';

// Logger mínimo. Em testes fica silencioso para não poluir a saída.
function criarLogger({ silencioso = false } = {}) {
  return {
    info: (mensagem) => !silencioso && console.log(mensagem),
    erro: (mensagem) => !silencioso && console.error(`[erro] ${mensagem}`)
  };
}

module.exports = { criarLogger };
