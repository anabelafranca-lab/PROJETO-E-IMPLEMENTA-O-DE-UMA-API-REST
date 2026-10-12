'use strict';

// Funções auxiliares para imitar, em memória, o que o SGBD faz em SQL.

const contem = (texto, trecho) => String(texto).toLowerCase().includes(String(trecho).toLowerCase()); // = LIKE '%x%'

// ORDER BY <campo> ASC|DESC, estável (empates mantêm a ordem de inserção/id).
function ordenar(itens, { camposPermitidos, ordenar: campoPedido, direcao }) {
  const campo = camposPermitidos.includes(campoPedido) ? campoPedido : 'id';
  const fator = String(direcao || '').toLowerCase() === 'desc' ? -1 : 1;
  const valor = (item) => (item[campo] instanceof Date ? item[campo].getTime() : item[campo]);
  return [...itens].sort((a, b) => {
    const va = valor(a);
    const vb = valor(b);
    if (va < vb) return -1 * fator;
    if (va > vb) return 1 * fator;
    return 0;
  });
}

// LIMIT / OFFSET
const paginar = (itens, pagina, limite) => itens.slice((pagina - 1) * limite, (pagina - 1) * limite + limite);

module.exports = { contem, ordenar, paginar };
