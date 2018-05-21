import { db } from '../connectors';

/**
 * Aggregate view of all types found in resolvers in traces
 */
export class Types {
  static allTypes() {
    return db
      .query(
        `with p as (
          select "parentType",
                  count(*) as parent_count
          from resolver
          group by 1
        ), f as (
          select "parentType",
                  "fieldName",
                  count(*) as field_count
          from resolver
          group by 1, 2
        ), r as (
          select "parentType",
                  "fieldName",
                  "returnType"
          from resolver
          group by 1, 2, 3
        )
        select md5(row(f."parentType", f."fieldName")::text) as key,
                f."parentType",
                f."fieldName",
                r."returnType",
                round((field_count * 100)::numeric / parent_count, 1) as usage
        from p
        join f on p."parentType" = f."parentType"
        join r on f."parentType" = r."parentType" and f."fieldName" = r."fieldName";`
      )
      .then(res => res.rows);
  }
}
