const express = require('express');
const router = express.Router();

const controller = require('../controllers/livros.controller');
const { validar } = require('../middlewares/validacao.middleware');
const { livroSchema, livroParcialSchema } = require('../schemas/livro.schema');

router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.post('/', validar(livroSchema), controller.criar);
router.put('/:id', validar(livroSchema), controller.substituir);
router.patch('/:id', validar(livroParcialSchema), controller.atualizarParcial);
router.delete('/:id', controller.remover);

module.exports = router;
