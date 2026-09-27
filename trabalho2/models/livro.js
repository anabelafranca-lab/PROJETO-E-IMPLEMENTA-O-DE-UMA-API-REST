'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Livro extends Model {
    static associate(models) {
      // N-N: um livro pode ter vários gêneros, e um gênero vários livros
      Livro.belongsToMany(models.Genero, {
        through: models.LivroGenero,
        foreignKey: 'livroId',
        otherKey: 'generoId',
        as: 'generos'
      });
      // 1-N: um livro pode ter vários empréstimos ao longo do tempo
      Livro.hasMany(models.Emprestimo, { foreignKey: 'livroId', as: 'emprestimos' });
    }
  }

  Livro.init(
    {
      titulo: { type: DataTypes.STRING, allowNull: false },
      autor: { type: DataTypes.STRING, allowNull: false },
      isbn: { type: DataTypes.STRING, allowNull: false, unique: true },
      anoPublicacao: { type: DataTypes.INTEGER, allowNull: false, field: 'ano_publicacao' },
      quantidadeTotal: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'quantidade_total' },
      quantidadeDisponivel: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'quantidade_disponivel'
      }
    },
    {
      sequelize,
      modelName: 'Livro',
      tableName: 'livros',
      underscored: true,
      // Soft delete: DELETE /livros/:id não apaga a linha, apenas grava
      // deleted_at. Consultas normais já ignoram registros removidos.
      paranoid: true
    }
  );

  return Livro;
};
