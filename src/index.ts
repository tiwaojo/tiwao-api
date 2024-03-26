import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { schema } from "./schema";
import { createContext, GraphQLContext } from "./context";

// import { addMocksToSchema } from "@graphql-tools/mock";
// import { makeExecutableSchema } from "@graphql-tools/schema";

export async function startApolloServer() {
  const server = new ApolloServer<GraphQLContext>({
    schema: schema,
    //   schema: addMocksToSchema({
    //   schema: makeExecutableSchema({ typeDefs }),
    // }),
  });

  // Authentication resource: https://www.apollographql.com/docs/apollo-server/security/authentication/
  const { url } = await startStandaloneServer(server, {
    context: async () => createContext,
    listen: {
      port: 4000,
      // path: "/graphql",
      // host: 'localhost',
    },
  });
  console.log(`
    🚀  Server is running!
    📭  Query at ${url}
  `);
}

startApolloServer();
