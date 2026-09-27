'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // --- livros -----------------------------------------------------------
    await queryInterface.createTable('livros', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      titulo: { type: Sequelize.STRING, allowNull: false },
      autor: { type: Sequelize.STRING, allowNull: false },
      isbn: { type: Sequelize.STRING, allowNull: false, unique: true },
      ano_publicacao: { type: Sequelize.INTEGER, allowNull: false },
      quantidade_total: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      quantidade_disponivel: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // --- generos ------------------------------------------------------------
    await queryInterface.createTable('generos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nome: { type: Sequelize.STRING, allowNull: false, unique: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // --- livros_generos (tabela de junção — relacionamento muitos-para-muitos)
    await queryInterface.createTable('livros_generos', {
      livro_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: 'livros', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      genero_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: 'generos', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // --- estudantes ---------------------------------------------------------
    await queryInterface.createTable('estudantes', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nome: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      matricula: { type: Sequelize.STRING, allowNull: false, unique: true },
      turma: { type: Sequelize.STRING, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // --- emprestimos (1-N com livros e com estudantes) -----------------------
    await queryInterface.createTable('emprestimos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      livro_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'livros', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      estudante_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'estudantes', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      data_emprestimo: { type: Sequelize.DATEONLY, allowNull: false },
      data_devolucao_prevista: { type: Sequelize.DATEONLY, allowNull: false },
      data_devolucao_real: { type: Sequelize.DATEONLY, allowNull: true },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'ativo' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // Índices para as consultas mais frequentes da API
    await queryInterface.addIndex('livros', ['titulo']);
    await queryInterface.addIndex('estudantes', ['turma']);
    await queryInterface.addIndex('emprestimos', ['status']);
    await queryInterface.addIndex('emprestimos', ['estudante_id']);
    await queryInterface.addIndex('emprestimos', ['livro_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('emprestimos');
    await queryInterface.dropTable('estudantes');
    await queryInterface.dropTable('livros_generos');
    await queryInterface.dropTable('generos');
    await queryInterface.dropTable('livros');
  }
};
