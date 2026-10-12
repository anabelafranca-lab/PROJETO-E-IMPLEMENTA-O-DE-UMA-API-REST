const Emprestimo = require('../../src/models/Emprestimo');

const novo = () =>
  Emprestimo.registrar({ livroId: 1, estudanteId: 2, dataEmprestimo: '2026-09-01', dataDevolucaoPrevista: '2026-09-15' });

describe('Entidade Emprestimo (regras de domínio)', () => {
  it('nasce ativo e sem devolução real', () => {
    const e = novo();
    expect(e.status).toBe('ativo');
    expect(e.dataDevolucaoReal).toBeNull();
    expect(e.estaAtivo()).toBe(true);
  });

  it('a transição para "devolvido" é reconhecida como devolução e assume a data de hoje', () => {
    const e = novo();
    expect(e.atualizar({ status: 'devolvido' }, '2030-01-01')).toBe(true);
    expect(e.dataDevolucaoReal).toBe('2030-01-01');
  });

  it('respeita a data de devolução informada', () => {
    const e = novo();
    e.atualizar({ status: 'devolvido', dataDevolucaoReal: '2026-09-10' }, '2030-01-01');
    expect(e.dataDevolucaoReal).toBe('2026-09-10');
  });

  it('devolver duas vezes não conta como uma nova devolução', () => {
    const e = novo();
    e.atualizar({ status: 'devolvido' }, '2030-01-01');
    expect(e.atualizar({ status: 'devolvido' }, '2031-01-01')).toBe(false);
    expect(e.dataDevolucaoReal).toBe('2030-01-01');
  });

  it('mudar para "atrasado" não é devolução', () => {
    expect(novo().atualizar({ status: 'atrasado' }, '2030-01-01')).toBe(false);
  });
});
