'use strict';

const EstudanteDTO = require('../dtos/EstudanteDTO');
const EmprestimoDTO = require('../dtos/EmprestimoDTO');
const { lerId, montarPaginacao } = require('../dtos/consulta');

class EstudanteController {
  constructor({ estudanteService }) {
    this.estudanteService = estudanteService;
  }

  listar = async (req, res) => {
    const consulta = EstudanteDTO.lerConsulta(req.query);
    const { itens, total } = await this.estudanteService.listar(consulta);
    res.status(200).json({
      dados: itens.map(EstudanteDTO.saida),
      paginacao: montarPaginacao(total, consulta.pagina, consulta.limite)
    });
  };

  buscarPorId = async (req, res) => {
    res.status(200).json(EstudanteDTO.saida(await this.estudanteService.obter(lerId(req.params))));
  };

  criar = async (req, res) => {
    res.status(201).json(EstudanteDTO.saidaCriacao(await this.estudanteService.cadastrar(req.body)));
  };

  substituir = async (req, res) => {
    res.status(200).json(EstudanteDTO.saida(await this.estudanteService.substituir(lerId(req.params), req.body)));
  };

  atualizarParcial = async (req, res) => {
    res.status(200).json(EstudanteDTO.saida(await this.estudanteService.atualizar(lerId(req.params), req.body)));
  };

  remover = async (req, res) => {
    await this.estudanteService.remover(lerId(req.params));
    res.status(204).send();
  };

  // GET /estudantes/:id/emprestimos — dados relacionados (cada empréstimo traz o livro)
  listarEmprestimos = async (req, res) => {
    const consulta = EmprestimoDTO.lerConsultaDoEstudante(req.query);
    const { itens, total } = await this.estudanteService.listarEmprestimos(lerId(req.params), consulta);
    res.status(200).json({
      dados: itens.map(EmprestimoDTO.saidaComLivro),
      paginacao: montarPaginacao(total, consulta.pagina, consulta.limite)
    });
  };
}

module.exports = EstudanteController;
