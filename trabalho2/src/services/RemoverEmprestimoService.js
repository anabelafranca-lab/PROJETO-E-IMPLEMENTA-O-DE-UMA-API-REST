'use strict';

const { EmprestimoNaoEncontradoError } = require('../errors/erros');

/**
 * Caso de uso: REMOVER EMPRÉSTIMO.
 * Remover um empréstimo ainda ativo devolve o exemplar ao estoque (atomicamente).
 */
class RemoverEmprestimoService {
  constructor({ unitOfWork }) {
    this.unitOfWork = unitOfWork;
  }

  async executar(id) {
    await this.unitOfWork.executar(async ({ livros, emprestimos }) => {
      const emprestimo = await emprestimos.buscarPorId(id);
      if (!emprestimo) throw new EmprestimoNaoEncontradoError(id);

      if (emprestimo.estaAtivo()) {
        const livro = await livros.buscarPorId(emprestimo.livroId);
        if (livro) {
          livro.reporExemplar();
          await livros.atualizar(livro);
        }
      }
      await emprestimos.remover(id);
    });
  }
}

module.exports = RemoverEmprestimoService;
