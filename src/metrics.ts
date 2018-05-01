import { pg } from './connectors';

const insertIntoOperation = `insert into operation (query, name) values
                              ($1, $2) returning id`;

const insertIntoTrace = `insert into trace (operation_id, version, start_time,
                          end_time, duration, resolvers) values
                          ($1, $2, $3, $4, $5, $6);`

export function createMetric(req, res, next) {
  let { query, operationName, extensions } = req.body;

  // clean up query to remove sensitive data from parameters
  query = query.replace(/(\:.*?)(?=\,)|(\:.*?)(?=\))/g, '');
  // remove redundant whitespace
  query = query.replace(/\s+/g, ' ').trim();

  if (query.match(/^query IntrospectionQuery/)) {
    // give the IntrospectionQuery an operationName
    // since it's a special case
    operationName = 'IntrospectionQuery';
  }

  pg.query(insertIntoOperation, [query, operationName])
    .then(result => result.rows[0].id)
    .catch(err => {
      // ignore duplicate queries
      if (err.constraint === 'operation_query_key') {
        // return operationId
        return pg
          .query('select id from operation where query = $1', [query])
          .then(result => result.rows[0].id);
      }
    })
    .then(operationId => {
      if (extensions && extensions.tracing) {
        const {
          version, startTime, endTime, duration, execution
        } = extensions.tracing;

        const resolvers = JSON.stringify(execution.resolvers);

        const values = [
          operationId, version, startTime, endTime, duration, resolvers
        ];

        return pg.query(insertIntoTrace, values);
      } else {
        console.log('No tracings?', { query });
      }
    })
    .then(() => res.sendStatus(200))
    .catch(err => res.status(500).send(err.message));
}
