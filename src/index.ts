import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { ApolloServerErrorCode } from "@apollo/server/errors";
import { schema } from "./schema";
import { createContext, GraphQLContext } from "./context";
import { applyMiddleware } from "graphql-middleware";
import permissions from "./permissions";
import { initContextCache } from "@pothos/core";
import { InMemoryLRUCache } from "@apollo/utils.keyvaluecache";
import {
  ApolloServerPluginLandingPageLocalDefault,
  // ApolloServerPluginLandingPageProductionDefault,
} from "@apollo/server/plugin/landingPage/default";
import plugin from "./plugin";
import logger  from "./logging";

// Create an instance of ApolloServer
// More options can be found here: https://www.apollographql.com/docs/apollo-server/api/apollo-server/#options
export const server = new ApolloServer<GraphQLContext>({
  schema: applyMiddleware(schema, permissions),
  status400ForVariableCoercionErrors: true,
  includeStacktraceInErrorResponses: process.env.NODE_ENV === "development",
  cache: new InMemoryLRUCache({
    // resource: https://www.apollographql.com/docs/apollo-server/performance/cache-backends
    // ~100MiB
    maxSize: Math.pow(2, 20) * 100,
    // 5 minutes (in seconds)
    ttl: 300,
  }),
  plugins: [
    // process.env.NODE_ENV === "development"
    //   ? 
    ApolloServerPluginLandingPageLocalDefault(),
    // : ApolloServerPluginLandingPageProductionDefault({}),
    plugin,
  ],
  logger: logger,
  formatError: (formattedError, error) => {
    // Return a different error message
    if (
      formattedError.extensions?.code ===
      ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED
    ) {
      return {
        ...formattedError,
        message: "Your query doesn't match the schema. Try double-checking it!",
      };
    }

    if (formattedError.message.startsWith('Database Error: ')) {
      return { message: `Internal server error\n${error}` };
    }

    // Otherwise return the formatted error. This error can also
    // be manipulated in other ways, as long as it's returned.
    return formattedError;
  },
});

async function startApolloServer() {
  const { url } = await startStandaloneServer(server, {
    context: async ({ req, res }) => {
      const context = await createContext(req, res);
      return {
        ...initContextCache(),
        ...context,
      };
    },
    listen: {
      port: Number(process.env.PORT),
      path: "/graphql",
    },
  });
  console.log(`
  🚀  Server is running!
  📭  Query at ${url}
`);
}

startApolloServer();
