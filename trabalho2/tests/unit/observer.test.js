const request = require('supertest');
const { criarAppDeTeste } = require('../helpers/criarAppDeTeste');
const BarramentoDeEventos = require('../../src/events/BarramentoDeEventos');

const aguardar = () => new Promise((resolve) => setImmediate(resolve));

describe('Observer — eventos de domínio', () => {
  it('um empréstimo registrado via API dispara a notificação, sem o caso de uso conhecer o notificador', async () => {
    const mensagens = [];
    const { app, container } = criarAppDeTeste({ driver: 'memory', notificador: { notificar: (m) => mensagens.push(m) } });

    await request(app)
      .post('/api/v1/emprestimos')
      .send({ livroId: 2, estudanteId: 3, dataEmprestimo: '2026-09-05', dataDevolucaoPrevista: '2026-09-19' })
      .expect(201);
    await aguardar();

    expect(mensagens).toHaveLength(1);
    expect(mensagens[0]).toContain('Carla Mendes');
    expect(mensagens[0]).toContain('O Cortiço');
    await container.encerrar();
  });

  it('uma operação que falha (409) não notifica ninguém', async () => {
    const mensagens = [];
    const { app, container } = criarAppDeTeste({ driver: 'memory', notificador: { notificar: (m) => mensagens.push(m) } });
    await request(app).post('/api/v1/emprestimos').send({ livroId: 99999, estudanteId: 1, dataEmprestimo: '2026-09-05', dataDevolucaoPrevista: '2026-09-19' }).expect(404);
    await aguardar();
    expect(mensagens).toEqual([]);
    await container.encerrar();
  });

  it('o erro de um assinante não afeta os demais nem quem publicou', async () => {
    const erros = [];
    const barramento = new BarramentoDeEventos({ logger: { info: () => {}, erro: (m) => erros.push(m) } });
    const recebidos = [];
    barramento.assinar('evento', () => { throw new Error('assinante quebrado'); });
    barramento.assinar('evento', (carga) => recebidos.push(carga));

    expect(() => barramento.publicar('evento', 42)).not.toThrow();
    await aguardar();

    expect(recebidos).toEqual([42]);
    expect(erros[0]).toContain('assinante quebrado');
  });
});
