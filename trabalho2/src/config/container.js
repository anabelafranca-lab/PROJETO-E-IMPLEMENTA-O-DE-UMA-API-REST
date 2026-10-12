'use strict';

const env = require('./env');
const { criarLogger } = require('./logger');
const criarPersistencia = require('../repositories/criarPersistencia');
const BarramentoDeEventos = require('../events/BarramentoDeEventos');
const NotificarEmprestimoListener = require('../events/NotificarEmprestimoListener');

const LivroService = require('../services/LivroService');
const EstudanteService = require('../services/EstudanteService');
const EmprestimoService = require('../services/EmprestimoService');
const RegistrarEmprestimoService = require('../services/RegistrarEmprestimoService');
const AtualizarEmprestimoService = require('../services/AtualizarEmprestimoService');
const RemoverEmprestimoService = require('../services/RemoverEmprestimoService');

const LivroController = require('../controllers/LivroController');
const EstudanteController = require('../controllers/EstudanteController');
const EmprestimoController = require('../controllers/EmprestimoController');

const relogioDoSistema = { hoje: () => new Date().toISOString().slice(0, 10) };

/**
 * RAIZ DE COMPOSIÇÃO — o único lugar que conhece TODAS as peças concretas e
 * decide quem recebe o quê (Injeção de Dependência manual, sem biblioteca).
 *
 * Todo o resto do sistema recebe suas dependências prontas pelo construtor e
 * nunca usa `new` para criar colaboradores. Tudo pode ser substituído por
 * parâmetro: o driver de persistência, o logger, o relógio, o canal de notificação.
 */
function criarContainer({
  driver = env.repositoryDriver,
  logger = criarLogger({ silencioso: env.silencioso }),
  relogio = relogioDoSistema,
  notificador = { notificar: (mensagem) => logger.info(`[notificação] ${mensagem}`) },
  dadosIniciais = true
} = {}) {
  // 1) Persistência (a Factory escolhe a família de implementações)
  const persistencia = criarPersistencia({ driver, dadosIniciais });
  const { livroRepository, estudanteRepository, emprestimoRepository, unitOfWork } = persistencia;

  // 2) Eventos de domínio (Observer)
  const eventos = new BarramentoDeEventos({ logger });
  new NotificarEmprestimoListener({ notificador }).registrarEm(eventos);

  // 3) Serviços — recebem repositórios/unit of work prontos
  const livroService = new LivroService({ livroRepository, emprestimoRepository });
  const estudanteService = new EstudanteService({ estudanteRepository, emprestimoRepository });
  const emprestimoService = new EmprestimoService({ emprestimoRepository });
  const registrarEmprestimoService = new RegistrarEmprestimoService({ unitOfWork, eventos });
  const atualizarEmprestimoService = new AtualizarEmprestimoService({ unitOfWork, eventos, relogio });
  const removerEmprestimoService = new RemoverEmprestimoService({ unitOfWork });

  // 4) Controladores — recebem serviços prontos
  const controllers = {
    livro: new LivroController({ livroService }),
    estudante: new EstudanteController({ estudanteService }),
    emprestimo: new EmprestimoController({
      emprestimoService,
      registrarEmprestimoService,
      atualizarEmprestimoService,
      removerEmprestimoService
    })
  };

  return {
    controllers,
    services: {
      livroService,
      estudanteService,
      emprestimoService,
      registrarEmprestimoService,
      atualizarEmprestimoService,
      removerEmprestimoService
    },
    persistencia,
    eventos,
    logger,
    encerrar: () => persistencia.encerrar()
  };
}

module.exports = { criarContainer };
