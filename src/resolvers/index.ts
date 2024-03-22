import {
  makeSchema,
  // plugin,
  // queryComplexityPlugin
} from "nexus";
// import { validatePlugin } from "nexus-validate";
import path from "path";
import { DateTime } from "nexus-prisma/scalars";
import * as api from "./api";
import * as schematypes from "./schema";

export const schema = makeSchema({
  types: [DateTime, schematypes, api],
  plugins: [
     // Resource: https://github.com/filipstefansson/nexus-validate?tab=readme-ov-file#custom-errors
    // validatePlugin(
    //   {
    //   formatError: ({ error }) => {
    //     if (error instanceof ValidationError) {
    //       // convert error to UserInputError from apollo-server
    //       return new UserInputError(error.message, {
    //         invalidArgs: [error.path],
    //       });
    //     }

    //     return error;
    //   },
    // }
    // ),
    // queryComplexityPlugin(), // Resource: https://nexusjs.org/docs/plugins/query-complexity
    // fieldAuthorizePlugin(), // Resource: https://nexusjs.org/docs/plugins/field-authorize
    // plugin().config.
  ],
  // sourceTypes: {
  //   modules: [
  //     {
  //       module: require.resolve("@prisma/client/index.d.ts"),
  //       alias: "prisma",
  //     },
  //   ],
  //   debug: true,
  // },
  // shouldGenerateArtifacts: true,
  contextType: {
    module: require.resolve("../context"),
    export: "GraphQLContext",
  },
  outputs: {
    schema: path.join(__dirname, "./generated/schema.graphql"),
    typegen: path.join(__dirname, "./generated/nexus.ts"),
  },
});
