'use strict';

const path = require('path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const criarRotas = require('./routes');
const { criarTratadorDeErros, rotaNaoEncontrada } = require('./middlewares/tratadorDeErros');

// Monta a aplicação Express a partir de um container já composto. Receber o
// container (em vez de criá-lo aqui) permite testar a API com qualquer combinação de peças.
function criarApp(container) {
  const app = express();
  app.use(express.json());

  const documentoOpenApi = YAML.load(path.join(__dirname, 'docs', 'openapi.yaml'));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(documentoOpenApi));

  app.use('/api/v1', criarRotas(container.controllers));

  // Mensagem idêntica à do Trabalho 2: o contrato externo não muda (ver ADR-0004).
  app.get('/', (req, res) => {
    res.json({
      mensagem: 'API do Sistema de Biblioteca Escolar (Trabalho 2 — com banco de dados relacional)',
      documentacao: '/docs',
      versao: 'v1',
      recursos: ['/api/v1/livros', '/api/v1/estudantes', '/api/v1/emprestimos']
    });
  });

  app.use(rotaNaoEncontrada);
  app.use(criarTratadorDeErros({ logger: container.logger }));

  return app;
}

module.exports = { criarApp };
