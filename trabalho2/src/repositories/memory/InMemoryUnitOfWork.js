'use strict';

const UnitOfWork = require('../UnitOfWork');
const InMemoryLivroRepository = require('./InMemoryLivroRepository');
const InMemoryEstudanteRepository = require('./InMemoryEstudanteRepository');
const InMemoryEmprestimoRepository = require('./InMemoryEmprestimoRepository');

/**
 * Unit of Work em memória: tira uma "foto" do armazenamento antes de começar e,
 * se o trabalho lançar um erro, restaura a foto (rollback). Execuções são
 * enfileiradas para que duas transações simultâneas não se atropelem.
 */
class InMemoryUnitOfWork extends UnitOfWork {
  constructor({ armazenamento }) {
    super();
    this.armazenamento = armazenamento;
    this.fila = Promise.resolve();
  }

  executar(trabalho) {
    const execucao = this.fila.then(async () => {
      const instantaneo = this.armazenamento.capturar();
      try {
        return await trabalho({
          livros: new InMemoryLivroRepository({ armazenamento: this.armazenamento }),
          estudantes: new InMemoryEstudanteRepository({ armazenamento: this.armazenamento }),
          emprestimos: new InMemoryEmprestimoRepository({ armazenamento: this.armazenamento })
        });
      } catch (erro) {
        this.armazenamento.restaurar(instantaneo); // ROLLBACK
        throw erro;
      }
    });
    this.fila = execucao.catch(() => {}); // um erro não pode travar a fila
    return execucao;
  }
}

module.exports = InMemoryUnitOfWork;
