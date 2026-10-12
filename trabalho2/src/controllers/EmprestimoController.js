'use strict';

const EmprestimoDTO = require('../dtos/EmprestimoDTO');
const { lerId, montarPaginacao } = require('../dtos/consulta');

class EmprestimoController {
  constructor({ emprestimoService, registrarEmprestimoService, atualizarEmprestimoService, removerEmprestimoService }) {
    this.emprestimoService = emprestimoService;
    this.registrarEmprestimoService = registrarEmprestimoService;
    this.atualizarEmprestimoService = atualizarEmprestimoService;
    this.removerEmprestimoService = removerEmprestimoService;
  }

  listar = async (req, res) => {
    const consulta = EmprestimoDTO.lerConsulta(req.query);
    const { itens, total } = await this.emprestimoService.listar(consulta);
    res.status(200).json({
      dados: itens.map(EmprestimoDTO.saida),
      paginacao: montarPaginacao(total, consulta.pagina, consulta.limite)
    });
  };

  buscarPorId = async (req, res) => {
    res.status(200).json(EmprestimoDTO.saida(await this.emprestimoService.obter(lerId(req.params))));
  };

  criar = async (req, res) => {
    res.status(201).json(EmprestimoDTO.saidaCriacao(await this.registrarEmprestimoService.executar(req.body)));
  };

  substituir = async (req, res) => {
    res.status(200).json(EmprestimoDTO.saida(await this.emprestimoService.substituir(lerId(req.params), req.body)));
  };

  atualizarParcial = async (req, res) => {
    res.status(200).json(EmprestimoDTO.saida(await this.atualizarEmprestimoService.executar(lerId(req.params), req.body)));
  };

  remover = async (req, res) => {
    await this.removerEmprestimoService.executar(lerId(req.params));
    res.status(204).send();
  };
}

module.exports = EmprestimoController;
