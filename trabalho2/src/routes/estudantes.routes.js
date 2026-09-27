const express = require('express');
const router = express.Router();

const controller = require('../controllers/estudantes.controller');
const { validar } = require('../middlewares/validacao.middleware');
const { estudanteSchema, estudanteParcialSchema } = require('../schemas/estudante.schema');

router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.get('/:id/emprestimos', controller.listarEmprestimosDoEstudante);
router.post('/', validar(estudanteSchema), controller.criar);
router.put('/:id', validar(estudanteSchema), controller.substituir);
router.patch('/:id', validar(estudanteParcialSchema), controller.atualizarParcial);
router.delete('/:id', controller.remover);

module.exports = router;
