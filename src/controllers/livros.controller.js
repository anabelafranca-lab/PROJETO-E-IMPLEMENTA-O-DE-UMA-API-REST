const db = require('../data/db-memoria');
const { ApiError } = require('../middlewares/erro.middleware');

function paginar(lista, page, limit) {
  const totalItens = lista.length;
  const totalPaginas = Math.max(Math.ceil(totalItens / limit), 1);
  const paginaAtual = Math.min(Math.max(page, 1), totalPaginas);
  const inicio = (paginaAtual - 1) * limit;
  const itens = lista.slice(inicio, inicio + limit);
  return {
    itens,
    paginacao: { total: totalItens, paginaAtual, totalPaginas, limit }
  };
}

// GET /livros
// Suporta: filtro por gênero, busca por título/autor, filtro por ano,
// paginação (page/limit) e ordenação combinada (sort=campo,-outroCampo).
function listar(req, res) {
  let resultado = [...db.livros];
  const { genero, titulo, autor, anoPublicacao, ano_min: anoMin, ano_max: anoMax, sort } = req.query;

  if (genero) {
    resultado = resultado.filter((l) => l.genero.toLowerCase() === String(genero).toLowerCase());
  }
  if (titulo) {
    const termo = String(titulo).toLowerCase();
    resultado = resultado.filter((l) => l.titulo.toLowerCase().includes(termo));
  }
  if (autor) {
    const termo = String(autor).toLowerCase();
    resultado = resultado.filter((l) => l.autor.toLowerCase().includes(termo));
  }
  if (anoPublicacao) {
    resultado = resultado.filter((l) => l.anoPublicacao === Number(anoPublicacao));
  }
  if (anoMin) {
    resultado = resultado.filter((l) => l.anoPublicacao >= Number(anoMin));
  }
  if (anoMax) {
    resultado = resultado.filter((l) => l.anoPublicacao <= Number(anoMax));
  }

  if (sort) {
    const campos = String(sort).split(',');
    resultado.sort((a, b) => {
      for (const campo of campos) {
        const direcao = campo.startsWith('-') ? -1 : 1;
        const nomeCampo = campo.startsWith('-') ? campo.slice(1) : campo;
        if (a[nomeCampo] < b[nomeCampo]) return -1 * direcao;
        if (a[nomeCampo] > b[nomeCampo]) return 1 * direcao;
      }
      return 0;
    });
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { itens, paginacao } = paginar(resultado, page, limit);

  res.status(200).json({ dados: itens, paginacao });
}

function buscarPorId(req, res) {
  const id = Number(req.params.id);
  const livro = db.livros.find((l) => l.id === id);
  if (!livro) {
    throw new ApiError(404, 'LIVRO_NAO_ENCONTRADO', `Livro com id ${id} não encontrado`);
  }
  res.status(200).json(livro);
}

function criar(req, res) {
  const dados = req.body;

  const isbnDuplicado = db.livros.some((l) => l.isbn === dados.isbn);
  if (isbnDuplicado) {
    throw new ApiError(409, 'ISBN_DUPLICADO', `Já existe um livro cadastrado com o ISBN ${dados.isbn}`);
  }

  const novoLivro = {
    id: db.gerarIdLivro(),
    titulo: dados.titulo,
    autor: dados.autor,
    genero: dados.genero,
    isbn: dados.isbn,
    anoPublicacao: dados.anoPublicacao,
    quantidadeTotal: dados.quantidadeTotal,
    quantidadeDisponivel: dados.quantidadeDisponivel ?? dados.quantidadeTotal
  };

  db.livros.push(novoLivro);
  res.status(201).json(novoLivro);
}

function substituir(req, res) {
  const id = Number(req.params.id);
  const indice = db.livros.findIndex((l) => l.id === id);
  if (indice === -1) {
    throw new ApiError(404, 'LIVRO_NAO_ENCONTRADO', `Livro com id ${id} não encontrado`);
  }

  const dados = req.body;
  const isbnDuplicado = db.livros.some((l) => l.isbn === dados.isbn && l.id !== id);
  if (isbnDuplicado) {
    throw new ApiError(409, 'ISBN_DUPLICADO', `Já existe um livro cadastrado com o ISBN ${dados.isbn}`);
  }

  const livroAtualizado = { id, ...dados };
  db.livros[indice] = livroAtualizado;
  res.status(200).json(livroAtualizado);
}

function atualizarParcial(req, res) {
  const id = Number(req.params.id);
  const indice = db.livros.findIndex((l) => l.id === id);
  if (indice === -1) {
    throw new ApiError(404, 'LIVRO_NAO_ENCONTRADO', `Livro com id ${id} não encontrado`);
  }

  const dados = req.body;
  if (dados.isbn) {
    const isbnDuplicado = db.livros.some((l) => l.isbn === dados.isbn && l.id !== id);
    if (isbnDuplicado) {
      throw new ApiError(409, 'ISBN_DUPLICADO', `Já existe um livro cadastrado com o ISBN ${dados.isbn}`);
    }
  }

  db.livros[indice] = { ...db.livros[indice], ...dados };
  res.status(200).json(db.livros[indice]);
}

function remover(req, res) {
  const id = Number(req.params.id);
  const indice = db.livros.findIndex((l) => l.id === id);
  if (indice === -1) {
    throw new ApiError(404, 'LIVRO_NAO_ENCONTRADO', `Livro com id ${id} não encontrado`);
  }

  const emUso = db.emprestimos.some((e) => e.livroId === id && e.status === 'ativo');
  if (emUso) {
    throw new ApiError(409, 'LIVRO_EM_USO', `Livro com id ${id} possui empréstimos ativos e não pode ser removido`);
  }

  db.livros.splice(indice, 1);
  res.status(204).send();
}

module.exports = { listar, buscarPorId, criar, substituir, atualizarParcial, remover };
