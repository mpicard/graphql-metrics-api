import { db } from './connectors';

const insertIntoOperation = `insert into operation (query, name) values
                              ($1, $2) returning id`;

const insertIntoTrace = `insert into trace (operation_id, version, start_time,
                          end_time, duration, resolvers) values
                          ($1, $2, $3, $4, $5, $6);`

/**
 * Process and metrics from GraphQL tracing
 */
export function processMetric(req, res, next) {
  let { query, operationName, extensions } = req.body;

  // clean up query to remove sensitive data from parameters
  query = query.replace(/(\:.*?)(?=\,)|(\:.*?)(?=\))/g, '');
  // make identical queries formatted the same way
  query = query.replace(/(\b)/gm, ' $1 ');
  // remove redundant whitespace
  query = query.replace(/\s+/gm, ' ').trim();

  if (query.match(/^query IntrospectionQuery/)) {
    // You could store this but I'm not interested in the
    // Introspection queries' performance myself
    return res.sendStatus(200);
  }

  db.query(insertIntoOperation, [query, operationName])
    .then(result => result.rows[0].id)
    .catch(err => {
      // ignore duplicate queries
      if (err.constraint === 'operation_query_key') {
        // return operationId
        return db
          .query('select id from operation where query = $1', [query])
          .then(result => result.rows[0].id);
      }
    })
    .then(operationId => {
      if (extensions && extensions.tracing) {
        const values = [operationId, ...extractTracing(extensions)];

        return db.query(insertIntoTrace, values);
      }
    })
    .then(() => res.sendStatus(200))
    .catch(err => res.status(500).send(err.message));
}

/**
 * Extract relavent tracing data
 * @param extensions object
 */
function extractTracing(extensions) {
  const { version, startTime, endTime, duration, execution } = extensions.tracing;
  const resolvers = JSON.stringify(execution.resolvers);
  return [version, startTime, endTime, duration, resolvers];
}
