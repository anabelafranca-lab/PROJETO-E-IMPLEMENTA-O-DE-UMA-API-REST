'use strict';

const { EmprestimoNaoEncontradoError } = require('../errors/erros');
const { EVENTOS } = require('../events/eventos');

/**
 * Caso de uso: ATUALIZAR EMPRÉSTIMO (PATCH) — inclui a DEVOLUÇÃO do livro.
 *
 * Quando a atualização é uma devolução (transição para "devolvido"), o exemplar
 * volta ao estoque na MESMA transação em que o empréstimo é atualizado.
 */
class AtualizarEmprestimoService {
  constructor({ unitOfWork, eventos, relogio }) {
    this.unitOfWork = unitOfWork;
    this.eventos = eventos;
    this.relogio = relogio;
  }

  async executar(id, dados) {
    const resultado = await this.unitOfWork.executar(async ({ livros, emprestimos }) => {
      const emprestimo = await emprestimos.buscarPorId(id);
      if (!emprestimo) throw new EmprestimoNaoEncontradoError(id);

      const livroIdAnterior = emprestimo.livroId; // o estoque a repor é o do livro ORIGINAL do empréstimo
      const foiDevolucao = emprestimo.atualizar(dados, this.relogio.hoje());

      let livro = null;
      if (foiDevolucao) {
        livro = await livros.buscarPorId(livroIdAnterior);
        if (livro) {
          livro.reporExemplar();
          await livros.atualizar(livro);
        }
      }

      const atualizado = await emprestimos.atualizar(emprestimo);
      return { emprestimo: atualizado, livro, foiDevolucao };
    });

    if (resultado.foiDevolucao) this.eventos.publicar(EVENTOS.LIVRO_DEVOLVIDO, resultado);
    return resultado.emprestimo;
  }
}

module.exports = AtualizarEmprestimoService;
