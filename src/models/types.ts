import { db } from '../connectors';

export class Types {
  static init() {
    db.query(`create or replace view type as (
                select md5(row(name, field)::text) as id,
                       name,
                       field,
                       return_type
                from (
                  select r->>'parentType' as name,
                         r->>'fieldName' as field,
                         r->>'returnType' as return_type
                  from trace
                  cross join jsonb_array_elements(resolvers)
                  with ordinality as elements(r, idx)
                  group by 1, 2, 3
                  order by 1, 2, 3
                ) x
              );`);
  }

  static allTypes() {
    return db.query(`select * from type;`).then(res => res.rows);
  }
}
