const request = require('supertest');
const app = require('../src/app');

describe('API de Livros (com banco de dados)', () => {
  it('GET /livros deve listar com paginação', async () => {
    const res = await request(app).get('/api/v1/livros?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.dados.length).toBeLessThanOrEqual(5);
    expect(res.body.paginacao.total).toBeGreaterThanOrEqual(12);
  });

  it('GET /livros?genero= deve filtrar via JOIN no banco', async () => {
    const res = await request(app).get('/api/v1/livros?genero=ficcao-cientifica');
    expect(res.status).toBe(200);
    expect(res.body.dados.length).toBeGreaterThan(0);
    res.body.dados.forEach((livro) => expect(livro.generos).toContain('ficcao-cientifica'));
  });

  it('GET /livros?ordenar=&direcao= deve ordenar no banco', async () => {
    const res = await request(app).get('/api/v1/livros?ordenar=anoPublicacao&direcao=asc&limit=100');
    expect(res.status).toBe(200);
    const anos = res.body.dados.map((l) => l.anoPublicacao);
    const ordenado = [...anos].sort((a, b) => a - b);
    expect(anos).toEqual(ordenado);
  });

  it('GET /livros/:id deve retornar 404 para livro inexistente', async () => {
    const res = await request(app).get('/api/v1/livros/9999');
    expect(res.status).toBe(404);
    expect(res.body.erro.codigo).toBe('LIVRO_NAO_ENCONTRADO');
  });

  it('POST /livros deve criar um livro com gêneros associados', async () => {
    const novo = {
      titulo: 'O Guia do Mochileiro das Galáxias',
      autor: 'Douglas Adams',
      isbn: '978-00-000-9999-9',
      anoPublicacao: 1979,
      quantidadeTotal: 3,
      generos: ['ficcao', 'ficcao-cientifica']
    };
    const res = await request(app).post('/api/v1/livros').send(novo);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.quantidadeDisponivel).toBe(3);
    expect(res.body.generos.sort()).toEqual(['ficcao', 'ficcao-cientifica'].sort());
  });

  it('POST /livros deve retornar 400 quando faltam campos obrigatórios', async () => {
    const res = await request(app).post('/api/v1/livros').send({ titulo: 'Incompleto' });
    expect(res.status).toBe(400);
    expect(res.body.erro.codigo).toBe('ENTRADA_INVALIDA');
  });

  it('POST /livros deve retornar 409 para ISBN duplicado (restrição UNIQUE do banco)', async () => {
    const duplicado = {
      titulo: 'Duplicado',
      autor: 'Autor X',
      isbn: '978-85-254-1111-6', // mesmo ISBN de "Duna" no seed
      anoPublicacao: 2020,
      quantidadeTotal: 1,
      generos: ['ficcao']
    };
    const res = await request(app).post('/api/v1/livros').send(duplicado);
    expect(res.status).toBe(409);
  });

  it('PATCH /livros/:id deve atualizar parcialmente um livro recém-criado', async () => {
    const criado = await request(app).post('/api/v1/livros').send({
      titulo: 'Livro para PATCH',
      autor: 'Autor Y',
      isbn: '978-00-000-8888-8',
      anoPublicacao: 2000,
      quantidadeTotal: 1,
      generos: ['romance']
    });

    const res = await request(app).patch(`/api/v1/livros/${criado.body.id}`).send({ quantidadeTotal: 10 });
    expect(res.status).toBe(200);
    expect(res.body.quantidadeTotal).toBe(10);
  });

  it('DELETE /livros/:id deve retornar 409 se o livro possui empréstimo ativo', async () => {
    // livro id 1 ("Dom Casmurro") tem empréstimo ativo no seed
    const res = await request(app).delete('/api/v1/livros/1');
    expect(res.status).toBe(409);
    expect(res.body.erro.codigo).toBe('LIVRO_EM_USO');
  });

  it('DELETE /livros/:id deve remover (soft delete) um livro sem empréstimos ativos', async () => {
    const criado = await request(app).post('/api/v1/livros').send({
      titulo: 'Livro para deletar',
      autor: 'Autor Z',
      isbn: '978-00-000-7777-7',
      anoPublicacao: 2010,
      quantidadeTotal: 1,
      generos: ['poesia']
    });

    const res = await request(app).delete(`/api/v1/livros/${criado.body.id}`);
    expect(res.status).toBe(204);

    const buscaDepois = await request(app).get(`/api/v1/livros/${criado.body.id}`);
    expect(buscaDepois.status).toBe(404); // soft delete: some para a API, mas segue no banco
  });
});
