// import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import {
  startServerAndCreateHandler,
  AzureFunctionsContextFunctionArgument,
} from "@as-integrations/azure-functions";

import "../src/";
import { initContextCache } from "@pothos/core";
import { server } from "../src";
import { createContext } from "../src/context";

if (process.env.NODE_ENV === "development") {
  startServerAndCreateHandler(server, {
    context: async ({
      req,
      context,
    }: AzureFunctionsContextFunctionArgument) => {
      const ctx = await createContext(req, context.res);
      return {
        ...initContextCache(),
        ...ctx,
      };
    },
  });
}
