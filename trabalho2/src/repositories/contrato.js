'use strict';

// Utilitário para declarar métodos abstratos nos contratos dos repositórios.
// JavaScript não tem `interface`; usamos classes-base cujos métodos falham de
// forma explícita se uma implementação esquecer de sobrescrevê-los.
function naoImplementado(classe, metodo) {
  return () => {
    throw new Error(`${classe}.${metodo}() não foi implementado pela implementação concreta`);
  };
}

module.exports = { naoImplementado };
