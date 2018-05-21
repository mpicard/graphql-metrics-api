import { Operations, Traces, Types } from './models';

export const resolvers = {
  Query: {
    allOperations: () => Operations.allOperations(),
    operation: (_, { id }) => Operations.get(id),
    trace: (_, { id }) => Traces.get(id),
    allTypes: () => Types.allTypes()
  },
  Operation: {
    traces: ({ id }) => Traces.forOperation(id),
    avgDuration: ({ id }) => Operations.avgDuration(id),
    avgRpm: ({ id }) => Operations.avgRpm(id)
  },
  Trace: {
    startTime: trace => trace.start_time,
    endTime: trace => trace.end_time
  }
};
