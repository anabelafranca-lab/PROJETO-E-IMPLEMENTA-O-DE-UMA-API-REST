'use strict';

const express = require('express');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { validar } = require('../middlewares/validacao');
const { emprestimoSchema, emprestimoParcialSchema } = require('../dtos/EmprestimoDTO');

function criarRotasEmprestimos({ controller }) {
  const router = express.Router();

  router.get('/', asyncHandler(controller.listar));
  router.get('/:id', asyncHandler(controller.buscarPorId));
  router.post('/', validar(emprestimoSchema), asyncHandler(controller.criar));
  router.put('/:id', validar(emprestimoSchema), asyncHandler(controller.substituir));
  router.patch('/:id', validar(emprestimoParcialSchema), asyncHandler(controller.atualizarParcial));
  router.delete('/:id', asyncHandler(controller.remover));

  return router;
}

module.exports = criarRotasEmprestimos;
