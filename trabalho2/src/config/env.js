'use strict';

require('dotenv').config();

// Leitura centralizada das variáveis de ambiente (nenhuma outra camada lê process.env).
module.exports = {
  ambiente: process.env.NODE_ENV || 'development',
  porta: process.env.PORT || 3000,
  repositoryDriver: process.env.REPOSITORY_DRIVER || 'sequelize',
  silencioso: process.env.NODE_ENV === 'test'
};
