'use strict';

const dados = require('./dadosDemonstracao');

/**
 * "Banco de dados" em memória, compartilhado pelos três repositórios e pela
 * Unit of Work. Guarda registros simples (com `deletedAt` para o soft delete),
 * a lista de gêneros (a posição = id, como numa tabela) e os contadores de id.
 */
class ArmazenamentoEmMemoria {
  constructor({ comDadosDemonstracao = true } = {}) {
    this.limpar();
    if (comDadosDemonstracao) this.popular();
  }

  limpar() {
    this.livros = [];
    this.estudantes = [];
    this.emprestimos = [];
    this.generos = [];
    this.proximoId = { livro: 1, estudante: 1, emprestimo: 1 };
  }

  popular() {
    const agora = new Date();
    this.generos = [...dados.generos];
    for (const l of dados.livros) {
      this.livros.push({ ...l, generos: [...l.generos], id: this.proximoId.livro++, createdAt: agora, updatedAt: agora, deletedAt: null });
    }
    for (const e of dados.estudantes) {
      this.estudantes.push({ ...e, id: this.proximoId.estudante++, createdAt: agora, updatedAt: agora, deletedAt: null });
    }
    for (const e of dados.emprestimos) {
      this.emprestimos.push({ ...e, id: this.proximoId.emprestimo++, createdAt: agora, updatedAt: agora });
    }
  }

  // Garante que todos os gêneros existam (equivale ao findOrCreate do banco).
  registrarGeneros(nomes) {
    for (const nome of nomes) if (!this.generos.includes(nome)) this.generos.push(nome);
  }

  // Ordena nomes de gênero pela "ordem de id" (como o JOIN do banco devolve).
  ordenarGeneros(nomes) {
    return [...nomes].sort((a, b) => this.generos.indexOf(a) - this.generos.indexOf(b));
  }

  // Usados pela Unit of Work para implementar rollback.
  capturar() {
    return structuredClone({
      livros: this.livros,
      estudantes: this.estudantes,
      emprestimos: this.emprestimos,
      generos: this.generos,
      proximoId: this.proximoId
    });
  }

  restaurar(instantaneo) {
    Object.assign(this, instantaneo);
  }
}

module.exports = ArmazenamentoEmMemoria;
