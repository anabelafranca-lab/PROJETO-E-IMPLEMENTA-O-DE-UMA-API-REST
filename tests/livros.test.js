const request = require('supertest');
const app = require('../src/app');

describe('API de Livros', () => {
  it('GET /livros deve listar livros com paginação', async () => {
    const res = await request(app).get('/api/v1/livros?page=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.dados.length).toBeLessThanOrEqual(2);
    expect(res.body.paginacao).toHaveProperty('total');
  });

  it('GET /livros?genero= deve filtrar por gênero', async () => {
    const res = await request(app).get('/api/v1/livros?genero=ficcao');
    expect(res.status).toBe(200);
    res.body.dados.forEach((livro) => expect(livro.genero).toBe('ficcao'));
  });

  it('GET /livros/:id deve retornar 404 para livro inexistente', async () => {
    const res = await request(app).get('/api/v1/livros/9999');
    expect(res.status).toBe(404);
    expect(res.body.erro.codigo).toBe('LIVRO_NAO_ENCONTRADO');
  });

  it('POST /livros deve criar um novo livro', async () => {
    const novoLivro = {
      titulo: 'Neuromancer',
      autor: 'William Gibson',
      genero: 'ficcao',
      isbn: '978-85-000-0000-1',
      anoPublicacao: 1984,
      quantidadeTotal: 2
    };
    const res = await request(app).post('/api/v1/livros').send(novoLivro);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.titulo).toBe('Neuromancer');
  });

  it('POST /livros deve retornar 400 quando faltam campos obrigatórios', async () => {
    const res = await request(app).post('/api/v1/livros').send({ titulo: 'Livro incompleto' });
    expect(res.status).toBe(400);
    expect(res.body.erro.codigo).toBe('ENTRADA_INVALIDA');
  });

  it('POST /livros deve retornar 409 para ISBN duplicado', async () => {
    const livroDuplicado = {
      titulo: 'Duplicado',
      autor: 'Autor X',
      genero: 'ficcao',
      isbn: '978-85-254-1111-6',
      anoPublicacao: 2020,
      quantidadeTotal: 1
    };
    const res = await request(app).post('/api/v1/livros').send(livroDuplicado);
    expect(res.status).toBe(409);
    expect(res.body.erro.codigo).toBe('ISBN_DUPLICADO');
  });

  it('PATCH /livros/:id deve atualizar parcialmente um livro', async () => {
    const res = await request(app).patch('/api/v1/livros/1').send({ quantidadeTotal: 10 });
    expect(res.status).toBe(200);
    expect(res.body.quantidadeTotal).toBe(10);
  });

  it('DELETE /livros/:id deve remover um livro sem empréstimos ativos', async () => {
    const res = await request(app).delete('/api/v1/livros/5');
    expect(res.status).toBe(204);
  });

  it('DELETE /livros/:id deve retornar 409 se o livro possui empréstimo ativo', async () => {
    const res = await request(app).delete('/api/v1/livros/1');
    expect(res.status).toBe(409);
    expect(res.body.erro.codigo).toBe('LIVRO_EM_USO');
  });
});
