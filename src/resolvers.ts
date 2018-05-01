import { Operations, Traces } from './models';
import { Resolvers } from './models/resolvers';

export const resolvers = {
  Query: {
    allOperations: () => Operations.allOperations(),
    operation: (_, { id }) => Operations.get(id),
    trace: (_, { id }) => Traces.get(id)
  },
  Operation: {
    traces: ({ id }) => Traces.forOperation(id)
  },
  Trace: {
    resolvers: ({ id }) => Resolvers.forTrace(id),
    startTime: trace => trace.start_time,
    endTime: trace => trace.end_time
  }
}
