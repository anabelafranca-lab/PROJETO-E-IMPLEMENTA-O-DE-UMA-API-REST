'use strict';

const { DataTypes } = require('sequelize');

// Registra os models do ORM e suas associações. Estes models são DETALHE DE
// PERSISTÊNCIA: representam tabelas, não o domínio. O domínio está em
// `src/models` (entidades puras).
function definirModelos(sequelize) {
  const modelos = {
    Livro: require('./livro')(sequelize, DataTypes),
    Genero: require('./genero')(sequelize, DataTypes),
    LivroGenero: require('./livroGenero')(sequelize, DataTypes),
    Estudante: require('./estudante')(sequelize, DataTypes),
    Emprestimo: require('./emprestimo')(sequelize, DataTypes)
  };
  Object.values(modelos).forEach((modelo) => modelo.associate && modelo.associate(modelos));
  return modelos;
}

module.exports = { definirModelos };
