// const config: CodegenConfig = {
// schema: "src/schema/schema.graphql",
//   documents: "src/**/*.graphql",
//   generates: {
//     "src/generated/types.ts": {
      
//     },
//   },
// };

// export default config;


import type { CodegenConfig } from '@graphql-codegen/cli';
import { printSchema } from 'graphql';
import { schema } from './src/builder';

// Used for generating client types
const config: CodegenConfig = {
  schema: printSchema(schema),
  documents: ['src/**/*.tsx'],
  generates: {
    './src/gql/': {
      preset: 'client',
      // plugins: [],
      // plugins: [
      //   "typescript",
      //   "typescript-operations",
      //   "typed-document-node",
      //   "typescript-resolvers",
      // ],
    //   config: {
    //     skipTypename: false,
    //     withHooks: true,
    //     withComponent: false,
    //     withHOC: false,
    //     apolloAngularVersion: 2,
    //   },
    },
  },
};

export default config;