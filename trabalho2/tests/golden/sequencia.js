'use strict';

/**
 * Sequência de caracterização do comportamento externo da API.
 *
 * Ela foi executada contra a implementação do Trabalho 2 (antes da
 * refatoração) e o resultado — status HTTP + corpo normalizado de cada
 * resposta — foi gravado em `comportamento-trabalho2.json` (o "golden
 * master"). O teste `preservacao.test.js` reexecuta exatamente esta mesma
 * sequência contra a arquitetura nova e exige resposta idêntica, passo a
 * passo. É isso que torna a refatoração "segura": o contrato externo é
 * comparado mecanicamente, não "no olho".
 *
 * Atenção: a sequência é dependente de estado (ex.: o 1º livro criado
 * recebe id 13). Por isso ela sempre parte de um banco recém-semeado.
 */

const livroValido = {
  titulo: 'O Guia do Mochileiro das Galáxias',
  autor: 'Douglas Adams',
  isbn: '978-00-000-9999-9',
  anoPublicacao: 1979,
  quantidadeTotal: 3,
  generos: ['Ficcao', 'Novo-Genero']
};

const estudanteValido = {
  nome: 'Marcos Vinícius Teixeira',
  email: 'marcos.teixeira@escola.edu.br',
  matricula: '2024099',
  turma: '1B'
};

const novoEmprestimo = (livroId, estudanteId) => ({
  livroId,
  estudanteId,
  dataEmprestimo: '2026-09-05',
  dataDevolucaoPrevista: '2026-09-19'
});

