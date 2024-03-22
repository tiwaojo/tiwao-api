import { PrismaClient} from "@prisma/client";
import { UserCreateSchema } from "./generated/yup-validate/schemas";

const prisma = new PrismaClient({
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

prisma.$on("query", (e) => {
  console.log("Query: " + e.query);
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        await UserCreateSchema.validate(
          {
            ...args.data,
            email: args.data.email.match(emailRegex),
            firstName: args.data.firstName,
            lastName: args.data.lastName,
          },
          { abortEarly: false }
        );
        console.log("UserCreateSchema.deps", UserCreateSchema.deps);
        return query(args);
      },
    },
  },
});

export interface GraphQLContext {
  prisma: PrismaClient;
}

export const createContext: GraphQLContext = {
  prisma: prisma,
};
