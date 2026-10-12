'use strict';

const { naoImplementado } = require('./contrato');

/**
 * CONTRATO do repositório de livros.
 *
 * É esta classe — e não o Sequelize — que a camada de serviços conhece.
 * Todas as assinaturas públicas trabalham apenas com entidades de domínio
 * (`Livro`) e objetos simples; nenhum tipo do ORM atravessa esta fronteira.
 *
 *   listar({ filtros, pagina, limite, ordenar, direcao }) -> { itens: Livro[], total }
 *   buscarPorId(id)  -> Livro | null          (ignora livros removidos)
 *   criar(livro)     -> Livro                 (lança RegistroDuplicadoError se o ISBN já existir)
 *   atualizar(livro) -> Livro | null          (persiste o estado atual da entidade)
 *   remover(id)      -> boolean               (remoção lógica / soft delete)
 */
class LivroRepository {}
for (const metodo of ['listar', 'buscarPorId', 'criar', 'atualizar', 'remover']) {
  LivroRepository.prototype[metodo] = naoImplementado('LivroRepository', metodo);
}

module.exports = LivroRepository;
