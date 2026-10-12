const fs = require('fs');
const path = require('path');

/**
 * TESTES DE ARQUITETURA.
 *
 * Em vez de confiar na disciplina da equipe, as regras da arquitetura são
 * verificadas mecanicamente: o teste lê os `require()` de cada arquivo de `src/`
 * e falha se uma camada importar algo que não deveria — ou se surgir um ciclo.
 */
const SRC = path.join(__dirname, '..', 'src');

// Para cada camada: quais OUTRAS camadas internas ela pode importar e quais
// pacotes externos pode usar. (Importar da própria camada é sempre permitido.)
const REGRAS = {
  routes: { internas: ['middlewares', 'dtos'], externas: ['express'] },
  controllers: { internas: ['dtos'], externas: [] },
  services: { internas: ['models', 'errors', 'events'], externas: [] },
  models: { internas: ['errors'], externas: [] },
  errors: { internas: [], externas: [] },
  dtos: { internas: [], externas: ['zod'] },
  events: { internas: [], externas: [] },
  middlewares: { internas: ['errors'], externas: ['zod'] },
  repositories: { internas: ['models', 'errors', 'repositories/sequelize', 'repositories/memory'], externas: [] },
  'repositories/sequelize': { internas: ['models', 'errors', 'repositories'], externas: ['sequelize', 'dotenv', 'path'] },
  'repositories/memory': { internas: ['models', 'errors', 'repositories'], externas: [] },
  config: { internas: ['*'], externas: ['dotenv'] },
  app: { internas: ['routes', 'middlewares'], externas: ['express', 'swagger-ui-express', 'yamljs', 'path'] },
  server: { internas: ['config', 'app'], externas: [] }
};

function listarArquivos(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const completo = path.join(dir, e.name);
    return e.isDirectory() ? listarArquivos(completo) : e.name.endsWith('.js') ? [completo] : [];
  });
}

function camadaDe(arquivo) {
  const relativo = path.relative(SRC, arquivo).split(path.sep).join('/');
  if (relativo === 'app.js') return 'app';
  if (relativo === 'server.js') return 'server';
  if (relativo.startsWith('repositories/sequelize/')) return 'repositories/sequelize';
  if (relativo.startsWith('repositories/memory/')) return 'repositories/memory';
  return relativo.split('/')[0];
}

function importsDe(arquivo) {
  const codigo = fs.readFileSync(arquivo, 'utf8');
  return [...codigo.matchAll(/require\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => m[1]);
}

function resolverInterno(arquivo, especificador) {
  const base = path.resolve(path.dirname(arquivo), especificador);
  return [base, `${base}.js`, path.join(base, 'index.js')].find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
}

const arquivos = listarArquivos(SRC);

describe('Arquitetura em camadas — regras de dependência', () => {
  const violacoes = [];
  for (const arquivo of arquivos) {
    const camada = camadaDe(arquivo);
    const regra = REGRAS[camada];
    const nome = path.relative(SRC, arquivo).split(path.sep).join('/');
    if (!regra) {
      violacoes.push(`${nome}: camada "${camada}" não está prevista nas regras`);
      continue;
    }
    for (const especificador of importsDe(arquivo)) {
      if (especificador.startsWith('.')) {
        const destino = resolverInterno(arquivo, especificador);
        const camadaDestino = camadaDe(destino);
        const permitido = camadaDestino === camada || regra.internas.includes('*') || regra.internas.includes(camadaDestino);
        if (!permitido) violacoes.push(`${nome} (${camada}) importa ${path.relative(SRC, destino)} (${camadaDestino})`);
      } else if (!especificador.startsWith('node:') && !regra.externas.includes(especificador)) {
        violacoes.push(`${nome} (${camada}) usa o pacote externo "${especificador}", não permitido nesta camada`);
      }
    }
  }

  it('nenhuma camada importa o que não deve (sem pular níveis, sem vazamento)', () => {
    expect(violacoes).toEqual([]);
  });

  it('todo arquivo de src/ pertence a uma camada conhecida', () => {
    expect(arquivos.filter((a) => !REGRAS[camadaDe(a)])).toEqual([]);
  });

  it('o ORM (sequelize) só é importado dentro de src/repositories/sequelize', () => {
    const infratores = arquivos.filter((a) => camadaDe(a) !== 'repositories/sequelize' && importsDe(a).includes('sequelize'));
    expect(infratores.map((a) => path.relative(SRC, a))).toEqual([]);
  });

  it('a camada de serviço não conhece req, res nem Express', () => {
    const servicos = arquivos.filter((a) => camadaDe(a) === 'services');
    expect(servicos.length).toBeGreaterThan(0);
    for (const arquivo of servicos) {
      const codigo = fs.readFileSync(arquivo, 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
      expect(codigo).not.toMatch(/\b(req|res)\b/);
      expect(codigo).not.toMatch(/express/i);
    }
  });

  it('serviços e controladores não instanciam colaboradores (new Repository/Service)', () => {
    const alvo = arquivos.filter((a) => ['services', 'controllers'].includes(camadaDe(a)));
    for (const arquivo of alvo) {
      const codigo = fs.readFileSync(arquivo, 'utf8');
      expect(codigo).not.toMatch(/new\s+\w*(Repository|UnitOfWork|Service|Controller)\s*\(/);
    }
  });
});

describe('Dependências circulares', () => {
  it('não existe nenhum ciclo de require entre os arquivos de src/', () => {
    const grafo = new Map(arquivos.map((a) => [a, importsDe(a).filter((i) => i.startsWith('.')).map((i) => resolverInterno(a, i))]));
    const ciclos = [];
    const estado = new Map(); // 1 = visitando, 2 = concluído

    function visitar(no, trilha) {
      estado.set(no, 1);
      for (const vizinho of grafo.get(no) ?? []) {
        if (estado.get(vizinho) === 1) ciclos.push([...trilha, no, vizinho].map((x) => path.relative(SRC, x)).join(' -> '));
        else if (!estado.has(vizinho)) visitar(vizinho, [...trilha, no]);
      }
      estado.set(no, 2);
    }
    for (const no of grafo.keys()) if (!estado.has(no)) visitar(no, []);

    expect(ciclos).toEqual([]);
  });
});
