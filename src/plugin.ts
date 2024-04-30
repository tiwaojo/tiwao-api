import { ApolloServerPlugin } from "@apollo/server";

export default {
  async serverWillStart(service) {
    service.logger.info("Server Starting!");
    return {
      // async renderLandingPage() {
      //   return {
      //     html() {
      //       `<h1>My Custom Landing Page</h1>`;
      //     },
      //   };
      // },
      async serverWillStop() {
        service.logger.info("Server Stoping!");
      },
    };
  },
  // Fires whenever a GraphQL request is received from a client.
  async requestDidStart(requestContext) {
    requestContext.logger.info(
      ("Addressing request: " + requestContext.request.http?.body) as string
    );

    return {
      // Fires whenever Apollo Server will parse a GraphQL
      // request to create its associated document AST.
      async parsingDidStart(requestContext) {
        requestContext.logger.info("Parsing started!");
      },

      async executionDidStart(requestContext) {
        requestContext.logger.info("Execution started!");
      },

      async didEncounterSubsequentErrors(requestContext, errors) {
        requestContext.logger.error(
          `an error happened in response to ${requestContext.operationName} ` +
            requestContext.request.query +
            " with variables " +
            JSON.stringify(requestContext.request.variables) +
            "\n\n" +
            errors
        );
      },

      // Fires whenever Apollo Server will validate a
      // request's document AST against your GraphQL schema.
      async validationDidStart(requestContext) {
        requestContext.logger.info("Validation started!");
      },

      responseForOperation(requestContext) {
        requestContext.logger.info(
          "responseForOperation" + requestContext.response.http.status
        );
      },

      async didEncounterErrors(requestContext) {
        requestContext.logger.warn(
          "an error was encountered in response to query " +
            requestContext.request.query +
            "\n\n" +
            requestContext.errors
        );
      },

      // async willSendResponse({ response }) {
      //     if (response.extensions?.cacheControl) {
      //       response.http.headers.set(
      //         "Cache-Control",
      //         response.extensions.cacheControl.toString()
      //       );
      //     }
      //   },
    };
  },
} as ApolloServerPlugin;
