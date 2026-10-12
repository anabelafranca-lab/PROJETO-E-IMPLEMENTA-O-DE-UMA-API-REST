'use strict';

class Estudante {
  constructor({ id = null, nome, email, matricula, turma, createdAt = null, updatedAt = null }) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.matricula = matricula;
    this.turma = turma;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static criar(dados) {
    return new Estudante(dados);
  }

  substituir(dados) {
    this.nome = dados.nome;
    this.email = dados.email;
    this.matricula = dados.matricula;
    this.turma = dados.turma;
  }

  atualizar(dados) {
    for (const campo of ['nome', 'email', 'matricula', 'turma']) {
      if (dados[campo] !== undefined) this[campo] = dados[campo];
    }
  }
}

module.exports = Estudante;
