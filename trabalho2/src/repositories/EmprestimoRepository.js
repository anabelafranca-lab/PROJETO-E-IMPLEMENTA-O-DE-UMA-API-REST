'use strict';

const { naoImplementado } = require('./contrato');

/**
 * CONTRATO do repositório de empréstimos.
 *
 *   listar({ filtros, pagina, limite, ordenar, direcao }) -> { itens: Emprestimo[], total }
 *   listarPorEstudante(estudanteId, { filtros, pagina, limite }) -> { itens: Emprestimo[], total }
 *        (cada Emprestimo já vem com o resumo `livro` — carregado de uma vez, sem N+1)
 *   buscarPorId(id)         -> Emprestimo | null
 *   criar(emprestimo)       -> Emprestimo   (IntegridadeReferencialError se livro/estudante não existirem)
 *   atualizar(emprestimo)   -> Emprestimo | null
 *   remover(id)             -> boolean      (remoção física)
 *   existeAtivoDoLivro(livroId)         -> boolean
 *   existeAtivoDoEstudante(estudanteId) -> boolean
 */
class EmprestimoRepository {}
for (const metodo of [
  'listar',
  'listarPorEstudante',
  'buscarPorId',
  'criar',
  'atualizar',
  'remover',
  'existeAtivoDoLivro',
  'existeAtivoDoEstudante'
]) {
  EmprestimoRepository.prototype[metodo] = naoImplementado('EmprestimoRepository', metodo);
}

module.exports = EmprestimoRepository;
