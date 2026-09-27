const request = require('supertest');
const app = require('../src/app');

describe('API de Estudantes (com banco de dados)', () => {
  it('GET /estudantes deve listar', async () => {
    const res = await request(app).get('/api/v1/estudantes');
    expect(res.status).toBe(200);
    expect(res.body.paginacao.total).toBeGreaterThanOrEqual(12);
  });

  it('GET /estudantes?turma= deve filtrar no banco', async () => {
    const res = await request(app).get('/api/v1/estudantes?turma=3A');
    expect(res.status).toBe(200);
    res.body.dados.forEach((e) => expect(e.turma).toBe('3A'));
  });

  it('GET /estudantes/:id deve retornar 404 para inexistente', async () => {
    const res = await request(app).get('/api/v1/estudantes/9999');
    expect(res.status).toBe(404);
    expect(res.body.erro.codigo).toBe('ESTUDANTE_NAO_ENCONTRADO');
  });

  it('GET /estudantes/:id/emprestimos deve retornar dados relacionados (livro incluso)', async () => {
    const res = await request(app).get('/api/v1/estudantes/1/emprestimos');
    expect(res.status).toBe(200);
    expect(res.body.dados.length).toBeGreaterThan(0);
    res.body.dados.forEach((emp) => {
      expect(emp.estudanteId).toBe(1);
      expect(emp.livro).toHaveProperty('titulo');
    });
  });

  it('POST /estudantes deve criar um novo estudante', async () => {
    const res = await request(app).post('/api/v1/estudantes').send({
      nome: 'Marcos Vinícius Teixeira',
      email: 'marcos.teixeira@escola.edu.br',
      matricula: '2024099',
      turma: '1B'
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('POST /estudantes deve retornar 400 para e-mail inválido', async () => {
    const res = await request(app).post('/api/v1/estudantes').send({
      nome: 'Ana',
      email: 'nao-e-um-email',
      matricula: '2024098',
      turma: '1A'
    });
    expect(res.status).toBe(400);
  });

  it('POST /estudantes deve retornar 409 para matrícula duplicada (restrição UNIQUE)', async () => {
    const res = await request(app).post('/api/v1/estudantes').send({
      nome: 'Outro Estudante',
      email: 'outro.estudante@escola.edu.br',
      matricula: '2024001', // já existe no seed
      turma: '1B'
    });
    expect(res.status).toBe(409);
  });

  it('DELETE /estudantes/:id deve retornar 409 se possui empréstimo ativo', async () => {
    const res = await request(app).delete('/api/v1/estudantes/1');
    expect(res.status).toBe(409);
    expect(res.body.erro.codigo).toBe('ESTUDANTE_COM_EMPRESTIMO_ATIVO');
  });

  it('DELETE /estudantes/:id deve remover (soft delete) estudante sem empréstimos ativos', async () => {
    const criado = await request(app).post('/api/v1/estudantes').send({
      nome: 'Estudante Descartável',
      email: 'descartavel@escola.edu.br',
      matricula: '2024097',
      turma: '1A'
    });

    const res = await request(app).delete(`/api/v1/estudantes/${criado.body.id}`);
    expect(res.status).toBe(204);
  });
});
