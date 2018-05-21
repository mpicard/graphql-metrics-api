import { db } from '../connectors';

/**
 * View of all trace resolvers
 */
export class Resolvers {
  static init() {
    db.query(`
      create or replace view resolver as
      select trace.id as trace_id, operation_id, x.*
      from
        trace,
        jsonb_array_elements(resolvers) as resolver,
        jsonb_to_record(resolver) as x(
          path text[],
          duration int,
          "fieldName" text,
          "parentType" text,
          "returnType" text,
          "startOffset" int
        )`);
  }
}
