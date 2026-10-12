'use strict';

const UnitOfWork = require('../UnitOfWork');
const SequelizeLivroRepository = require('./SequelizeLivroRepository');
const SequelizeEstudanteRepository = require('./SequelizeEstudanteRepository');
const SequelizeEmprestimoRepository = require('./SequelizeEmprestimoRepository');
const { traduzindo } = require('./traducaoDeErros');

class SequelizeUnitOfWork extends UnitOfWork {
  constructor({ sequelize, modelos }) {
    super();
    this.sequelize = sequelize;
    this.modelos = modelos;
  }

  // Transação "gerenciada": commit se `trabalho` resolver, rollback se lançar.
  executar(trabalho) {
    return traduzindo(() =>
      this.sequelize.transaction((transacao) => {
        const base = { modelos: this.modelos, transacao };
        return trabalho({
          livros: new SequelizeLivroRepository({ sequelize: this.sequelize, ...base }),
          estudantes: new SequelizeEstudanteRepository(base),
          emprestimos: new SequelizeEmprestimoRepository(base)
        });
      })
    );
  }
}

module.exports = SequelizeUnitOfWork;
