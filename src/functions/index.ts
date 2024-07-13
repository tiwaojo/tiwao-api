import { v4 } from "@as-integrations/azure-functions";

import { app } from "@azure/functions";

import { initContextCache } from "@pothos/core";
import { server } from "..";
import { createContext } from "../context";
import { tiwaoapitrigger } from "./tiwaoapitrigger";

app.http("graphql", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: v4.startServerAndCreateHandler(server, {
    context: async ({
      req,
    }: // context,
    v4.AzureFunctionsContextFunctionArgument) => {
      const ctx = await createContext(req);
      return {
        ...initContextCache(),
        ...ctx,
      };
    },
  }),
});

app.http("tiwaoapitrigger", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: tiwaoapitrigger,
});
