import express from 'express';
import routes from './routes';

/**
 * Rota: Endereço completo da requisição
 * Recurso: Qual entidade estamos acessando do sistema
 *
 * GET: Buscar uma ou mais informações do Back-End
 * POST: Criar uma nova informação no Back-End
 * PUT: Atualizar uma informação existente no Back-End
 * DELETE: Remover uma informação do Back-End
 *
 * POST http://localhost:3333/users = Criar um usuário
 * GET http://localhost:3333/users = Listar usuários
 * GET http://localhost:3333/users/5 = Buscar dados do usuário com ID 5
 *
 * Request Param: Parâmetros que vem na própria rota que identificam um recurso
 * Query Param: Parâmetros que vem na própria rota geralmente opicionais para filtros, páginação
 * Request Body: Parâmetros para criação/atualização de informações
 *
 * SELECT * FROM users WHERE name = 'Diego'
 * knex('users').where('name', 'Diego').select('*')
 */

const app = express();

app.use(express.json());
app.use(routes);

app.listen(3333);