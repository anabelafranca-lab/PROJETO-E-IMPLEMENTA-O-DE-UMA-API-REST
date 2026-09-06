require('dotenv').config();
const path = require('path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const livrosRoutes = require('./routes/livros.routes');
const estudantesRoutes = require('./routes/estudantes.routes');
const emprestimosRoutes = require('./routes/emprestimos.routes');
const { tratadorErros, rotaNaoEncontrada } = require('./middlewares/erro.middleware');

const app = express();

app.use(express.json());

// Documentação interativa (Swagger UI) a partir do contrato OpenAPI
const openapiDocument = YAML.load(path.join(__dirname, 'docs', 'openapi.yaml'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

// Rotas da API — versionadas em /api/v1
app.use('/api/v1/livros', livrosRoutes);
app.use('/api/v1/estudantes', estudantesRoutes);
app.use('/api/v1/emprestimos', emprestimosRoutes);

app.get('/', (req, res) => {
  res.json({
    mensagem: 'API do Sistema de Biblioteca Escolar',
    documentacao: '/docs',
    versao: 'v1',
    recursos: ['/api/v1/livros', '/api/v1/estudantes', '/api/v1/emprestimos']
  });
});

// 404 para rotas não mapeadas + tratador central de erros (deve vir por último)
app.use(rotaNaoEncontrada);
app.use(tratadorErros);

const PORTA = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
    console.log(`Documentação disponível em http://localhost:${PORTA}/docs`);
  });
}

module.exports = app;
