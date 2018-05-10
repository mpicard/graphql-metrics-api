import * as express from 'express';

import { processMetric } from './api';
import { db } from './connectors';

const app = express();

app.use(express.json());

app.post('/api/metrics', processMetric);

app.listen(8000, () => {
  console.log('API started http://localhost:8000/');

  db.connect()
    .then(() => db.query(`create extension if not exists "uuid-ossp";`))
    // .then(() => Operations.init())
    // .then(() => Traces.init())
    // .then(() => Resolvers.init())
    // .then(() => Schemas.init())
    .catch(err => {
      console.error("pg error:", err);
      process.exit(1);
    });
});
