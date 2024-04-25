import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import ValidationPlugin from '@pothos/plugin-validation';
import WithInputPlugin from '@pothos/plugin-with-input';
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import { DateTimeISOResolver } from "graphql-scalars";
import { prisma, GraphQLContext } from "./context";
import { Prisma } from "@prisma/client";

// Adding custom AuthPayload object type using SchemaTypes
// resource: https://pothos-graphql.dev/docs/guide/objects#using-schematypes
export interface AuthPayloadType {
  token: string;
  expiry: Date;
}

export const builder = new SchemaBuilder<{
  Scalars: {
    DateTime: {
      Input: Date;
      Output: Date;
    };
  };
  
  PrismaTypes: PrismaTypes;
  Objects: { AuthPayload: AuthPayloadType };
  Context: {
    ctx: GraphQLContext;
  };
}>({
  plugins: [ ValidationPlugin, WithInputPlugin,PrismaPlugin ],
  prisma: {
    client: prisma,  
    // Because the prisma client is loaded dynamically, we need to explicitly provide the some information about the prisma schema
    // Adding context: https://pothos-graphql.dev/docs/plugins/prisma#set-up-the-builder
    dmmf: Prisma.dmmf, 
    filterConnectionTotalCount: true, 
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