'use strict';

const { EVENTOS } = require('./eventos');

/**
 * Assinante dos eventos de empréstimo: monta e envia uma notificação.
 * O canal (log, e-mail, SMS...) é um `notificador` injetado — trocar o canal
 * não exige tocar nem nos casos de uso, nem neste assinante.
 */
class NotificarEmprestimoListener {
  constructor({ notificador }) {
    this.notificador = notificador;
  }

  registrarEm(eventos) {
    eventos.assinar(EVENTOS.EMPRESTIMO_REGISTRADO, ({ emprestimo, livro, estudante }) =>
      this.notificador.notificar(
        `${estudante.nome} retirou "${livro.titulo}" (devolução prevista para ${emprestimo.dataDevolucaoPrevista}).`
      )
    );

    eventos.assinar(EVENTOS.LIVRO_DEVOLVIDO, ({ emprestimo, livro }) =>
      this.notificador.notificar(
        `Devolução registrada: empréstimo #${emprestimo.id}${livro ? ` ("${livro.titulo}" voltou ao acervo)` : ''}.`
      )
    );
  }
}

module.exports = NotificarEmprestimoListener;
