import { ApolloServerPlugin, HeaderMap } from "@apollo/server";

// This is a plugin that will be used by Apollo Server to log information about the server.
// for more information on the lifecycle: https://www.apollographql.com/docs/apollo-server/integrations/plugins/#request-lifecycle-event-flow

export default {
  async serverWillStart(service) {
    // service.logger.info("Server Starting");
    return {
      // TODO: Implement a custom landing page for the server
      // note: if using express assets may need to be served via an endpoint. see: https://stackoverflow.com/a/76418631
      // async renderLandingPage() {
      //   const html= `<!DOCTYPE html>
      //       <html>
      //         <head>
      //         </head>
      //         <body>
      //         <h1>My Custom Landing Page</h1>
      //         </body>
      //       </html>`;
      //   return {
      //     html,
      //   };
      // },
      async serverWillStop() {
        service.logger.info("🏁 Server is Stoping");
      },
    };
  },

  // Fires whenever a GraphQL request is received from a client.
  async requestDidStart(requestContext) {
    const start = Date.now();
    requestContext.logger.info("Addressing Request from client");

    return {
      // Fires whenever Apollo Server will parse a GraphQL
      // request to create its associated document AST.
      async parsingDidStart(requestContext) {
        requestContext.logger.info("Parsing request");
      },

      // Fires whenever Apollo Server will validate a
      // request's document AST against your GraphQL schema.
      async validationDidStart(requestContext) {
        requestContext.logger.info("Validating request");
      },

      async didResolveOperation(requestContext) {
        requestContext.logger.info("Resolving operation");
      },

      responseForOperation(requestContext) {
        if (requestContext.request.operationName === "IntrospectionQuery") {
          requestContext.logger.info("Responding to introspection query");
        } else {
          requestContext.logger.info(
            `Preparing Response for the following operation: ${requestContext.request.query}`
          );
        }
      },
      
      async executionDidStart(requestContext) {
        requestContext.logger.info("Execution started");
      },

      async didEncounterSubsequentErrors(requestContext, errors) {
        requestContext.logger.error(
          `An error happened in response to ${requestContext.operationName}  
            ${requestContext.request.query}
            ${JSON.stringify(requestContext.request.variables)} 
            ${errors}`
        );
        requestContext.response.http.status = 500;
      },

      async didEncounterErrors(requestContext) {
        requestContext.logger.warn(
          `An error was encountered in response to query: 
                  ${requestContext.request.query}
                  ${requestContext.errors}`
        );
        requestContext.response.http.status = 500;
      },

      async willSendResponse({ response, overallCachePolicy }) {
        // resource: https://www.apollographql.com/docs/apollo-server/performance/caching/#caching-with-a-cdn
        const policyIfCacheable = overallCachePolicy.policyIfCacheable();

        if (policyIfCacheable && !response.http.headers && response.http) {
          console.log("Setting cache headers");
          response.http.headers = new HeaderMap().set(
            "cache-control",
            // ... or the values your CDN recommends
            `max-age=60, s-maxage=${
              overallCachePolicy.maxAge
            }, ${policyIfCacheable.scope.toLowerCase()}`
          );
        }

        const elapsed = Date.now() - start;
        const size = JSON.stringify(response).length * 2;
        response.http.headers.set("X-Response-Time", `${elapsed}ms`);
        response.http.headers.set("X-Response-Size", `${size}b`);
        response.http.status = 200;
        requestContext.logger.info(
          `Execution elapsed time: ${elapsed}ms, Response size: ${size}b`
        );
      },
    };
  },
} as ApolloServerPlugin;
