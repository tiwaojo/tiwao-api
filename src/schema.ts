import { builder } from "./builder";

import "./api/mutations"; // mutations
import "./api/queries"; // queries 
import "./schema/types"; // types
import { writeFileSync } from "fs";
import { printSchema, lexicographicSortSchema } from "graphql";
import path from "path";

builder.queryType({
  description: "The query root type.",
});
builder.mutationType({
  description: "The mutation root type.",
});

export const schema = builder.toSchema({sortSchema: true});
const schemaAsString = printSchema(lexicographicSortSchema(schema));
writeFileSync(
  path.join(__dirname, "generated/pothos-schema.graphql"),
  schemaAsString
);
