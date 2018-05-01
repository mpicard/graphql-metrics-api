import { readFileSync } from 'fs';
import { makeExecutableSchema } from 'graphql-tools';

import { resolvers } from './resolvers';

const typeDefs = readFileSync(__dirname + '/schema.graphql', 'utf8');
export const schema = makeExecutableSchema({ typeDefs, resolvers });
