import { graphiqlExpress, graphqlExpress } from 'apollo-server-express';
import * as express from 'express';

import { pg } from './connectors';
import { createMetric } from './metrics';
import { schema } from './schema';

const app = express();

app.use(express.json());

app.post('/api/metrics', createMetric);

app.use('/graphql', graphqlExpress({ schema }));

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

app.listen(8000, () => {
  console.log('API started http://localhost:8000/graphiql');

  pg
    .connect()
    .then(() => pg.query(`create extension if not exists "uuid-ossp";`))

    .then(() => pg.query(`create table if not exists operation (
                          id    uuid primary key default uuid_generate_v4(),
                          query text unique not null,
                          name  text
                        );`))

    .then(() => pg.query(`create table if not exists trace (
                          id uuid primary key default uuid_generate_v4(),
                          operation_id uuid references operation(id),
                          version    smallint not null,
                          start_time timestamp with time zone not null,
                          end_time   timestamp with time zone not null,
                          duration   integer not null,
                          resolvers  jsonb
                        );`))

    .then(() => pg.query(`create index if not exists trace_operation_id_idx
                          on trace(operation_id);`))

    .then(() => pg.query(`create index if not exists trace_resolvers_idx
                          on trace using gin (resolvers);`))

    .then(() => pg.query(`create or replace view resolver as
                          select id as trace_id, operation_id,
                          jsonb_array_elements(resolvers) as resolver
                          from trace;`))

    .then(() => pg.query(`create or replace view schema as select distinct
                          operation_id,
                          resolver->>'parentType' as parent,
                          resolver->>'returnType' as type,
                          resolver->>'fieldName' as field
                          from resolver;`))

    .catch(err => {
      console.error("pg err:", err);
      process.exit(1);
    });
});
