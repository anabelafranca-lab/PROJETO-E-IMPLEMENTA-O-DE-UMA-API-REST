'use strict';

// Mesmos dados do seed do banco (seeders/20260921002149-demo-data.js), para que
// o sistema se comporte igual com qualquer implementação de repositório.
// A ordem dos gêneros equivale à ordem de ids do banco (1..8).
const generos = ['romance', 'ficcao', 'ficcao-cientifica', 'infantil', 'fantasia', 'biografia', 'historia', 'poesia'];

const livros = [
  { titulo: 'Dom Casmurro', autor: 'Machado de Assis', isbn: '978-85-254-1109-3', anoPublicacao: 1899, quantidadeTotal: 5, quantidadeDisponivel: 4, generos: ['romance'] },
  { titulo: 'O Cortiço', autor: 'Aluísio Azevedo', isbn: '978-85-254-1110-9', anoPublicacao: 1890, quantidadeTotal: 3, quantidadeDisponivel: 3, generos: ['romance'] },
  { titulo: 'Duna', autor: 'Frank Herbert', isbn: '978-85-254-1111-6', anoPublicacao: 1965, quantidadeTotal: 4, quantidadeDisponivel: 2, generos: ['ficcao-cientifica', 'ficcao'] },
  { titulo: 'Fundação', autor: 'Isaac Asimov', isbn: '978-85-254-1112-3', anoPublicacao: 1951, quantidadeTotal: 2, quantidadeDisponivel: 2, generos: ['ficcao-cientifica'] },
  { titulo: 'O Pequeno Príncipe', autor: 'Antoine de Saint-Exupéry', isbn: '978-85-254-1113-0', anoPublicacao: 1943, quantidadeTotal: 6, quantidadeDisponivel: 5, generos: ['infantil', 'fantasia'] },
  { titulo: 'O Hobbit', autor: 'J.R.R. Tolkien', isbn: '978-85-254-1114-7', anoPublicacao: 1937, quantidadeTotal: 5, quantidadeDisponivel: 4, generos: ['fantasia'] },
  { titulo: 'Neuromancer', autor: 'William Gibson', isbn: '978-85-254-1115-4', anoPublicacao: 1984, quantidadeTotal: 3, quantidadeDisponivel: 3, generos: ['ficcao-cientifica'] },
  { titulo: 'Memórias Póstumas de Brás Cubas', autor: 'Machado de Assis', isbn: '978-85-254-1116-1', anoPublicacao: 1881, quantidadeTotal: 4, quantidadeDisponivel: 4, generos: ['romance'] },
  { titulo: 'Steve Jobs', autor: 'Walter Isaacson', isbn: '978-85-254-1117-8', anoPublicacao: 2011, quantidadeTotal: 3, quantidadeDisponivel: 3, generos: ['biografia'] },
  { titulo: 'Sapiens: Uma Breve História da Humanidade', autor: 'Yuval Noah Harari', isbn: '978-85-254-1118-5', anoPublicacao: 2011, quantidadeTotal: 4, quantidadeDisponivel: 3, generos: ['historia'] },
  { titulo: 'Alice no País das Maravilhas', autor: 'Lewis Carroll', isbn: '978-85-254-1119-2', anoPublicacao: 1865, quantidadeTotal: 5, quantidadeDisponivel: 5, generos: ['infantil', 'fantasia'] },
  { titulo: 'Cem Anos de Solidão', autor: 'Gabriel García Márquez', isbn: '978-85-254-1120-8', anoPublicacao: 1967, quantidadeTotal: 3, quantidadeDisponivel: 2, generos: ['romance', 'ficcao'] }
];

