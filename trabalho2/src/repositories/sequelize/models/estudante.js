'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Estudante extends Model {
    static associate(models) {
      // 1-N: um estudante pode ter vários empréstimos ao longo do tempo
      Estudante.hasMany(models.Emprestimo, { foreignKey: 'estudanteId', as: 'emprestimos' });
    }
  }

  Estudante.init(
    {
      nome: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      matricula: { type: DataTypes.STRING, allowNull: false, unique: true },
      turma: { type: DataTypes.STRING, allowNull: false }
    },
    {
      sequelize,
      modelName: 'Estudante',
      tableName: 'estudantes',
      underscored: true,
      paranoid: true
    }
  );

  return Estudante;
};
