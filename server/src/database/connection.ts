import knex from 'knex';
import path from 'path';

/**
 * Migrations = Histórico do banco de dados
 *
 * create table points - criado por Pedro Santos
 * create table users - criado por Melissa Santos
 */

const connection = knex({
    client: 'sqlite3',
    connection: {
        filename: path.resolve(__dirname, 'database.sqlite')
    },
    useNullAsDefault: true
});

export default connection;