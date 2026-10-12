'use strict';

/** @type {import('sequelize-cli').Migration} */
// Evolução do esquema: soft delete para livros e estudantes.
// Em vez de apagar fisicamente o registro (o que perderia o histórico de
// empréstimos associados), passamos a marcar `deleted_at` com a data/hora
// da remoção. Registros com `deleted_at` preenchido são tratados como
// removidos pela aplicação, mas continuam no banco para fins de auditoria
// e para preservar a integridade referencial dos empréstimos já realizados.
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('livros', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn('estudantes', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null
    });

    // Índices para acelerar filtros "somente ativos" (deleted_at IS NULL),
    // que passam a ser aplicados em praticamente toda consulta dos recursos.
    await queryInterface.addIndex('livros', ['deleted_at']);
    await queryInterface.addIndex('estudantes', ['deleted_at']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('livros', ['deleted_at']);
    await queryInterface.removeIndex('estudantes', ['deleted_at']);
    await queryInterface.removeColumn('livros', 'deleted_at');
    await queryInterface.removeColumn('estudantes', 'deleted_at');
  }
};
