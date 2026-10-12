'use strict';

const express = require('express');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { validar } = require('../middlewares/validacao');
const { estudanteSchema, estudanteParcialSchema } = require('../dtos/EstudanteDTO');

function criarRotasEstudantes({ controller }) {
  const router = express.Router();

  router.get('/', asyncHandler(controller.listar));
  router.get('/:id', asyncHandler(controller.buscarPorId));
  router.get('/:id/emprestimos', asyncHandler(controller.listarEmprestimos)); // recurso aninhado
  router.post('/', validar(estudanteSchema), asyncHandler(controller.criar));
  router.put('/:id', validar(estudanteSchema), asyncHandler(controller.substituir));
  router.patch('/:id', validar(estudanteParcialSchema), asyncHandler(controller.atualizarParcial));
  router.delete('/:id', asyncHandler(controller.remover));

  return router;
}

module.exports = criarRotasEstudantes;
