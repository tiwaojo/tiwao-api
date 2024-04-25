import { PrismaClient } from "@prisma/client";
import { ServerResponse, type IncomingMessage} from "http";
// import { AuthPayloadType } from "./builder";

export const prisma = new PrismaClient({
  errorFormat: "pretty",
  // log: ['query', 'info', 'warn'],
  // Resource:https://www.prisma.io/docs/orm/prisma-client/observability-and-logging/logging
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
});

prisma.$on("info", (e) => {
  console.log("Query: " + e.message);
});

// Computed fields
// Resource: https://www.prisma.io/docs/orm/prisma-client/queries/computed-fields
prisma.$extends({
  result: {
    experience: {
      duration: {
        needs: {
          startDate: true,
          endDate: true,
        },
        compute(data) {
          return Math.round(
            (data.endDate.getTime() - data.startDate.getTime()) /
              (1000 * 3600 * 24)
          );
        },
      },
    },
  },
  query: {
    user: {
      async create({ args, query }) {
        return query(args);
      },
    },
  },
});

export interface GraphQLContext {
  // prisma: PrismaClient;
  req: IncomingMessage;
  res: ServerResponse;
}

// export const createContext = async (req: IncomingMessage) => ({
//   // return {
//     req
//     // prisma,
//   // } as GraphQLContext;
// })

export function createContext(req: IncomingMessage,res: ServerResponse) {  
  return {
    req,
    res
    // prisma,
  } as GraphQLContext;
}