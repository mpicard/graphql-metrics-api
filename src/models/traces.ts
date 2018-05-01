import { pg } from '../connectors';

const insertIntoTrace = `insert into trace (operation_id, version, start_time,
                          end_time, duration, resolvers) values
                          ($1, $2, $3, $4, $5, $6);`

export class Traces {

  static get(id) {
    return pg
      .query('select * from trace where id = $1 limit 1;', [id])
      .then(res => res.rows[0]);
  }

  static create(operationId, { tracing }) {
    const { version, startTime, endTime, duration } = tracing;
    const resolvers = JSON.stringify(tracing.execution.resolvers);
    const data = [operationId, version, startTime, endTime, duration, resolvers];

    return pg.query(insertIntoTrace, data);
  }

  static forOperation(operationId) {
    return pg
      .query('select * from trace where operation_id = $1;', [operationId])
      .then(res => res.rows);
  }

}
