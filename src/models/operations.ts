import { db } from '../connectors';
import { Traces } from './traces';

const insertIntoOperation = `insert into operation (query, name) values
                              ($1, $2) returning id`;

/**
 * Operations store all unique GraphQL queries
 */
export class Operations {

  static init() {
    return db
      .query(`create table if not exists operation (
                id    uuid primary key default uuid_generate_v4(),
                query text unique not null,
                name  text
              );`);
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

}
