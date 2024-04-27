// import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import {
  startServerAndCreateHandler,
  AzureFunctionsContextFunctionArgument,
} from "@as-integrations/azure-functions";

import "../src/";
import { initContextCache } from "@pothos/core";
import { server } from "../src";
import { createContext } from "../src/context";


export default startServerAndCreateHandler(server, {
  context: async ({ req }: AzureFunctionsContextFunctionArgument) => {
    const context = await createContext(req);
    return {
      ...initContextCache(),
      ...context,
    };
  },
});
