const request = require('supertest');
const app = require('../src/app');

describe('API de Empréstimos (com banco de dados e transações)', () => {
  it('GET /emprestimos deve listar', async () => {
    const res = await request(app).get('/api/v1/emprestimos');
    expect(res.status).toBe(200);
    expect(res.body.paginacao.total).toBeGreaterThanOrEqual(14);
  });

  it('GET /emprestimos?status= deve filtrar no banco', async () => {
    const res = await request(app).get('/api/v1/emprestimos?status=ativo');
    expect(res.status).toBe(200);
    res.body.dados.forEach((e) => expect(e.status).toBe('ativo'));
  });

  it('GET /emprestimos/:id deve retornar 404 para inexistente', async () => {
    const res = await request(app).get('/api/v1/emprestimos/9999');
    expect(res.status).toBe(404);
    expect(res.body.erro.codigo).toBe('EMPRESTIMO_NAO_ENCONTRADO');
  });

  it('POST /emprestimos deve criar um empréstimo e decrementar quantidadeDisponivel transacionalmente', async () => {
    const antes = await request(app).get('/api/v1/livros/2'); // "O Cortiço", disponivel: 3 no seed
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

  it('POST /emprestimos deve retornar 404 se o livro não existir', async () => {
    const res = await request(app).post('/api/v1/emprestimos').send({
      livroId: 99999,
      estudanteId: 1,
      dataEmprestimo: '2026-09-05',
      dataDevolucaoPrevista: '2026-09-19'
    });
    expect(res.status).toBe(404);
    expect(res.body.erro.codigo).toBe('LIVRO_NAO_ENCONTRADO');
  });

  it('POST /emprestimos deve retornar 400 quando faltam campos obrigatórios', async () => {
    const res = await request(app).post('/api/v1/emprestimos').send({ livroId: 1 });
    expect(res.status).toBe(400);
  });

  it('POST /emprestimos deve retornar 409 e não alterar o banco quando não há exemplares (transação desfeita)', async () => {
    // livro id 4 ("Fundação") tem quantidadeTotal=2, quantidadeDisponivel=2 no seed
    await request(app).post('/api/v1/emprestimos').send({
      livroId: 4,
      estudanteId: 6,
      dataEmprestimo: '2026-09-05',
      dataDevolucaoPrevista: '2026-09-19'
    });
    await request(app).post('/api/v1/emprestimos').send({
      livroId: 4,
      estudanteId: 7,
      dataEmprestimo: '2026-09-05',
      dataDevolucaoPrevista: '2026-09-19'
    });

    const totalAntes = (await request(app).get('/api/v1/emprestimos?livroId=4')).body.paginacao.total;

    const res = await request(app).post('/api/v1/emprestimos').send({
      livroId: 4,
      estudanteId: 8,
      dataEmprestimo: '2026-09-05',
      dataDevolucaoPrevista: '2026-09-19'
    });
    expect(res.status).toBe(409);
    expect(res.body.erro.codigo).toBe('LIVRO_INDISPONIVEL');

    // a transação não deve ter criado um empréstimo "fantasma"
    const totalDepois = (await request(app).get('/api/v1/emprestimos?livroId=4')).body.paginacao.total;
    expect(totalDepois).toBe(totalAntes);
  });

  it('PATCH /emprestimos/:id com status=devolvido deve repor a quantidade disponível', async () => {
    const criado = await request(app).post('/api/v1/emprestimos').send({
      livroId: 9,
      estudanteId: 10,
      dataEmprestimo: '2026-09-05',
      dataDevolucaoPrevista: '2026-09-19'
    });

    const antesLivro = await request(app).get('/api/v1/livros/9');
    const disponivelAntes = antesLivro.body.quantidadeDisponivel;

    const res = await request(app)
      .patch(`/api/v1/emprestimos/${criado.body.id}`)
      .send({ status: 'devolvido', dataDevolucaoReal: '2026-09-10' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('devolvido');

    const depoisLivro = await request(app).get('/api/v1/livros/9');
    expect(depoisLivro.body.quantidadeDisponivel).toBe(disponivelAntes + 1);
  });

  it('DELETE /emprestimos/:id deve remover e repor a quantidade se o empréstimo estava ativo', async () => {
    const criado = await request(app).post('/api/v1/emprestimos').send({
      livroId: 11,
      estudanteId: 12,
      dataEmprestimo: '2026-09-05',
      dataDevolucaoPrevista: '2026-09-19'
    });

    const antesLivro = await request(app).get('/api/v1/livros/11');
    const disponivelAntes = antesLivro.body.quantidadeDisponivel;

    const res = await request(app).delete(`/api/v1/emprestimos/${criado.body.id}`);
    expect(res.status).toBe(204);

    const depoisLivro = await request(app).get('/api/v1/livros/11');
    expect(depoisLivro.body.quantidadeDisponivel).toBe(disponivelAntes + 1);
  });
});
