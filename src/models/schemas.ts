import { db } from '../connectors';

export class Schemas {

  static forOperation(operationId) {
    return db
      .query(`select name, field, type as returnType from type where operation_id = $1
              group by 1, 2, 3;`, [operationId])
      .then(res => res.rows);
  }

  static allTypes() {
    return db
      .query(`select name, field, type from type group by 1, 2, 3 order by 1;`)
      .then(res => res.rows);
  }

  static init() {
    return db
      .query(`create or replace view schema as select distinct
              operation_id,
              resolver->>'parentType' as name,
              resolver->>'returnType' as type,
              resolver->>'fieldName' as field
              from resolver;`);
  }

}
