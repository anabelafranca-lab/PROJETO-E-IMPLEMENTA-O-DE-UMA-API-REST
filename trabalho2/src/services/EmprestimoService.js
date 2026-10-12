'use strict';

const { EmprestimoNaoEncontradoError } = require('../errors/erros');

// Consultas e substituição de empréstimos (os casos de uso com regra mais rica
// — registrar, atualizar/devolver e remover — têm serviços próprios, nomeados
// pelo que fazem no domínio).
class EmprestimoService {
  constructor({ emprestimoRepository }) {
    this.emprestimoRepository = emprestimoRepository;
  }

  listar(consulta) {
    return this.emprestimoRepository.listar(consulta);
  }

  async obter(id) {
    const emprestimo = await this.emprestimoRepository.buscarPorId(id);
    if (!emprestimo) throw new EmprestimoNaoEncontradoError(id);
    return emprestimo;
  }

  async substituir(id, dados) {
    const emprestimo = await this.obter(id);
    emprestimo.substituir(dados);
    return this.emprestimoRepository.atualizar(emprestimo);
  }
}

module.exports = EmprestimoService;
