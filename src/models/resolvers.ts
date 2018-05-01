import { pg } from '../connectors';

export class Resolvers {

  static forTrace(traceId) {
    return pg
      .query('select resolver from resolver where trace_id = $1;', [traceId])
      .then(res => res.rows.map(row => row.resolver));
  }

}
