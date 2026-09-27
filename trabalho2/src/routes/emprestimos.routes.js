const express = require('express');
const router = express.Router();

const controller = require('../controllers/emprestimos.controller');
const { validar } = require('../middlewares/validacao.middleware');
const { emprestimoSchema, emprestimoParcialSchema } = require('../schemas/emprestimo.schema');

router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.post('/', validar(emprestimoSchema), controller.criar);
router.put('/:id', validar(emprestimoSchema), controller.substituir);
router.patch('/:id', validar(emprestimoParcialSchema), controller.atualizarParcial);
router.delete('/:id', controller.remover);

module.exports = router;
