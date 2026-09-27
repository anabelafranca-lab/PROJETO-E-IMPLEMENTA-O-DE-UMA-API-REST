const { Genero } = require('../../models');

// Recebe uma lista de nomes de gênero e garante que todos existam no banco,
// criando os que ainda não existem. Usado ao associar gêneros a um livro.
async function encontrarOuCriarPorNomes(nomes, transaction) {
  return Promise.all(
    nomes.map(async (nome) => {
      const [genero] = await Genero.findOrCreate({ where: { nome: nome.toLowerCase() }, transaction });
      return genero;
    })
  );
}

module.exports = { encontrarOuCriarPorNomes };
