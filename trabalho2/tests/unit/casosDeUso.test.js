const criarPersistencia = require('../../src/repositories/criarPersistencia');
const BarramentoDeEventos = require('../../src/events/BarramentoDeEventos');
const { EVENTOS } = require('../../src/events/eventos');
const RegistrarEmprestimoService = require('../../src/services/RegistrarEmprestimoService');
const AtualizarEmprestimoService = require('../../src/services/AtualizarEmprestimoService');
const RemoverEmprestimoService = require('../../src/services/RemoverEmprestimoService');
const LivroService = require('../../src/services/LivroService');
const LivroRepository = require('../../src/repositories/LivroRepository');
const Livro = require('../../src/models/Livro');
const InMemoryLivroRepository = require('../../src/repositories/memory/InMemoryLivroRepository');
const {
  LivroIndisponivelError,
  LivroNaoEncontradoError,
  EstudanteNaoEncontradoError,
  EmprestimoNaoEncontradoError,
  LivroEmUsoError
} = require('../../src/errors/erros');

const silencioso = { info: () => {}, erro: () => {} };
const pedido = (livroId, estudanteId) => ({ livroId, estudanteId, dataEmprestimo: '2026-09-05', dataDevolucaoPrevista: '2026-09-19' });
const aguardarAssinantes = () => new Promise((resolve) => setImmediate(resolve));

// Os serviços são montados "à mão" com persistência em memória: nenhum banco, nenhum HTTP.
function montar() {
  const persistencia = criarPersistencia({ driver: 'memory' });
  const eventos = new BarramentoDeEventos({ logger: silencioso });
  const publicados = [];
  Object.values(EVENTOS).forEach((nome) => eventos.assinar(nome, (carga) => publicados.push({ nome, carga })));
  const relogio = { hoje: () => '2030-01-01' };
  const { livroRepository, estudanteRepository, emprestimoRepository, unitOfWork } = persistencia;
  return {
    livroRepository,
    estudanteRepository,
    emprestimoRepository,
    publicados,
    registrar: new RegistrarEmprestimoService({ unitOfWork, eventos }),
    atualizar: new AtualizarEmprestimoService({ unitOfWork, eventos, relogio }),
    remover: new RemoverEmprestimoService({ unitOfWork }),
    livroService: new LivroService({ livroRepository, emprestimoRepository })
  };
}

describe('RegistrarEmprestimoService', () => {
  it('cria o empréstimo, baixa o estoque e publica o evento depois do commit', async () => {
    const ctx = montar();
    const antes = (await ctx.livroRepository.buscarPorId(2)).quantidadeDisponivel;

    const emprestimo = await ctx.registrar.executar(pedido(2, 3));
    await aguardarAssinantes();

    expect(emprestimo.status).toBe('ativo');
    expect((await ctx.livroRepository.buscarPorId(2)).quantidadeDisponivel).toBe(antes - 1);
    expect(ctx.publicados.map((p) => p.nome)).toEqual([EVENTOS.EMPRESTIMO_REGISTRADO]);
  });

  it('sem estoque: lança erro de domínio, não grava nada e não publica evento', async () => {
    const ctx = montar();
    await ctx.registrar.executar(pedido(4, 6));
    await ctx.registrar.executar(pedido(4, 7)); // esgota os 2 exemplares do livro 4
    const total = (await ctx.emprestimoRepository.listar({ filtros: { livroId: 4 } })).total;
    ctx.publicados.length = 0;

    await expect(ctx.registrar.executar(pedido(4, 8))).rejects.toBeInstanceOf(LivroIndisponivelError);
    await aguardarAssinantes();

    expect((await ctx.emprestimoRepository.listar({ filtros: { livroId: 4 } })).total).toBe(total);
    expect(ctx.publicados).toEqual([]);
  });

  it('livro ou estudante inexistente: erro de domínio específico', async () => {
    const ctx = montar();
    await expect(ctx.registrar.executar(pedido(999, 1))).rejects.toBeInstanceOf(LivroNaoEncontradoError);
    await expect(ctx.registrar.executar(pedido(1, 999))).rejects.toBeInstanceOf(EstudanteNaoEncontradoError);
  });

  it('ROLLBACK: se uma etapa falha depois de criar o empréstimo, o banco volta ao estado anterior', async () => {
    const ctx = montar();
    const total = (await ctx.emprestimoRepository.listar()).total;
    const estoque = (await ctx.livroRepository.buscarPorId(2)).quantidadeDisponivel;

    const espiao = jest.spyOn(InMemoryLivroRepository.prototype, 'atualizar').mockRejectedValueOnce(new Error('falha simulada'));
    await expect(ctx.registrar.executar(pedido(2, 3))).rejects.toThrow('falha simulada');
    espiao.mockRestore();

    expect((await ctx.emprestimoRepository.listar()).total).toBe(total); // empréstimo desfeito
    expect((await ctx.livroRepository.buscarPorId(2)).quantidadeDisponivel).toBe(estoque);
  });
});

