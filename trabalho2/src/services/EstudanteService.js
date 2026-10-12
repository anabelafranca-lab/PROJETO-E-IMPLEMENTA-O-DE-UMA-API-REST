'use strict';

const Estudante = require('../models/Estudante');
const { EstudanteNaoEncontradoError, EstudanteComEmprestimoAtivoError } = require('../errors/erros');

class EstudanteService {
  constructor({ estudanteRepository, emprestimoRepository }) {
    this.estudanteRepository = estudanteRepository;
    this.emprestimoRepository = emprestimoRepository;
  }

  listar(consulta) {
    return this.estudanteRepository.listar(consulta);
  }

  async obter(id) {
    const estudante = await this.estudanteRepository.buscarPorId(id);
    if (!estudante) throw new EstudanteNaoEncontradoError(id);
    return estudante;
  }

  cadastrar(dados) {
    return this.estudanteRepository.criar(Estudante.criar(dados));
  }

  async substituir(id, dados) {
    const estudante = await this.obter(id);
    estudante.substituir(dados);
    return this.estudanteRepository.atualizar(estudante);
  }

  async atualizar(id, dados) {
    const estudante = await this.obter(id);
    estudante.atualizar(dados);
    return this.estudanteRepository.atualizar(estudante);
  }

  // Regra de negócio: estudante com empréstimo ativo não pode ser removido.
  async remover(id) {
    await this.obter(id);
    if (await this.emprestimoRepository.existeAtivoDoEstudante(id)) throw new EstudanteComEmprestimoAtivoError(id);
    await this.estudanteRepository.remover(id);
  }

  // Dados relacionados: empréstimos do estudante, já com o resumo do livro.
  async listarEmprestimos(id, consulta) {
    await this.obter(id);
    return this.emprestimoRepository.listarPorEstudante(id, consulta);
  }
}

module.exports = EstudanteService;
