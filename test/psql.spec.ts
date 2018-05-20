// psql testbed
import { db } from '../src/connectors';

describe('psql', () => {
  beforeAll(() => {
    require('dotenv').config();
  });

  it('print resolver', () => {
    return db
      .query(`select resolver from resolver limit 1;`)
      .then(res => res.rows[0].resolver)
      .then(console.log);
  });

  it('jsonb_to_record', () => {
    return db
      .query(
        `
        select
          trace_id,
          operation_id,
          path,
          duration,
          "fieldName",
          "parentType",
          "returnType",
          "startOffset"
        from
          resolver,
          jsonb_to_record(resolver)
        as x(
          path text[],
          duration int,
          "fieldName" text,
          "parentType" text,
          "returnType" text,
          "startOffset" int
        )
        limit 1;`
      )
      .then(res => res.rows)
      .then(console.log);
  });
});
