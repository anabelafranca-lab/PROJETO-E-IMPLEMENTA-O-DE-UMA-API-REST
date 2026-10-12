'use strict';

/**
 * OBSERVER (barramento de eventos de domínio).
 *
 * Os casos de uso PUBLICAM fatos ("um empréstimo foi registrado") sem saber
 * quem se interessa por eles; os interessados ASSINAM o evento. Um erro em um
 * assinante nunca derruba o caso de uso que já foi concluído com sucesso.
 */
class BarramentoDeEventos {
  constructor({ logger }) {
    this.logger = logger;
    this.assinantes = new Map();
  }

  assinar(evento, assinante) {
    if (!this.assinantes.has(evento)) this.assinantes.set(evento, []);
    this.assinantes.get(evento).push(assinante);
  }

  publicar(evento, carga) {
    for (const assinante of this.assinantes.get(evento) ?? []) {
      Promise.resolve()
        .then(() => assinante(carga))
        .catch((erro) => this.logger.erro(`Falha em um assinante do evento "${evento}": ${erro.message}`));
    }
  }
}

module.exports = BarramentoDeEventos;
