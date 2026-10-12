const Livro = require('../../src/models/Livro');
const { LivroIndisponivelError } = require('../../src/errors/erros');

const dados = { titulo: 'Duna', autor: 'Frank Herbert', isbn: '978-85-254-1111-6', anoPublicacao: 1965, quantidadeTotal: 2, generos: ['Ficcao', 'FICCAO', 'Aventura'] };

describe('Entidade Livro (regras de domínio)', () => {
  it('normaliza gêneros para minúsculas e remove repetidos', () => {
    expect(Livro.criar(dados).generos).toEqual(['ficcao', 'aventura']);
  });

  it('todos os exemplares começam disponíveis quando o estoque não é informado', () => {
    expect(Livro.criar(dados).quantidadeDisponivel).toBe(2);
  });

  it('emprestar baixa o estoque e repor devolve o exemplar', () => {
    const livro = Livro.criar(dados);
    livro.emprestarExemplar();
    expect(livro.quantidadeDisponivel).toBe(1);
    livro.reporExemplar();
    expect(livro.quantidadeDisponivel).toBe(2);
  });

  it('não permite emprestar sem exemplar disponível', () => {
    const livro = Livro.criar({ ...dados, quantidadeTotal: 1 });
    livro.emprestarExemplar();
    expect(() => livro.emprestarExemplar()).toThrow(LivroIndisponivelError);
    expect(livro.quantidadeDisponivel).toBe(0);
  });
});
