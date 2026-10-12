'use strict';

// Nomes dos eventos de domínio publicados pelos casos de uso.
const EVENTOS = Object.freeze({
  EMPRESTIMO_REGISTRADO: 'emprestimo.registrado',
  LIVRO_DEVOLVIDO: 'emprestimo.devolvido'
});

module.exports = { EVENTOS };
