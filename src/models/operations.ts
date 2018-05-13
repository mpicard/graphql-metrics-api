import { db } from '../connectors';
import { Traces } from './traces';

const insertIntoOperation = `insert into operation (query, name) values
                              ($1, $2) returning id`;

/**
 * Operations store all unique GraphQL queries
 */
export class Operations {

  static allOperations() {
    return db
      .query(`select * from operation order by name, query;`)
      .then(res => res.rows);
  }

  static get(id) {
    return db
      .query('select * from operation where id = $1 limit 1;', [id])
      .then(res => res.rows[0]);
  }

  static create({ query, operationName, extensions }) {
    return db
      .query(insertIntoOperation, [query, operationName])
      .then(res => {
        const operationId = res.rows[0].id;

        if (extensions && extensions.tracing) {
          Traces.create(operationId, extensions);
        }
      })
      .catch(err => {
        if (err.constraint !== 'operation_query_key') {
          throw err;
        }
      });
  }

  static avgRpm(operationId) {
    return db
      .query(`select round(avg(rpm), 2) from (select distinct
              date_trunc('minute', start_time), count(*) over (
              partition by date_trunc('minute', start_time)) as rpm
              from trace where operation_id = $1) as avg`, [operationId])
      .then(res => res.rows[0].round)
      .then(res => res ? res : 0);
  }

  static avgDuration(operationId) {
    return db
      .query(`select round(avg(duration)) from trace where operation_id = $1`, [operationId])
      .then(res => res.rows[0].round)
      .then(res => res ? res : 0);
  }

  static init() {
    return db
      .query(`create table if not exists operation (
                id    uuid primary key default uuid_generate_v4(),
                query text unique not null,
                name  text
              );`);
  }

}
