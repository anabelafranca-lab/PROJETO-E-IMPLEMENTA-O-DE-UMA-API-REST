const request = require('supertest');
const app = require('../src/app');

describe('API de Estudantes', () => {
  it('GET /estudantes deve listar estudantes', async () => {
    const res = await request(app).get('/api/v1/estudantes');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.dados)).toBe(true);
  });

  it('GET /estudantes?turma= deve filtrar por turma', async () => {
    const res = await request(app).get('/api/v1/estudantes?turma=3A');
    expect(res.status).toBe(200);
    res.body.dados.forEach((e) => expect(e.turma).toBe('3A'));
  });

  it('GET /estudantes/:id deve retornar 404 para estudante inexistente', async () => {
    const res = await request(app).get('/api/v1/estudantes/9999');
    expect(res.status).toBe(404);
    expect(res.body.erro.codigo).toBe('ESTUDANTE_NAO_ENCONTRADO');
  });

  it('GET /estudantes/:id/emprestimos deve listar empréstimos do estudante (recurso aninhado)', async () => {
    const res = await request(app).get('/api/v1/estudantes/1/emprestimos');
    expect(res.status).toBe(200);
    res.body.dados.forEach((emp) => expect(emp.estudanteId).toBe(1));
  });

  it('POST /estudantes deve criar um novo estudante', async () => {
    const novo = {
      nome: 'Daniela Ferreira',
      email: 'daniela.ferreira@escola.edu.br',
      matricula: '2024004',
      turma: '3B'
    };
    const res = await request(app).post('/api/v1/estudantes').send(novo);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('POST /estudantes deve retornar 400 para e-mail inválido', async () => {
    const res = await request(app).post('/api/v1/estudantes').send({
      nome: 'Ana',
      email: 'nao-e-um-email',
      matricula: '2024099',
      turma: '1A'
    });
    expect(res.status).toBe(400);
    expect(res.body.erro.codigo).toBe('ENTRADA_INVALIDA');
  });

  it('POST /estudantes deve retornar 409 para matrícula duplicada', async () => {
    const res = await request(app).post('/api/v1/estudantes').send({
      nome: 'Outro Estudante',
      email: 'outro@escola.edu.br',
      matricula: '2024001',
      turma: '1B'
    });
    expect(res.status).toBe(409);
    expect(res.body.erro.codigo).toBe('MATRICULA_DUPLICADA');
  });

  it('PATCH /estudantes/:id deve atualizar parcialmente um estudante', async () => {
    const res = await request(app).patch('/api/v1/estudantes/2').send({ turma: '3C' });
    expect(res.status).toBe(200);
    expect(res.body.turma).toBe('3C');
  });

  it('DELETE /estudantes/:id deve retornar 409 se o estudante possui empréstimo ativo', async () => {
    const res = await request(app).delete('/api/v1/estudantes/1');
    expect(res.status).toBe(409);
    expect(res.body.erro.codigo).toBe('ESTUDANTE_COM_EMPRESTIMO_ATIVO');
  });

  it('DELETE /estudantes/:id deve remover um estudante sem empréstimos ativos', async () => {
    const res = await request(app).delete('/api/v1/estudantes/3');
    expect(res.status).toBe(204);
  });
});
