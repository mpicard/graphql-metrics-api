import { graphiqlExpress, graphqlExpress } from 'apollo-server-express';
import * as cors from 'cors';
import * as express from 'express';

import { processMetric } from './api';
import { db } from './connectors';
import { Operations, Resolvers, Traces } from './models';
import { schema } from './schema';

const port = process.env.PORT || 8000;
const app = express();

app.use(cors());

app.use(express.json());

app.post('/api/metrics', processMetric);

app.use('/graphql', graphqlExpress({ schema }));

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

app.listen(port, () => {
  console.log(`API started http://localhost:${port}/graphiql`);
  db
    .connect()
    .then(() => db.query(`create extension if not exists "uuid-ossp";`))
    .then(() => Operations.init())
    .then(() => Traces.init())
    .then(() => Resolvers.init())
    .catch(err => {
      console.error('pg error:', err);
      process.exit(1);
    });
});