const sequencia = [
  // ----- raiz / rota inexistente -----
  { nome: 'raiz', metodo: 'GET', caminho: '/' },
  { nome: 'rota inexistente', metodo: 'GET', caminho: '/api/v1/nao-existe' },

  // ----- livros: leitura -----
  { nome: 'livros: listar', metodo: 'GET', caminho: '/api/v1/livros' },
  { nome: 'livros: página 2 limite 5', metodo: 'GET', caminho: '/api/v1/livros?page=2&limit=5' },
  { nome: 'livros: page=0 e limit inválido', metodo: 'GET', caminho: '/api/v1/livros?page=0&limit=abc' },
  { nome: 'livros: filtro gênero', metodo: 'GET', caminho: '/api/v1/livros?genero=fantasia' },
  { nome: 'livros: gênero inexistente', metodo: 'GET', caminho: '/api/v1/livros?genero=inexistente' },
  { nome: 'livros: busca por título', metodo: 'GET', caminho: '/api/v1/livros?titulo=dom' },
  { nome: 'livros: autor + ordenação desc', metodo: 'GET', caminho: '/api/v1/livros?autor=machado&ordenar=anoPublicacao&direcao=desc' },
  { nome: 'livros: faixa de anos + ordenar título', metodo: 'GET', caminho: '/api/v1/livros?ano_min=1950&ano_max=2000&ordenar=titulo' },
  { nome: 'livros: ano exato', metodo: 'GET', caminho: '/api/v1/livros?anoPublicacao=2011' },
  { nome: 'livros: ordenar por campo inválido', metodo: 'GET', caminho: '/api/v1/livros?ordenar=hack&direcao=DESC' },
  { nome: 'livros: buscar por id', metodo: 'GET', caminho: '/api/v1/livros/1' },
  { nome: 'livros: id inexistente', metodo: 'GET', caminho: '/api/v1/livros/9999' },

  // ----- livros: escrita -----
  { nome: 'livros: criar', metodo: 'POST', caminho: '/api/v1/livros', corpo: livroValido },
  { nome: 'livros: criar sem campos', metodo: 'POST', caminho: '/api/v1/livros', corpo: { titulo: 'Incompleto' } },
  { nome: 'livros: criar ISBN duplicado', metodo: 'POST', caminho: '/api/v1/livros', corpo: { ...livroValido, isbn: '978-85-254-1111-6' } },
  { nome: 'livros: criar ano como texto', metodo: 'POST', caminho: '/api/v1/livros', corpo: { ...livroValido, isbn: '978-00-000-1111-1', anoPublicacao: 'abc' } },
  { nome: 'livros: criar sem gêneros', metodo: 'POST', caminho: '/api/v1/livros', corpo: { ...livroValido, isbn: '978-00-000-2222-2', generos: [] } },
  { nome: 'livros: JSON malformado', metodo: 'POST', caminho: '/api/v1/livros', bruto: '{"titulo":' },
  { nome: 'livros: PUT', metodo: 'PUT', caminho: '/api/v1/livros/13', corpo: { ...livroValido, titulo: 'Guia (2ª edição)', quantidadeTotal: 5, quantidadeDisponivel: 4, generos: ['ficcao'] } },
  { nome: 'livros: PUT inexistente', metodo: 'PUT', caminho: '/api/v1/livros/9999', corpo: livroValido },
  { nome: 'livros: PUT ISBN duplicado', metodo: 'PUT', caminho: '/api/v1/livros/13', corpo: { ...livroValido, isbn: '978-85-254-1109-3' } },
  { nome: 'livros: PATCH quantidade', metodo: 'PATCH', caminho: '/api/v1/livros/13', corpo: { quantidadeTotal: 10 } },
  { nome: 'livros: PATCH gêneros', metodo: 'PATCH', caminho: '/api/v1/livros/13', corpo: { generos: ['poesia'] } },
  { nome: 'livros: PATCH corpo vazio', metodo: 'PATCH', caminho: '/api/v1/livros/13', corpo: {} },
  { nome: 'livros: PATCH inexistente', metodo: 'PATCH', caminho: '/api/v1/livros/9999', corpo: { titulo: 'X' } },
  { nome: 'livros: DELETE com empréstimo ativo', metodo: 'DELETE', caminho: '/api/v1/livros/1' },
  { nome: 'livros: DELETE (soft delete)', metodo: 'DELETE', caminho: '/api/v1/livros/13' },
  { nome: 'livros: GET após soft delete', metodo: 'GET', caminho: '/api/v1/livros/13' },
  { nome: 'livros: DELETE inexistente', metodo: 'DELETE', caminho: '/api/v1/livros/9999' },
  { nome: 'livros: listagem completa após mudanças', metodo: 'GET', caminho: '/api/v1/livros?limit=100' },

  // ----- estudantes -----
  { nome: 'estudantes: listar', metodo: 'GET', caminho: '/api/v1/estudantes' },
  { nome: 'estudantes: turma + ordenar nome desc', metodo: 'GET', caminho: '/api/v1/estudantes?turma=3A&ordenar=nome&direcao=desc' },
  { nome: 'estudantes: busca por nome', metodo: 'GET', caminho: '/api/v1/estudantes?nome=an' },
  { nome: 'estudantes: buscar por id', metodo: 'GET', caminho: '/api/v1/estudantes/1' },
  { nome: 'estudantes: id inexistente', metodo: 'GET', caminho: '/api/v1/estudantes/9999' },
  { nome: 'estudantes: empréstimos do estudante', metodo: 'GET', caminho: '/api/v1/estudantes/1/emprestimos' },
  { nome: 'estudantes: empréstimos filtrados por status', metodo: 'GET', caminho: '/api/v1/estudantes/1/emprestimos?status=ativo' },
  { nome: 'estudantes: empréstimos de inexistente', metodo: 'GET', caminho: '/api/v1/estudantes/9999/emprestimos' },
  { nome: 'estudantes: criar', metodo: 'POST', caminho: '/api/v1/estudantes', corpo: estudanteValido },
  { nome: 'estudantes: e-mail inválido', metodo: 'POST', caminho: '/api/v1/estudantes', corpo: { ...estudanteValido, email: 'nao-e-email' } },
  { nome: 'estudantes: matrícula duplicada', metodo: 'POST', caminho: '/api/v1/estudantes', corpo: { ...estudanteValido, email: 'outro@escola.edu.br', matricula: '2024001' } },
  { nome: 'estudantes: e-mail duplicado', metodo: 'POST', caminho: '/api/v1/estudantes', corpo: { ...estudanteValido, matricula: '2024555', email: 'ana.souza@escola.edu.br' } },
  { nome: 'estudantes: PUT', metodo: 'PUT', caminho: '/api/v1/estudantes/13', corpo: { ...estudanteValido, nome: 'Marcos V. Teixeira' } },
  { nome: 'estudantes: PUT matrícula duplicada', metodo: 'PUT', caminho: '/api/v1/estudantes/13', corpo: { ...estudanteValido, matricula: '2024001' } },
  { nome: 'estudantes: PUT inexistente', metodo: 'PUT', caminho: '/api/v1/estudantes/9999', corpo: estudanteValido },
  { nome: 'estudantes: PATCH', metodo: 'PATCH', caminho: '/api/v1/estudantes/13', corpo: { turma: '2C' } },
  { nome: 'estudantes: PATCH inexistente', metodo: 'PATCH', caminho: '/api/v1/estudantes/9999', corpo: { turma: '2C' } },
  { nome: 'estudantes: DELETE com empréstimo ativo', metodo: 'DELETE', caminho: '/api/v1/estudantes/1' },
  { nome: 'estudantes: DELETE (soft delete)', metodo: 'DELETE', caminho: '/api/v1/estudantes/13' },
  { nome: 'estudantes: GET após soft delete', metodo: 'GET', caminho: '/api/v1/estudantes/13' },
  { nome: 'estudantes: DELETE inexistente', metodo: 'DELETE', caminho: '/api/v1/estudantes/9999' },

  // ----- empréstimos + transações -----
  { nome: 'empréstimos: listar', metodo: 'GET', caminho: '/api/v1/emprestimos' },
  { nome: 'empréstimos: filtro status', metodo: 'GET', caminho: '/api/v1/emprestimos?status=ativo' },
  { nome: 'empréstimos: filtro livro + ordenação', metodo: 'GET', caminho: '/api/v1/emprestimos?livroId=3&ordenar=dataEmprestimo&direcao=desc' },
  { nome: 'empréstimos: filtro estudante', metodo: 'GET', caminho: '/api/v1/emprestimos?estudanteId=1' },
  { nome: 'empréstimos: buscar por id', metodo: 'GET', caminho: '/api/v1/emprestimos/1' },
  { nome: 'empréstimos: id inexistente', metodo: 'GET', caminho: '/api/v1/emprestimos/9999' },
  { nome: 'estoque antes (livro 2)', metodo: 'GET', caminho: '/api/v1/livros/2' },
  { nome: 'empréstimos: registrar', metodo: 'POST', caminho: '/api/v1/emprestimos', corpo: novoEmprestimo(2, 3) },
  { nome: 'estoque depois (livro 2)', metodo: 'GET', caminho: '/api/v1/livros/2' },
  { nome: 'empréstimos: livro inexistente', metodo: 'POST', caminho: '/api/v1/emprestimos', corpo: novoEmprestimo(99999, 1) },
  { nome: 'empréstimos: estudante inexistente', metodo: 'POST', caminho: '/api/v1/emprestimos', corpo: novoEmprestimo(1, 99999) },
  { nome: 'empréstimos: sem campos', metodo: 'POST', caminho: '/api/v1/emprestimos', corpo: { livroId: 1 } },
  { nome: 'empréstimos: data inválida', metodo: 'POST', caminho: '/api/v1/emprestimos', corpo: { ...novoEmprestimo(1, 1), dataEmprestimo: '05/09/2026' } },
  { nome: 'empréstimos: livro 4 (1º exemplar)', metodo: 'POST', caminho: '/api/v1/emprestimos', corpo: novoEmprestimo(4, 6) },
  { nome: 'empréstimos: livro 4 (2º exemplar)', metodo: 'POST', caminho: '/api/v1/emprestimos', corpo: novoEmprestimo(4, 7) },
  { nome: 'empréstimos: livro 4 sem estoque', metodo: 'POST', caminho: '/api/v1/emprestimos', corpo: novoEmprestimo(4, 8) },
  { nome: 'empréstimos: histórico do livro 4 (sem fantasma)', metodo: 'GET', caminho: '/api/v1/emprestimos?livroId=4' },
  { nome: 'empréstimos: devolver com data', metodo: 'PATCH', caminho: '/api/v1/emprestimos/15', corpo: { status: 'devolvido', dataDevolucaoReal: '2026-09-10' } },
  { nome: 'estoque após devolução (livro 2)', metodo: 'GET', caminho: '/api/v1/livros/2' },
  { nome: 'empréstimos: devolver sem data (usa hoje)', metodo: 'PATCH', caminho: '/api/v1/emprestimos/16', corpo: { status: 'devolvido' } },
  { nome: 'empréstimos: devolver de novo (idempotente)', metodo: 'PATCH', caminho: '/api/v1/emprestimos/16', corpo: { status: 'devolvido' } },
  { nome: 'estoque após 2 devoluções (livro 4)', metodo: 'GET', caminho: '/api/v1/livros/4' },
  { nome: 'empréstimos: PATCH inexistente', metodo: 'PATCH', caminho: '/api/v1/emprestimos/9999', corpo: { status: 'devolvido' } },
  { nome: 'empréstimos: PATCH atrasado', metodo: 'PATCH', caminho: '/api/v1/emprestimos/17', corpo: { status: 'atrasado' } },
  { nome: 'empréstimos: PATCH status inválido', metodo: 'PATCH', caminho: '/api/v1/emprestimos/17', corpo: { status: 'perdido' } },
  { nome: 'empréstimos: PUT', metodo: 'PUT', caminho: '/api/v1/emprestimos/17', corpo: novoEmprestimo(4, 8) },
  { nome: 'empréstimos: PUT inexistente', metodo: 'PUT', caminho: '/api/v1/emprestimos/9999', corpo: novoEmprestimo(4, 8) },
  { nome: 'empréstimos: DELETE não ativo', metodo: 'DELETE', caminho: '/api/v1/emprestimos/17' },
  { nome: 'empréstimos: criar para teste de remoção', metodo: 'POST', caminho: '/api/v1/emprestimos', corpo: novoEmprestimo(11, 12) },
  { nome: 'estoque antes de remover (livro 11)', metodo: 'GET', caminho: '/api/v1/livros/11' },
  { nome: 'empréstimos: DELETE ativo repõe estoque', metodo: 'DELETE', caminho: '/api/v1/emprestimos/18' },
  { nome: 'estoque após remoção (livro 11)', metodo: 'GET', caminho: '/api/v1/livros/11' },
  { nome: 'empréstimos: DELETE inexistente', metodo: 'DELETE', caminho: '/api/v1/emprestimos/9999' },
  { nome: 'empréstimos: listagem final', metodo: 'GET', caminho: '/api/v1/emprestimos?limit=100' },
  { nome: 'livros: estado final (estoques)', metodo: 'GET', caminho: '/api/v1/livros?limit=100&ordenar=titulo' }
];

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

// Remove o que muda a cada execução (timestamps e "data de hoje") para que a
// comparação seja determinística.
function normalizar(valor, hoje) {
  if (Array.isArray(valor)) return valor.map((v) => normalizar(v, hoje));
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, normalizar(v, hoje)]));
  }
  if (typeof valor === 'string') {
    if (ISO.test(valor)) return '<timestamp>';
    if (valor === hoje) return '<hoje>';
  }
  return valor;
}

// Executa a sequência com supertest e devolve [{ nome, status, corpo }].
async function executar(request, app) {
  const hoje = new Date().toISOString().slice(0, 10);
  const resultados = [];
  for (const passo of sequencia) {
    let req = request(app)[passo.metodo.toLowerCase()](passo.caminho);
    if (passo.bruto !== undefined) {
      req = req.set('Content-Type', 'application/json').send(passo.bruto);
    } else if (passo.corpo !== undefined) {
      req = req.send(passo.corpo);
    }
    const res = await req;
    resultados.push({
      nome: passo.nome,
      status: res.status,
      corpo: res.text ? normalizar(JSON.parse(res.text), hoje) : null
    });
  }
  return resultados;
}

module.exports = { sequencia, executar };
