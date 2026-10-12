'use strict';

const LivroDTO = require('../dtos/LivroDTO');
const { lerId, montarPaginacao } = require('../dtos/consulta');

/**
 * Controlador HTTP de livros. Faz APENAS a tradução HTTP <-> domínio:
 * lê a requisição, chama UM caso de uso do serviço e escreve a resposta.
 * Nenhuma regra de negócio mora aqui.
 */
class LivroController {
  constructor({ livroService }) {
    this.livroService = livroService;
  }

  listar = async (req, res) => {
    const consulta = LivroDTO.lerConsulta(req.query);
    const { itens, total } = await this.livroService.listar(consulta);
    res.status(200).json({
      dados: itens.map(LivroDTO.saida),
      paginacao: montarPaginacao(total, consulta.pagina, consulta.limite)
    });
  };

  buscarPorId = async (req, res) => {
    res.status(200).json(LivroDTO.saida(await this.livroService.obter(lerId(req.params))));
  };

  criar = async (req, res) => {
    res.status(201).json(LivroDTO.saida(await this.livroService.cadastrar(req.body)));
  };

  substituir = async (req, res) => {
    res.status(200).json(LivroDTO.saida(await this.livroService.substituir(lerId(req.params), req.body)));
  };

  atualizarParcial = async (req, res) => {
    res.status(200).json(LivroDTO.saida(await this.livroService.atualizar(lerId(req.params), req.body)));
  };

  remover = async (req, res) => {
    await this.livroService.remover(lerId(req.params));
    res.status(204).send();
  };
}

module.exports = LivroController;
