import { builder } from "./builder";
// For printing graphql schema
import { writeFileSync } from "fs";
import { printSchema, lexicographicSortSchema } from "graphql";

import "./api"; // queries and mutations
// import "./schema"; // types
import "./schema/types"; // types
import path from "node:path";

builder.queryType({
  description: "The query root type.",
});
builder.mutationType({
  description: "The mutation root type.",
});

export const schema = builder.toSchema({});
const schemaAsString = printSchema(lexicographicSortSchema(schema));
writeFileSync(
  path.join(__dirname, "./generated/pothos-schema.graphql"),
  schemaAsString
);
