import { Operations, Schemas, Traces } from './models';
import { Resolvers } from './models/resolvers';

export const resolvers = {
  Query: {
    allOperations: () => Operations.allOperations(),
    operation: (_, { id }) => Operations.get(id),
    trace: (_, { id }) => Traces.get(id),
    schema: () => ({})
  },
  Operation: {
    traces: ({ id }) => Traces.forOperation(id),
    // schema: ({ id }) => Schemas.forOperation(id),
    averageRequestsPerMinute: ({ id }) => Operations.averageRPM(id),
    averageResponseTime: ({ id }) => Operations.averageResponse(id)
  },
  Trace: {
    resolvers: ({ id }) => Resolvers.forTrace(id),
    startTime: trace => trace.start_time,
    endTime: trace => trace.end_time
  },
  Schema: {
    types: () => Schemas.allTypes()
  },
  Type: {
    returnType: type => type.type
  }
}
