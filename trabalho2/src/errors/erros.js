'use strict';

/**
 * Erros da aplicação.
 *
 * Eles descrevem O QUE deu errado em termos do domínio ("livro não
 * encontrado", "sem exemplares"), nunca em termos de HTTP. Quem traduz um
 * `tipo` para um status (404, 409...) é o middleware `tratadorDeErros`, na
 * borda da aplicação. Assim, regras de negócio e repositórios podem lançar
 * erros sem saber que existe um protocolo HTTP — e a mesma regra funcionaria
 * se amanhã a entrada fosse uma fila ou uma linha de comando.
 */

const TIPOS = Object.freeze({
  NAO_ENCONTRADO: 'NAO_ENCONTRADO',
  CONFLITO: 'CONFLITO',
  ENTRADA_INVALIDA: 'ENTRADA_INVALIDA',
  INDISPONIVEL: 'INDISPONIVEL'
});

class ErroDaAplicacao extends Error {
  constructor(tipo, codigo, mensagem) {
    super(mensagem);
    this.name = this.constructor.name;
    this.tipo = tipo;
    this.codigo = codigo;
  }
}

class NaoEncontradoError extends ErroDaAplicacao {
  constructor(codigo, mensagem) {
    super(TIPOS.NAO_ENCONTRADO, codigo, mensagem);
  }
}

class ConflitoError extends ErroDaAplicacao {
  constructor(codigo, mensagem) {
    super(TIPOS.CONFLITO, codigo, mensagem);
  }
}

class EntradaInvalidaError extends ErroDaAplicacao {
  constructor(mensagem) {
    super(TIPOS.ENTRADA_INVALIDA, 'ENTRADA_INVALIDA', mensagem);
  }
}

// ---- Não encontrado ---------------------------------------------------------
class LivroNaoEncontradoError extends NaoEncontradoError {
  constructor(id) {
    super('LIVRO_NAO_ENCONTRADO', `Livro com id ${id} não encontrado`);
  }
}

class EstudanteNaoEncontradoError extends NaoEncontradoError {
  constructor(id) {
    super('ESTUDANTE_NAO_ENCONTRADO', `Estudante com id ${id} não encontrado`);
  }
}

class EmprestimoNaoEncontradoError extends NaoEncontradoError {
  constructor(id) {
    super('EMPRESTIMO_NAO_ENCONTRADO', `Empréstimo com id ${id} não encontrado`);
  }
}

class RotaNaoEncontradaError extends NaoEncontradoError {
  constructor(metodo, url) {
    super('ROTA_NAO_ENCONTRADA', `A rota ${metodo} ${url} não existe.`);
  }
}

// ---- Conflitos (regras de negócio e integridade) ---------------------------
class LivroEmUsoError extends ConflitoError {
  constructor(id) {
    super('LIVRO_EM_USO', `Livro com id ${id} possui empréstimos ativos e não pode ser removido`);
  }
}

class EstudanteComEmprestimoAtivoError extends ConflitoError {
  constructor(id) {
    super(
      'ESTUDANTE_COM_EMPRESTIMO_ATIVO',
      `Estudante com id ${id} possui empréstimos ativos e não pode ser removido`
    );
  }
}

class LivroIndisponivelError extends ConflitoError {
  constructor(titulo) {
    super('LIVRO_INDISPONIVEL', `Não há exemplares disponíveis do livro "${titulo}"`);
  }
}

// ---- Erros vindos da persistência (traduzidos pelos repositórios) ----------
class RegistroDuplicadoError extends ConflitoError {
  constructor(campo) {
    super('REGISTRO_DUPLICADO', `Já existe um registro com o mesmo valor para '${campo}'`);
    this.campo = campo;
  }
}

class IntegridadeReferencialError extends ConflitoError {
  constructor() {
    super(
      'VIOLACAO_INTEGRIDADE_REFERENCIAL',
      'A operação foi rejeitada porque violaria a integridade referencial do banco (chave estrangeira em uso ou inexistente).'
    );
  }
}

class FalhaDeConexaoError extends ErroDaAplicacao {
  constructor() {
    super(TIPOS.INDISPONIVEL, 'FALHA_DE_CONEXAO', 'Não foi possível conectar ao banco de dados no momento.');
  }
}

module.exports = {
  TIPOS,
  ErroDaAplicacao,
  NaoEncontradoError,
  ConflitoError,
  EntradaInvalidaError,
  LivroNaoEncontradoError,
  EstudanteNaoEncontradoError,
  EmprestimoNaoEncontradoError,
  RotaNaoEncontradaError,
  LivroEmUsoError,
  EstudanteComEmprestimoAtivoError,
  LivroIndisponivelError,
  RegistroDuplicadoError,
  IntegridadeReferencialError,
  FalhaDeConexaoError
};
