'use strict';

/**
 * FACTORY da camada de persistência.
 *
 * Escolhe, pela configuração (`REPOSITORY_DRIVER`), qual família de
 * implementações usar — e devolve tudo o que o resto da aplicação precisa
 * (3 repositórios + Unit of Work), sempre combinando peças compatíveis entre si.
 * Os `require` são feitos sob demanda para que o driver "memory" não carregue
 * o Sequelize/SQLite (e vice-versa).
 *
 * Retorno: { livroRepository, estudanteRepository, emprestimoRepository, unitOfWork, encerrar }
 */
function criarPersistencia({ driver = 'sequelize', dadosIniciais = true } = {}) {
  switch (driver) {
    case 'sequelize': {
      const { obterConexao, encerrarConexao } = require('./sequelize/conexao');
      const SequelizeLivroRepository = require('./sequelize/SequelizeLivroRepository');
      const SequelizeEstudanteRepository = require('./sequelize/SequelizeEstudanteRepository');
      const SequelizeEmprestimoRepository = require('./sequelize/SequelizeEmprestimoRepository');
      const SequelizeUnitOfWork = require('./sequelize/SequelizeUnitOfWork');

      const { sequelize, modelos } = obterConexao();
      return {
        livroRepository: new SequelizeLivroRepository({ sequelize, modelos }),
        estudanteRepository: new SequelizeEstudanteRepository({ modelos }),
        emprestimoRepository: new SequelizeEmprestimoRepository({ modelos }),
        unitOfWork: new SequelizeUnitOfWork({ sequelize, modelos }),
        encerrar: encerrarConexao
      };
    }

    case 'memory': {
      const ArmazenamentoEmMemoria = require('./memory/ArmazenamentoEmMemoria');
      const InMemoryLivroRepository = require('./memory/InMemoryLivroRepository');
      const InMemoryEstudanteRepository = require('./memory/InMemoryEstudanteRepository');
      const InMemoryEmprestimoRepository = require('./memory/InMemoryEmprestimoRepository');
      const InMemoryUnitOfWork = require('./memory/InMemoryUnitOfWork');

      const armazenamento = new ArmazenamentoEmMemoria({ comDadosDemonstracao: dadosIniciais });
      return {
        livroRepository: new InMemoryLivroRepository({ armazenamento }),
        estudanteRepository: new InMemoryEstudanteRepository({ armazenamento }),
        emprestimoRepository: new InMemoryEmprestimoRepository({ armazenamento }),
        unitOfWork: new InMemoryUnitOfWork({ armazenamento }),
        encerrar: async () => {}
      };
    }

    default:
      throw new Error(`REPOSITORY_DRIVER inválido: "${driver}". Use "sequelize" ou "memory".`);
  }
}

module.exports = criarPersistencia;
