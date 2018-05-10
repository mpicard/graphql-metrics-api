import { db } from '../connectors';

export class Resolvers {

  static forTrace(traceId) {
    return db
      .query('select resolver from resolver where trace_id = $1;', [traceId])
      .then(res => res.rows.map(row => row.resolver));
  }

  static init() {
    return db
      .query(`create or replace view resolver as
                select id as trace_id, operation_id,
                jsonb_array_elements(resolvers) as resolver
                from trace;`);
  }

}
