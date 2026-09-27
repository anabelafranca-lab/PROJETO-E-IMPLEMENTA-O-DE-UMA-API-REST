'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Genero extends Model {
    static associate(models) {
      Genero.belongsToMany(models.Livro, {
        through: models.LivroGenero,
        foreignKey: 'generoId',
        otherKey: 'livroId',
        as: 'livros'
      });
    }
  }

  Genero.init(
    {
      nome: { type: DataTypes.STRING, allowNull: false, unique: true }
    },
    {
      sequelize,
      modelName: 'Genero',
      tableName: 'generos',
      underscored: true,
    }
  );

  return Genero;
};