const estudantes = [
  { nome: 'Ana Beatriz Souza', email: 'ana.souza@escola.edu.br', matricula: '2024001', turma: '3A' },
  { nome: 'Bruno Costa Lima', email: 'bruno.lima@escola.edu.br', matricula: '2024002', turma: '3A' },
  { nome: 'Carla Mendes', email: 'carla.mendes@escola.edu.br', matricula: '2024003', turma: '2B' },
  { nome: 'Daniela Ferreira', email: 'daniela.ferreira@escola.edu.br', matricula: '2024004', turma: '3B' },
  { nome: 'Eduardo Alves', email: 'eduardo.alves@escola.edu.br', matricula: '2024005', turma: '2A' },
  { nome: 'Fernanda Rocha', email: 'fernanda.rocha@escola.edu.br', matricula: '2024006', turma: '1C' },
  { nome: 'Gabriel Santos', email: 'gabriel.santos@escola.edu.br', matricula: '2024007', turma: '3A' },
  { nome: 'Helena Martins', email: 'helena.martins@escola.edu.br', matricula: '2024008', turma: '2B' },
  { nome: 'Igor Barbosa', email: 'igor.barbosa@escola.edu.br', matricula: '2024009', turma: '1A' },
  { nome: 'Juliana Pires', email: 'juliana.pires@escola.edu.br', matricula: '2024010', turma: '3B' },
  { nome: 'Kevin Nogueira', email: 'kevin.nogueira@escola.edu.br', matricula: '2024011', turma: '2A' },
  { nome: 'Larissa Cardoso', email: 'larissa.cardoso@escola.edu.br', matricula: '2024012', turma: '1C' }
];

const emprestimos = [
  { livroId: 1, estudanteId: 1, dataEmprestimo: '2026-08-01', dataDevolucaoPrevista: '2026-08-15', dataDevolucaoReal: null, status: 'ativo' },
  { livroId: 3, estudanteId: 2, dataEmprestimo: '2026-07-20', dataDevolucaoPrevista: '2026-08-03', dataDevolucaoReal: '2026-08-01', status: 'devolvido' },
  { livroId: 3, estudanteId: 5, dataEmprestimo: '2026-08-10', dataDevolucaoPrevista: '2026-08-24', dataDevolucaoReal: null, status: 'ativo' },
  { livroId: 5, estudanteId: 3, dataEmprestimo: '2026-08-05', dataDevolucaoPrevista: '2026-08-19', dataDevolucaoReal: '2026-08-18', status: 'devolvido' },
  { livroId: 6, estudanteId: 4, dataEmprestimo: '2026-08-12', dataDevolucaoPrevista: '2026-08-26', dataDevolucaoReal: null, status: 'ativo' },
  { livroId: 9, estudanteId: 6, dataEmprestimo: '2026-07-15', dataDevolucaoPrevista: '2026-07-29', dataDevolucaoReal: '2026-07-28', status: 'devolvido' },
  { livroId: 10, estudanteId: 7, dataEmprestimo: '2026-08-14', dataDevolucaoPrevista: '2026-08-28', dataDevolucaoReal: null, status: 'ativo' },
  { livroId: 12, estudanteId: 8, dataEmprestimo: '2026-08-01', dataDevolucaoPrevista: '2026-08-15', dataDevolucaoReal: null, status: 'ativo' },
  { livroId: 12, estudanteId: 9, dataEmprestimo: '2026-07-01', dataDevolucaoPrevista: '2026-07-15', dataDevolucaoReal: '2026-07-14', status: 'devolvido' },
  { livroId: 2, estudanteId: 10, dataEmprestimo: '2026-06-01', dataDevolucaoPrevista: '2026-06-15', dataDevolucaoReal: '2026-06-10', status: 'devolvido' },
  { livroId: 4, estudanteId: 11, dataEmprestimo: '2026-06-05', dataDevolucaoPrevista: '2026-06-19', dataDevolucaoReal: '2026-06-19', status: 'devolvido' },
  { livroId: 7, estudanteId: 12, dataEmprestimo: '2026-08-16', dataDevolucaoPrevista: '2026-08-30', dataDevolucaoReal: null, status: 'ativo' },
  { livroId: 8, estudanteId: 1, dataEmprestimo: '2026-05-10', dataDevolucaoPrevista: '2026-05-24', dataDevolucaoReal: '2026-05-20', status: 'devolvido' },
  { livroId: 11, estudanteId: 2, dataEmprestimo: '2026-08-18', dataDevolucaoPrevista: '2026-09-01', dataDevolucaoReal: null, status: 'ativo' }
];

module.exports = { generos, livros, estudantes, emprestimos };
