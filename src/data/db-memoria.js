// Dados mantidos em memória para o Sistema de Biblioteca Escolar.
// Comportamento esperado nesta etapa: os dados são reiniciados sempre
// que o servidor é reiniciado (a persistência entra no Trabalho 2).

let livros = [
  {
    id: 1,
    titulo: 'Dom Casmurro',
    autor: 'Machado de Assis',
    genero: 'romance',
    isbn: '978-85-254-1109-3',
    anoPublicacao: 1899,
    quantidadeTotal: 5,
    quantidadeDisponivel: 3
  },
  {
    id: 2,
    titulo: 'O Cortiço',
    autor: 'Aluísio Azevedo',
    genero: 'romance',
    isbn: '978-85-254-1110-9',
    anoPublicacao: 1890,
    quantidadeTotal: 3,
    quantidadeDisponivel: 3
  },
  {
    id: 3,
    titulo: 'Duna',
    autor: 'Frank Herbert',
    genero: 'ficcao',
    isbn: '978-85-254-1111-6',
    anoPublicacao: 1965,
    quantidadeTotal: 4,
    quantidadeDisponivel: 2
  },
  {
    id: 4,
    titulo: 'Fundação',
    autor: 'Isaac Asimov',
    genero: 'ficcao',
    isbn: '978-85-254-1112-3',
    anoPublicacao: 1951,
    quantidadeTotal: 2,
    quantidadeDisponivel: 2
  },
  {
    id: 5,
    titulo: 'O Pequeno Príncipe',
    autor: 'Antoine de Saint-Exupéry',
    genero: 'infantil',
    isbn: '978-85-254-1113-0',
    anoPublicacao: 1943,
    quantidadeTotal: 6,
    quantidadeDisponivel: 5
  }
];

let estudantes = [
  { id: 1, nome: 'Ana Beatriz Souza', email: 'ana.souza@escola.edu.br', matricula: '2024001', turma: '3A' },
  { id: 2, nome: 'Bruno Costa Lima', email: 'bruno.lima@escola.edu.br', matricula: '2024002', turma: '3A' },
  { id: 3, nome: 'Carla Mendes', email: 'carla.mendes@escola.edu.br', matricula: '2024003', turma: '2B' }
];

let emprestimos = [
  {
    id: 1,
    livroId: 1,
    estudanteId: 1,
    dataEmprestimo: '2026-08-01',
    dataDevolucaoPrevista: '2026-08-15',
    dataDevolucaoReal: null,
    status: 'ativo'
  },
  {
    id: 2,
    livroId: 3,
    estudanteId: 2,
    dataEmprestimo: '2026-07-20',
    dataDevolucaoPrevista: '2026-08-03',
    dataDevolucaoReal: '2026-08-01',
    status: 'devolvido'
  }
];

let proximoIdLivro = livros.length + 1;
let proximoIdEstudante = estudantes.length + 1;
let proximoIdEmprestimo = emprestimos.length + 1;

module.exports = {
  livros,
  estudantes,
  emprestimos,
  gerarIdLivro: () => proximoIdLivro++,
  gerarIdEstudante: () => proximoIdEstudante++,
  gerarIdEmprestimo: () => proximoIdEmprestimo++
};
