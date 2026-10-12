'use strict';

const js = require('@eslint/js');
const globals = require('globals');

// Seletor que casa com `require('<algo que contém X>')`.
const requer = (padrao) => `CallExpression[callee.name='require'][arguments.0.value=/${padrao}/]`;

const proibir = (...regras) => ({
  'no-restricted-syntax': ['error', ...regras.map(([selector, message]) => ({ selector, message }))]
});

const MSG_ORM = 'O ORM só pode ser usado dentro de src/repositories/sequelize (camada de persistência).';
const MSG_REPOSITORIO = 'Camadas acima dos serviços não acessam repositórios: dependa de um serviço (recebido por injeção).';

module.exports = [
  { ignores: ['node_modules/**', 'data/**', 'coverage/**'] },

  js.configs.recommended,

  {
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'commonjs', globals: { ...globals.node } },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always']
    }
  },

  // Testes rodam com Jest.
  { files: ['tests/**/*.js'], languageOptions: { globals: { ...globals.jest } } },

  // ---- Regras de arquitetura (a mesma verificação roda em tests/arquitetura.test.js) ----

  // O ORM não pode aparecer fora da camada de persistência.
  {
    files: ['src/**/*.js'],
    ignores: ['src/repositories/sequelize/**'],
    rules: proibir([requer('^sequelize$'), MSG_ORM])
  },

  // Rotas, controladores, DTOs e domínio não conhecem repositórios.
  {
    files: ['src/routes/**', 'src/controllers/**', 'src/dtos/**', 'src/models/**', 'src/errors/**'],
    rules: proibir([requer('^sequelize$'), MSG_ORM], [requer('repositories'), MSG_REPOSITORIO])
  },

  // Serviços: nada de HTTP, ORM, repositórios concretos ou camadas superiores.
  {
    files: ['src/services/**'],
    rules: proibir(
      [requer('^sequelize$'), MSG_ORM],
      [requer('^express$'), 'Serviços não conhecem Express/HTTP.'],
      [requer('repositories'), 'Serviços recebem repositórios por injeção; não os importam.'],
      [requer('controllers|routes|middlewares|dtos'), 'Serviços não dependem de camadas superiores.']
    )
  },

  // O logger é o único módulo autorizado a usar o console.
  { files: ['src/config/logger.js'], rules: { 'no-console': 'off' } }
];
