'use strict';

/**
 * Popula o banco com dados de demonstração:
 * - 8 gêneros
 * - 12 livros (>= 10) com relacionamento N-N para gêneros
 * - 12 estudantes (>= 10)
 * - 14 empréstimos (>= 10), misturando status "ativo" e "devolvido"
 *
 * Os IDs abaixo assumem uma tabela vazia (autoincrement começando em 1),
 * o que é sempre o caso logo após `sequelize-cli db:migrate` num banco novo.
 */
module.exports = {
  async up(queryInterface) {
    const agora = new Date();

    // --- Gêneros ------------------------------------------------------------
    const generos = [
      'romance',
      'ficcao',
      'ficcao-cientifica',
      'infantil',
      'fantasia',
      'biografia',
      'historia',
      'poesia'
    ].map((nome) => ({ nome, created_at: agora, updated_at: agora }));
    await queryInterface.bulkInsert('generos', generos);

    // Mapeamento nome -> id (1-indexado, na ordem inserida acima)
    const idGenero = {
      romance: 1,
      ficcao: 2,
      'ficcao-cientifica': 3,
      infantil: 4,
      fantasia: 5,
      biografia: 6,
      historia: 7,
      poesia: 8
    };

    // --- Livros ---------------------------------------------------------------
    const livrosDados = [
      { titulo: 'Dom Casmurro', autor: 'Machado de Assis', isbn: '978-85-254-1109-3', ano: 1899, total: 5, disponivel: 4, generos: ['romance'] },
      { titulo: 'O Cortiço', autor: 'Aluísio Azevedo', isbn: '978-85-254-1110-9', ano: 1890, total: 3, disponivel: 3, generos: ['romance'] },
      { titulo: 'Duna', autor: 'Frank Herbert', isbn: '978-85-254-1111-6', ano: 1965, total: 4, disponivel: 2, generos: ['ficcao-cientifica', 'ficcao'] },
      { titulo: 'Fundação', autor: 'Isaac Asimov', isbn: '978-85-254-1112-3', ano: 1951, total: 2, disponivel: 2, generos: ['ficcao-cientifica'] },
      { titulo: 'O Pequeno Príncipe', autor: 'Antoine de Saint-Exupéry', isbn: '978-85-254-1113-0', ano: 1943, total: 6, disponivel: 5, generos: ['infantil', 'fantasia'] },
      { titulo: 'O Hobbit', autor: 'J.R.R. Tolkien', isbn: '978-85-254-1114-7', ano: 1937, total: 5, disponivel: 4, generos: ['fantasia'] },
      { titulo: 'Neuromancer', autor: 'William Gibson', isbn: '978-85-254-1115-4', ano: 1984, total: 3, disponivel: 3, generos: ['ficcao-cientifica'] },
      { titulo: 'Memórias Póstumas de Brás Cubas', autor: 'Machado de Assis', isbn: '978-85-254-1116-1', ano: 1881, total: 4, disponivel: 4, generos: ['romance'] },
      { titulo: 'Steve Jobs', autor: 'Walter Isaacson', isbn: '978-85-254-1117-8', ano: 2011, total: 3, disponivel: 3, generos: ['biografia'] },
      { titulo: 'Sapiens: Uma Breve História da Humanidade', autor: 'Yuval Noah Harari', isbn: '978-85-254-1118-5', ano: 2011, total: 4, disponivel: 3, generos: ['historia'] },
      { titulo: 'Alice no País das Maravilhas', autor: 'Lewis Carroll', isbn: '978-85-254-1119-2', ano: 1865, total: 5, disponivel: 5, generos: ['infantil', 'fantasia'] },
      { titulo: 'Cem Anos de Solidão', autor: 'Gabriel García Márquez', isbn: '978-85-254-1120-8', ano: 1967, total: 3, disponivel: 2, generos: ['romance', 'ficcao'] }
    ];

    const livrosParaInserir = livrosDados.map((l) => ({
      titulo: l.titulo,
      autor: l.autor,
      isbn: l.isbn,
      ano_publicacao: l.ano,
      quantidade_total: l.total,
      quantidade_disponivel: l.disponivel,
      created_at: agora,
      updated_at: agora
    }));
    await queryInterface.bulkInsert('livros', livrosParaInserir);

    const livrosGeneros = [];
    livrosDados.forEach((livro, indice) => {
      const livroId = indice + 1; // ids sequenciais 1..12
      livro.generos.forEach((nomeGenero) => {
        livrosGeneros.push({
          livro_id: livroId,
          genero_id: idGenero[nomeGenero],
          created_at: agora,
          updated_at: agora
        });
      });
    });
    await queryInterface.bulkInsert('livros_generos', livrosGeneros);

    // --- Estudantes -------------------------------------------------------
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
    ].map((e) => ({ ...e, created_at: agora, updated_at: agora }));
    await queryInterface.bulkInsert('estudantes', estudantes);

    // --- Empréstimos --------------------------------------------------------
    const emprestimos = [
      { livro_id: 1, estudante_id: 1, dataEmprestimo: '2026-08-01', prevista: '2026-08-15', real: null, status: 'ativo' },
      { livro_id: 3, estudante_id: 2, dataEmprestimo: '2026-07-20', prevista: '2026-08-03', real: '2026-08-01', status: 'devolvido' },
      { livro_id: 3, estudante_id: 5, dataEmprestimo: '2026-08-10', prevista: '2026-08-24', real: null, status: 'ativo' },
      { livro_id: 5, estudante_id: 3, dataEmprestimo: '2026-08-05', prevista: '2026-08-19', real: '2026-08-18', status: 'devolvido' },
      { livro_id: 6, estudante_id: 4, dataEmprestimo: '2026-08-12', prevista: '2026-08-26', real: null, status: 'ativo' },
      { livro_id: 9, estudante_id: 6, dataEmprestimo: '2026-07-15', prevista: '2026-07-29', real: '2026-07-28', status: 'devolvido' },
      { livro_id: 10, estudante_id: 7, dataEmprestimo: '2026-08-14', prevista: '2026-08-28', real: null, status: 'ativo' },
      { livro_id: 12, estudante_id: 8, dataEmprestimo: '2026-08-01', prevista: '2026-08-15', real: null, status: 'ativo' },
      { livro_id: 12, estudante_id: 9, dataEmprestimo: '2026-07-01', prevista: '2026-07-15', real: '2026-07-14', status: 'devolvido' },
      { livro_id: 2, estudante_id: 10, dataEmprestimo: '2026-06-01', prevista: '2026-06-15', real: '2026-06-10', status: 'devolvido' },
      { livro_id: 4, estudante_id: 11, dataEmprestimo: '2026-06-05', prevista: '2026-06-19', real: '2026-06-19', status: 'devolvido' },
      { livro_id: 7, estudante_id: 12, dataEmprestimo: '2026-08-16', prevista: '2026-08-30', real: null, status: 'ativo' },
      { livro_id: 8, estudante_id: 1, dataEmprestimo: '2026-05-10', prevista: '2026-05-24', real: '2026-05-20', status: 'devolvido' },
      { livro_id: 11, estudante_id: 2, dataEmprestimo: '2026-08-18', prevista: '2026-09-01', real: null, status: 'ativo' }
    ].map((e) => ({
      livro_id: e.livro_id,
      estudante_id: e.estudante_id,
      data_emprestimo: e.dataEmprestimo,
      data_devolucao_prevista: e.prevista,
      data_devolucao_real: e.real,
      status: e.status,
      created_at: agora,
      updated_at: agora
    }));
    await queryInterface.bulkInsert('emprestimos', emprestimos);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('emprestimos', null, {});
    await queryInterface.bulkDelete('livros_generos', null, {});
    await queryInterface.bulkDelete('estudantes', null, {});
    await queryInterface.bulkDelete('livros', null, {});
    await queryInterface.bulkDelete('generos', null, {});
  }
};
