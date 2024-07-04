import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { ApolloServerErrorCode } from "@apollo/server/errors";
import { applyMiddleware } from "graphql-middleware";
import { initContextCache } from "@pothos/core";
import { ApolloServerPluginCacheControl } from "@apollo/server/plugin/cacheControl";
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from "@apollo/server/plugin/landingPage/default";
import { KeyvAdapter } from "@apollo/utils.keyvadapter";
import Keyv from "keyv";
import KeyvGzip from "@keyv/compress-gzip";
import responseCachePlugin from "@apollo/server-plugin-response-cache";

import permissions from "./permissions";
import { schema } from "./schema";
import { createContext, GraphQLContext } from "./context";
import plugin from "./plugin";
import logger from "./logging";
import { DocumentNode } from "graphql";
import "@keyv/redis"

// Create an instance of ApolloServer
// More options can be found here: https://www.apollographql.com/docs/apollo-server/api/apollo-server/#options
export const server = new ApolloServer<GraphQLContext>({
  schema: applyMiddleware(schema, permissions),
  status400ForVariableCoercionErrors: true,
  includeStacktraceInErrorResponses: process.env.NODE_ENV === "development",
  // resource: https://www.apollographql.com/docs/apollo-server/performance/cache-backends
  cache: new KeyvAdapter(
    new Keyv(process.env.REDIS_URL || "redis://redis:6379", {
      ttl: 30,
      adapter: "redis",
      deserialize(data) {
        console.log('deserialize: ', data);
        
        return JSON.parse(data);
      },
      // compression: new KeyvGzip(),
    })
  ),
  plugins: [
    plugin,
    // TODO: investigate caching with responseCachePlugin
    responseCachePlugin({
    // resource: https://www.apollographql.com/docs/apollo-server/performance/caching/#caching-with-responsecacheplugin-advanced
    async sessionId(requestContext) {
      return requestContext.request.http?.headers.get('session-id') || null;
    },
    async shouldReadFromCache(requestContext) {
      console.log('shouldReadFromCache', requestContext.request.http?.method);
      
      return requestContext.request.http?.headers.has("cache-control") ? true : false;
    },
    // async shouldWriteToCache(requestContext) {
    //   console.log('shouldWriteToCache', requestContext.request.http?.method);
      
    //   return requestContext.request.http?.method === 'POST' ? true : false;
    // }
    }),
    ApolloServerPluginCacheControl({
      // Allows us to set caching policy at the resolvers or schema level via directives. 
      // The plugin will automatically calculate the max age of the response based on the cache control directives.
      // resource: https://www.apollographql.com/docs/apollo-server/api/plugin/cache-control
      defaultMaxAge: 10, // 10 seconds
      // calculateHttpHeaders: true,
    }),
    process.env.NODE_ENV === "development"
      ? ApolloServerPluginLandingPageLocalDefault()
      : ApolloServerPluginLandingPageProductionDefault({}),
  ],
  logger: logger,
  // TODO: Impl apq and caching for persisted queries for performance
  // resource: https://www.apollographql.com/docs/apollo-server/performance/apq
  persistedQueries: {
    cache: new KeyvAdapter(
      new Keyv(process.env.REDIS_URL+ "/0" || "redis://redis:6379", {
        ttl: 300,
        deserialize(data) {
          console.log('deserialize: ', data);
          
          return JSON.parse(data);
        },
        serialize(data) {
          console.log('serialize: ', data);
          
          return JSON.stringify(data);
        },
        // adapter: "redis",
        // compression: new KeyvGzip(),
      })
    ),
  },
  // A cache store for previously parsed queries. This can improve performance by skipping parsing and validating the operation
  documentStore: new KeyvAdapter<DocumentNode>(
    new Keyv(process.env.REDIS_URL + '/0' || "redis://redis:6379", {
      ttl: 300,
    })
  ),
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

    if (formattedError.message.startsWith("Database Error: ")) {
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
      port: (process.env.PORT as number | undefined) || 8080,
    },
  });
  
  server.logger.info(`🚀 Server ready at ${url}`);
}

// TODO: Add Application Insights. Note this is resource isn't a part of the Azure Free Services
// Resource: https://learn.microsoft.com/en-us/azure/azure-monitor/app/javascript-sdk?tabs=npmpackage
// const appInsights = new ApplicationInsights({ config: {
//   connectionString: 'YOUR_CONNECTION_STRING'
//   /* ...Other Configuration Options... */
// } });
// appInsights.loadAppInsights();
// appInsights.trackPageView();

startApolloServer();
