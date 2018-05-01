import { pg } from '../connectors';
import { Traces } from './traces';

const insertIntoOperation = `insert into operation (query, name) values
                              ($1, $2) returning id`;

export class Operations {

  static allOperations() {
    return pg
      .query('select * from operation;')
      .then(res => res.rows);
  }

  static get(id) {
    return pg
      .query('select * from operation where id = $1 limit 1;', [id])
      .then(res => res.rows[0]);
  }

  static create({ query, operationName, extensions }) {
    return pg
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

}
