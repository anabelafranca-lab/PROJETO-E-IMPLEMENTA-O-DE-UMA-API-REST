const request = require('supertest');
const app = require('../src/app');

describe('API de Empréstimos', () => {
  it('GET /emprestimos deve listar empréstimos', async () => {
    const res = await request(app).get('/api/v1/emprestimos');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.dados)).toBe(true);
  });

  it('GET /emprestimos?status= deve filtrar por status', async () => {
    const res = await request(app).get('/api/v1/emprestimos?status=ativo');
    expect(res.status).toBe(200);
    res.body.dados.forEach((e) => expect(e.status).toBe('ativo'));
  });

  it('GET /emprestimos/:id deve retornar 404 para empréstimo inexistente', async () => {
    const res = await request(app).get('/api/v1/emprestimos/9999');
    expect(res.status).toBe(404);
    expect(res.body.erro.codigo).toBe('EMPRESTIMO_NAO_ENCONTRADO');
  });

  it('POST /emprestimos deve criar um empréstimo e decrementar quantidadeDisponivel do livro', async () => {
    const antes = await request(app).get('/api/v1/livros/2');
    const disponivelAntes = antes.body.quantidadeDisponivel;

    const res = await request(app).post('/api/v1/emprestimos').send({
      livroId: 2,
      estudanteId: 3,
      dataEmprestimo: '2026-09-05',
      dataDevolucaoPrevista: '2026-09-19'
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('ativo');

    const depois = await request(app).get('/api/v1/livros/2');
    expect(depois.body.quantidadeDisponivel).toBe(disponivelAntes - 1);
  });

  it('POST /emprestimos deve retornar 400 quando faltam campos obrigatórios', async () => {
    const res = await request(app).post('/api/v1/emprestimos').send({ livroId: 1 });
    expect(res.status).toBe(400);
    expect(res.body.erro.codigo).toBe('ENTRADA_INVALIDA');
  });

  it('POST /emprestimos deve retornar 409 quando não há exemplares disponíveis', async () => {
    const res = await request(app).post('/api/v1/emprestimos').send({
      livroId: 4,
      estudanteId: 1,
      dataEmprestimo: '2026-09-05',
      dataDevolucaoPrevista: '2026-09-19'
    });
    // livro id 4 tem quantidadeDisponivel: 2 no seed; consumindo os 2 exemplares antes
    if (res.status !== 409) {
      await request(app).post('/api/v1/emprestimos').send({
        livroId: 4,
        estudanteId: 2,
        dataEmprestimo: '2026-09-05',
        dataDevolucaoPrevista: '2026-09-19'
      });
      const resFinal = await request(app).post('/api/v1/emprestimos').send({
        livroId: 4,
        estudanteId: 3,
        dataEmprestimo: '2026-09-05',
        dataDevolucaoPrevista: '2026-09-19'
      });
      expect(resFinal.status).toBe(409);
      expect(resFinal.body.erro.codigo).toBe('LIVRO_INDISPONIVEL');
    } else {
      expect(res.body.erro.codigo).toBe('LIVRO_INDISPONIVEL');
    }
  });

  it('PATCH /emprestimos/:id com status devolvido deve repor a quantidade disponível', async () => {
    const antesLivro = await request(app).get('/api/v1/livros/1');
    const disponivelAntes = antesLivro.body.quantidadeDisponivel;

    const res = await request(app)
      .patch('/api/v1/emprestimos/1')
      .send({ status: 'devolvido', dataDevolucaoReal: '2026-09-10' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('devolvido');

    const depoisLivro = await request(app).get('/api/v1/livros/1');
    expect(depoisLivro.body.quantidadeDisponivel).toBe(disponivelAntes + 1);
  });

  it('DELETE /emprestimos/:id deve remover um empréstimo', async () => {
    const res = await request(app).delete('/api/v1/emprestimos/2');
    expect(res.status).toBe(204);
  });
});
