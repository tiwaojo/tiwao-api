
import type { CodegenConfig } from '@graphql-codegen/cli';
import { printSchema } from 'graphql';
import { schema } from './src/schema';

const config: CodegenConfig = {
  // schema: "http://localhost:7071/graphql",
  schema: printSchema(schema),
  config: {
    scalars: {
      DateTime: 'Date',
    },
  },
  generates: {
    // "src/generated/graphql.ts": {
    //   plugins: ["typescript", "typescript-resolvers", "typescript-document-nodes"]
    // },
    // "./graphql.schema.json": {
    //   plugins: ["introspection"]
    // },
    // './src/generated/': {
    //   preset: 'client',
    //   plugins: [],
    // },
    'dist/src/generated/introspection.json': {
      plugins: ['introspection'],
      config: {
        minify: false,
      },
    },
    'dist/src/generated/schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        // includeDirectives: true,
        // includeIntrospectionTypes: true,
        // commentDescriptions: true
      },
    },
  }
};

export default config;
