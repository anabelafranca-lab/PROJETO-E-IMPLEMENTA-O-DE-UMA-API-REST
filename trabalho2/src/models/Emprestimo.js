'use strict';

const STATUS = Object.freeze({ ATIVO: 'ativo', DEVOLVIDO: 'devolvido', ATRASADO: 'atrasado' });

class Emprestimo {
  constructor({
    id = null,
    livroId,
    estudanteId,
    dataEmprestimo,
    dataDevolucaoPrevista,
    dataDevolucaoReal = null,
    status = STATUS.ATIVO,
    createdAt = null,
    updatedAt = null,
    livro = undefined // resumo { id, titulo, autor }, preenchido só em consultas que o incluem
  }) {
    this.id = id;
    this.livroId = livroId;
    this.estudanteId = estudanteId;
    this.dataEmprestimo = dataEmprestimo;
    this.dataDevolucaoPrevista = dataDevolucaoPrevista;
    this.dataDevolucaoReal = dataDevolucaoReal;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    if (livro !== undefined) this.livro = livro;
  }

  // Todo empréstimo nasce ativo e ainda sem data de devolução real.
  static registrar({ livroId, estudanteId, dataEmprestimo, dataDevolucaoPrevista }) {
    return new Emprestimo({ livroId, estudanteId, dataEmprestimo, dataDevolucaoPrevista, status: STATUS.ATIVO });
  }

  estaAtivo() {
    return this.status === STATUS.ATIVO;
  }

  foiDevolvido() {
    return this.status === STATUS.DEVOLVIDO;
  }

  // PUT: substitui os dados informados do empréstimo (status e devolução real não mudam).
  substituir({ livroId, estudanteId, dataEmprestimo, dataDevolucaoPrevista }) {
    this.livroId = livroId;
    this.estudanteId = estudanteId;
    this.dataEmprestimo = dataEmprestimo;
    this.dataDevolucaoPrevista = dataDevolucaoPrevista;
  }

  /**
   * PATCH: aplica só os campos informados.
   * Devolve `true` quando a atualização representa uma DEVOLUÇÃO (a transição
   * para "devolvido" de um empréstimo que ainda não estava devolvido) — quem
   * orquestra o caso de uso usa isso para repor o exemplar no estoque.
   * Ao devolver sem informar a data real, assume-se `hoje`.
   */
  atualizar(dados, hoje) {
    const campos = { ...dados };
    const devolucao = campos.status === STATUS.DEVOLVIDO && !this.foiDevolvido();
    if (devolucao && !campos.dataDevolucaoReal) campos.dataDevolucaoReal = hoje;

    for (const campo of [
      'livroId',
      'estudanteId',
      'dataEmprestimo',
      'dataDevolucaoPrevista',
      'dataDevolucaoReal',
      'status'
    ]) {
      if (campos[campo] !== undefined) this[campo] = campos[campo];
    }
    return devolucao;
  }
}

module.exports = Emprestimo;
module.exports.STATUS = STATUS;
