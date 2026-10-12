'use strict';

const { naoImplementado } = require('./contrato');

/**
 * CONTRATO do repositório de estudantes.
 *
 *   listar({ filtros, pagina, limite, ordenar, direcao }) -> { itens: Estudante[], total }
 *   buscarPorId(id)      -> Estudante | null
 *   criar(estudante)     -> Estudante          (RegistroDuplicadoError se e-mail/matrícula já existirem)
 *   atualizar(estudante) -> Estudante | null
 *   remover(id)          -> boolean            (soft delete)
 */
class EstudanteRepository {}
for (const metodo of ['listar', 'buscarPorId', 'criar', 'atualizar', 'remover']) {
  EstudanteRepository.prototype[metodo] = naoImplementado('EstudanteRepository', metodo);
}

module.exports = EstudanteRepository;
