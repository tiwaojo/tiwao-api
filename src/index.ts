import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import  {schema}  from './resolvers';
import { createContext, GraphQLContext } from './context';

// import { addMocksToSchema } from "@graphql-tools/mock";
// import { makeExecutableSchema } from "@graphql-tools/schema";

async function startApolloServer() {
  const server = new ApolloServer<GraphQLContext>({
    schema: schema,
  //   schema: addMocksToSchema({
  //   schema: makeExecutableSchema({ typeDefs }),
  // }),
  });

  const { url } = await startStandaloneServer(server,{
    context: async () => createContext,
    listen: {
      port: 4000,
      
      // host: 'localhost',
    }
  });
  console.log(`
    🚀  Server is running!
    📭  Query at ${url}
  `);
}

startApolloServer();