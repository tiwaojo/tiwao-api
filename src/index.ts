import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { schema } from "./schema";
import { createContext, GraphQLContext } from "./context";
import { applyMiddleware } from "graphql-middleware";
import permissions from "./permissions";
import { initContextCache } from "@pothos/core";

export async function startApolloServer() {
  const server = new ApolloServer<GraphQLContext>({
    schema: applyMiddleware(schema, permissions),
  });

  // Authentication resource: https://www.apollographql.com/docs/apollo-server/security/authentication/
  const { url } = await startStandaloneServer(server, {
    context: async ({ req }) => {
      const context = await createContext(req);
      return {
        ...initContextCache(),
        ...context,
      };
    },
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
