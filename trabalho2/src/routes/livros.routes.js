'use strict';

const express = require('express');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { validar } = require('../middlewares/validacao');
const { livroSchema, livroParcialSchema } = require('../dtos/LivroDTO');

// Define as rotas e as liga aos métodos do controlador (recebido pronto, por injeção).
function criarRotasLivros({ controller }) {
  const router = express.Router();

  router.get('/', asyncHandler(controller.listar));
  router.get('/:id', asyncHandler(controller.buscarPorId));
  router.post('/', validar(livroSchema), asyncHandler(controller.criar));
  router.put('/:id', validar(livroSchema), asyncHandler(controller.substituir));
  router.patch('/:id', validar(livroParcialSchema), asyncHandler(controller.atualizarParcial));
  router.delete('/:id', asyncHandler(controller.remover));

  return router;
}

module.exports = criarRotasLivros;
