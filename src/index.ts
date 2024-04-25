import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
// import { ApolloServerErrorCode } from "@apollo/server/errors";
import { schema } from "./schema";
import { createContext, GraphQLContext } from "./context";
import { applyMiddleware } from "graphql-middleware";
import permissions from "./permissions";
import { initContextCache } from "@pothos/core";

export async function startApolloServer() {
  // Create an instance of ApolloServer
  // More options can be found here: https://www.apollographql.com/docs/apollo-server/api/apollo-server/#options
  const server = new ApolloServer<GraphQLContext>({
    schema: applyMiddleware(schema, permissions),
    introspection: process.env.NODE_ENV === "development",
    status400ForVariableCoercionErrors: true,
    includeStacktraceInErrorResponses: process.env.NODE_ENV === "development",
    // formatError: (formattedError) => {
    //   // Return a different error message
    //   if (
    //     formattedError.extensions?.code ===
    //     ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED
    //   ) {
    //     return {
    //       ...formattedError,
    //       message: "Your query doesn't match the schema. Try double-checking it!",
    //     };
    //   }
  
    //   // Otherwise return the formatted error. This error can also
    //   // be manipulated in other ways, as long as it's returned.
    //   return formattedError;
    // }
  });

  // Authentication resource: https://www.apollographql.com/docs/apollo-server/security/authentication/
  const { url } = await startStandaloneServer(server, {
    context: async ({ req,res }) => {
      const context = await createContext(req,res);
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
