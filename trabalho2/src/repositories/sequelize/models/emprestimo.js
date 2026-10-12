'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Emprestimo extends Model {
    static associate(models) {
      Emprestimo.belongsTo(models.Livro, { foreignKey: 'livroId', as: 'livro' });
      Emprestimo.belongsTo(models.Estudante, { foreignKey: 'estudanteId', as: 'estudante' });
    }
  }

  Emprestimo.init(
    {
      livroId: { type: DataTypes.INTEGER, allowNull: false, field: 'livro_id' },
      estudanteId: { type: DataTypes.INTEGER, allowNull: false, field: 'estudante_id' },
      dataEmprestimo: { type: DataTypes.DATEONLY, allowNull: false, field: 'data_emprestimo' },
      dataDevolucaoPrevista: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'data_devolucao_prevista'
      },
      dataDevolucaoReal: { type: DataTypes.DATEONLY, allowNull: true, field: 'data_devolucao_real' },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'ativo',
        validate: { isIn: [['ativo', 'devolvido', 'atrasado']] }
      }
    },
    {
      sequelize,
      modelName: 'Emprestimo',
      tableName: 'emprestimos',
      underscored: true,
    }
  );

  return Emprestimo;
};
