'use strict';

// Tradução dos parâmetros HTTP (query string / path) para valores simples.
// É trabalho de BORDA: o serviço nunca vê `req.query`.

const lerId = (params) => Number(params.id);

const lerPaginacao = (query) => ({
  pagina: Number(query.page) || 1,
  limite: Number(query.limit) || 10
});

const lerOrdenacao = (query) => ({ ordenar: query.ordenar, direcao: query.direcao });

const montarPaginacao = (total, pagina, limite) => ({
  total,
  paginaAtual: pagina,
  totalPaginas: Math.max(Math.ceil(total / limite), 1),
  limit: limite
});

module.exports = { lerId, lerPaginacao, lerOrdenacao, montarPaginacao };
