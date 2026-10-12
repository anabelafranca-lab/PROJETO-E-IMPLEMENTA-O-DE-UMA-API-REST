# ADR-0005 — Eventos de domínio (Observer) para notificações

- **Status:** aceita
- **Data:** 2026-10

## Contexto
Registrar ou devolver um empréstimo deve gerar uma notificação. Colocar isso dentro do caso de uso o faria
conhecer o canal (log, e-mail, SMS) e deixaria uma falha de notificação capaz de comprometer uma operação
já concluída.

## Decisão
Os casos de uso **publicam** fatos (`emprestimo.registrado`, `emprestimo.devolvido`) em um
`BarramentoDeEventos`; `NotificarEmprestimoListener` os **assina** e usa um `notificador` injetado.
A publicação ocorre **após o commit**; o erro de um assinante é capturado, registrado no log e **não** afeta
quem publicou nem os demais assinantes.

## Consequências
- ✅ Novas reações (e-mail, auditoria) entram como novos assinantes, sem tocar nos casos de uso.
- ✅ Operações que falham (rollback) não notificam ninguém — coberto por teste.
- ⚠️ Assinantes rodam de forma assíncrona e sem garantia de entrega (não há fila persistente). Adequado
  ao escopo; um requisito de entrega garantida pediria uma fila/outbox.