describe('AtualizarEmprestimoService (devolução)', () => {
  it('devolver repõe o estoque, usa a data do relógio injetado e publica o evento', async () => {
    const ctx = montar();
    const criado = await ctx.registrar.executar(pedido(9, 10));
    const estoque = (await ctx.livroRepository.buscarPorId(9)).quantidadeDisponivel;
    ctx.publicados.length = 0;

    const devolvido = await ctx.atualizar.executar(criado.id, { status: 'devolvido' });
    await aguardarAssinantes();

    expect(devolvido.dataDevolucaoReal).toBe('2030-01-01');
    expect((await ctx.livroRepository.buscarPorId(9)).quantidadeDisponivel).toBe(estoque + 1);
    expect(ctx.publicados.map((p) => p.nome)).toEqual([EVENTOS.LIVRO_DEVOLVIDO]);
  });

  it('devolver duas vezes não repõe o estoque duas vezes', async () => {
    const ctx = montar();
    const criado = await ctx.registrar.executar(pedido(9, 10));
    await ctx.atualizar.executar(criado.id, { status: 'devolvido' });
    const estoque = (await ctx.livroRepository.buscarPorId(9)).quantidadeDisponivel;
    await ctx.atualizar.executar(criado.id, { status: 'devolvido' });
    expect((await ctx.livroRepository.buscarPorId(9)).quantidadeDisponivel).toBe(estoque);
  });

  it('empréstimo inexistente', async () => {
    await expect(montar().atualizar.executar(9999, { status: 'devolvido' })).rejects.toBeInstanceOf(EmprestimoNaoEncontradoError);
  });
});

describe('RemoverEmprestimoService', () => {
  it('remover um empréstimo ativo repõe o exemplar', async () => {
    const ctx = montar();
    const criado = await ctx.registrar.executar(pedido(11, 12));
    const estoque = (await ctx.livroRepository.buscarPorId(11)).quantidadeDisponivel;
    await ctx.remover.executar(criado.id);
    expect((await ctx.livroRepository.buscarPorId(11)).quantidadeDisponivel).toBe(estoque + 1);
    expect(await ctx.emprestimoRepository.buscarPorId(criado.id)).toBeNull();
  });
});

describe('Injeção de dependência — o serviço só conhece o CONTRATO do repositório', () => {
  it('LivroService funciona com um repositório escrito à mão (um "fake"), sem banco nenhum', async () => {
    class LivroRepositoryFake extends LivroRepository {
      constructor() {
        super();
        this.livros = [new Livro({ id: 1, titulo: 'Fake', autor: 'A', isbn: '1234567890', anoPublicacao: 2000, quantidadeTotal: 1, quantidadeDisponivel: 1, generos: [] })];
      }
      async buscarPorId(id) {
        return this.livros.find((l) => l.id === id) ?? null;
      }
      async remover(id) {
        this.livros = this.livros.filter((l) => l.id !== id);
        return true;
      }
    }
    const repositorioFake = new LivroRepositoryFake();
    const servico = new LivroService({ livroRepository: repositorioFake, emprestimoRepository: { existeAtivoDoLivro: async () => false } });

    expect((await servico.obter(1)).titulo).toBe('Fake');
    await servico.remover(1);
    await expect(servico.obter(1)).rejects.toBeInstanceOf(LivroNaoEncontradoError);
  });

  it('a regra "livro com empréstimo ativo não pode ser removido" vale com qualquer repositório', async () => {
    const ctx = montar();
    await expect(ctx.livroService.remover(1)).rejects.toBeInstanceOf(LivroEmUsoError);
  });

  it('o contrato falha de forma explícita quando um método não foi implementado', async () => {
    expect(() => new LivroRepository().listar()).toThrow('não foi implementado');
  });

  it('a Factory recusa um driver desconhecido', () => {
    expect(() => criarPersistencia({ driver: 'mongo' })).toThrow('REPOSITORY_DRIVER inválido');
  });
});
