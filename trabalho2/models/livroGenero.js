'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LivroGenero extends Model {
    static associate() {
      // A tabela de junção em si não precisa de associações adicionais;
      // as associações N-N são declaradas em Livro e Genero via `through`.
    }
  }

  LivroGenero.init(
    {
      livroId: { type: DataTypes.INTEGER, allowNull: false, field: 'livro_id' },
      generoId: { type: DataTypes.INTEGER, allowNull: false, field: 'genero_id' }
    },
    {
      sequelize,
      modelName: 'LivroGenero',
      tableName: 'livros_generos',
      underscored: true,
    }
  );

  return LivroGenero;
};
