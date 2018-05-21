import { db } from '../connectors';

/**
 * Aggregate view of all types found in resolvers in traces
 */
export class Types {
  static allTypes() {
    return db
      .query(
        `with total as (
          select "parentType",
                 count(*) as parent_count
          from resolver
          group by 1
        )
        select md5(row(r."parentType", r."fieldName")::text) as key,
               r."parentType",
               r."fieldName",
               r."returnType",
               parent_count,
               round((count(*) * 100)::numeric / parent_count, 1) as usage
        from resolver r, total
        group by 2, 3, 4, 5;`
      )
      .then(res => res.rows);
  }
}
