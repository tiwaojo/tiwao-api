import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import ValidationPlugin from '@pothos/plugin-validation';
import WithInputPlugin from '@pothos/plugin-with-input';
import AuthzPlugin from '@pothos/plugin-authz';
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import { DateTimeISOResolver } from "graphql-scalars";
import { prisma, GraphQLContext } from "./context";

export const builder = new SchemaBuilder<{
  Scalars: {
    DateTime: {
      Input: Date;
      Output: Date;
    };
  };
  Context: {
    ctx: GraphQLContext;
  };
  PrismaTypes: PrismaTypes;
  // AuthZRule: keyof typeof rules;
  // AuthTypes: {
  //   User: {
  //     Role: "ADMIN" | "USER";
  //   };
  // };
}>({
  plugins: [PrismaPlugin, ValidationPlugin, WithInputPlugin, AuthzPlugin],
  prisma: {
    client: prisma,    
  },
  withInput: {
    typeOptions: {
      // default options for Input object types created by this plugin
    },
    argOptions: {
      // set required: false to override default behavior
    },
  },
  validationOptions: {
    // Resource: https://pothos-graphql.dev/docs/plugins/validation
    // optionally customize how errors are formatted
    validationError: (zodError) => {
      // the default behavior is to just throw the zod error directly
      return zodError;
    },
  },
});

builder.addScalarType("DateTime", DateTimeISOResolver, {});