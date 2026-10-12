'use strict';

const Emprestimo = require('../models/Emprestimo');
const { LivroNaoEncontradoError, EstudanteNaoEncontradoError } = require('../errors/erros');
const { EVENTOS } = require('../events/eventos');

/**
 * Caso de uso: REGISTRAR EMPRÉSTIMO.
 *
 * Em UMA transação (Unit of Work): confere que livro e estudante existem,
 * baixa o estoque do livro (invariante da entidade `Livro`) e grava o
 * empréstimo. Se qualquer passo falhar, nada é gravado. O evento de domínio só
 * é publicado DEPOIS do commit — ninguém é notificado de algo que foi desfeito.
 */
class RegistrarEmprestimoService {
  constructor({ unitOfWork, eventos }) {
    this.unitOfWork = unitOfWork;
    this.eventos = eventos;
  }

  async executar(dados) {
    const resultado = await this.unitOfWork.executar(async ({ livros, estudantes, emprestimos }) => {
      const livro = await livros.buscarPorId(dados.livroId);
      if (!livro) throw new LivroNaoEncontradoError(dados.livroId);

      const estudante = await estudantes.buscarPorId(dados.estudanteId);
      if (!estudante) throw new EstudanteNaoEncontradoError(dados.estudanteId);

      livro.emprestarExemplar(); // lança LivroIndisponivelError se não houver estoque
      const emprestimo = await emprestimos.criar(Emprestimo.registrar(dados));
      await livros.atualizar(livro);

      return { emprestimo, livro, estudante };
    });

    this.eventos.publicar(EVENTOS.EMPRESTIMO_REGISTRADO, resultado);
    return resultado.emprestimo;
  }
}

module.exports = RegistrarEmprestimoService;
