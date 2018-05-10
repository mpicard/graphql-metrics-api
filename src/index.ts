import { graphiqlExpress, graphqlExpress } from 'apollo-server-express';
import * as express from 'express';

import { processMetric } from './api';
import { db } from './connectors';
import { Operations, Resolvers, Schemas, Traces } from './models';
import { schema } from './schema';

const app = express();

app.use(express.json());

app.post('/api/metrics', processMetric);

app.use('/graphql', graphqlExpress({ schema }));

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

app.listen(8000, () => {
  console.log('API started http://localhost:8000/graphiql');
  db
    .connect()
    .then(() => db.query(`create extension if not exists "uuid-ossp";`))
    .then(() => Operations.init())
    .then(() => Traces.init())
    .then(() => Resolvers.init())
    .then(() => Schemas.init())
    .catch(err => {
      console.error("pg err:", err);
      process.exit(1);
    });
});
