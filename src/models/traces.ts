import { db } from '../connectors';

export class Traces {

  static init() {
    return db
      .query(`create table if not exists trace (
                id           uuid primary key default uuid_generate_v4(),
                operation_id uuid references operation(id),
                version      smallint not null,
                start_time   timestamp with time zone not null,
                end_time     timestamp with time zone not null,
                duration     integer not null,
                resolvers    jsonb
              );`)
      .then(() => db.query(`create index if not exists trace_operation_id_idx
                              on trace(operation_id);`))
      .then(() => db.query(`create index if not exists trace_resolvers_idx
                              on trace using gin (resolvers);`));
  }

  static create(operationId, { tracing }) {
    const { version, startTime, endTime, duration } = tracing;
    const resolvers = JSON.stringify(tracing.execution.resolvers);
    const data = [operationId, version, startTime, endTime, duration, resolvers];

    return db.query(`insert into trace (operation_id, version, start_time,
                     end_time, duration, resolvers) values
                     ($1, $2, $3, $4, $5, $6);`, data);
  }

}
