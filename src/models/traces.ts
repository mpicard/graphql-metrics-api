import { db } from '../connectors';

const insertIntoTrace = `insert into trace (
                          operation_id,
                          version,
                          start_time,
                          end_time,
                          duration,
                          resolvers
                        ) values ($1, $2, $3, $4, $5, $6);`;

export class Traces {
  static get(id) {
    return db
      .query('select * from trace where id = $1 limit 1;', [id])
      .then(res => res.rows[0]);
  }

  static create(operationId, { tracing }) {
    const { version, startTime, endTime, duration } = tracing;
    const resolvers = JSON.stringify(tracing.execution.resolvers);
    const data = [
      operationId,
      version,
      startTime,
      endTime,
      duration,
      resolvers
    ];

    return db.query(insertIntoTrace, data);
  }

  static forOperation(operationId) {
    return db
      .query('select * from trace where operation_id = $1;', [operationId])
      .then(res => res.rows);
  }

  static init() {
    return db
      .query(
        `create table if not exists trace (
          id uuid primary key default uuid_generate_v4(),
          operation_id uuid references operation(id),
          version    smallint not null,
          start_time timestamp with time zone not null,
          end_time   timestamp with time zone not null,
          duration   integer not null,
          resolvers  jsonb
        );`
      )
      .then(() =>
        db.query(`create index if not exists trace_operation_id_idx
                    on trace(operation_id);`)
      )
      .then(() =>
        db.query(`create index if not exists trace_resolvers_idx
                    on trace using gin (resolvers);`)
      );
  }
}
