# tiwao-api

This is a GraphQL application that uses Pothos Graphql plugin for schema generation and the Prisma ORM to integrate with a MongoDB database. The API and MongoDB database run in separate Docker services.

## Project Structure

- `src/index.ts`: Entry point of the application.
- `prisma/schema.prisma`: Defines the Prisma schema.
- `graphql/index.ts`: Defines the entrypoint for deploying to azure functions.
- `src/api/mutations.ts`: Exports the resolvers for write operations in the GraphQL schema. e.g. POST, PUT, DELETE.
- `src/api/queries.ts`: Exports the resolvers for read operations in the GraphQL schema. e.g. GET.
- `src/generated/schema.graphql`: Defines the generated GraphQL schema.
- `permissions/index.ts`: Manages user authorization.
- `docker-compose.yml`: Defines the Docker services.
- `Dockerfile`: Defines the Docker image for the application.
- `package.json`: Lists the dependencies and scripts.
- `tsconfig.json`: Configuration file for TypeScript.

## Setup

1. Start the Docker services: `docker-compose up -d`
2. Install dependencies: `pnpm install`
3. Generate the Prisma client: `npx prisma generate`
4. Run migrations: `npx prisma migrate dev`
5. Start the application: `pnpm dev` or `pnpm start`(requires recompliation)
   1. Alternatively, you can run the application using azure functions: `pnpm run dev:func` and debug using VSCode Debugger. [Resource](https://www.apollographql.com/docs/apollo-server/v3/deployment/azure-functions/) or [video](https://youtu.be/unUeFApHeT0)
6. Open the Apollo Graphql Playground: `http://localhost:8080`  

## Usage

The application runs on `http://localhost:8080`. You can send GraphQL queries and mutations to this endpoint as well as use the Apollo Graphql Playground. Alternatively, you can change the port by setting the `PORT` environment variable.

## Notes
- [Pothos](https://pothos-graphql.dev/) - Used
    - Supports Deno
    - Its supposed to build GraphQL type definitions from the Typescript types generated from our database schema
- [GraphQL Codegen](https://the-guild.dev/graphql/codegen) - Used
    - Generates TS types from the GraphQL schema & frontend queries
    - Can generate types for the frontend and backend
    - Seems best for SDL-first development. i.e. you write your schema in SDL(`schema.graphql`) and then generate types from that
- [Nexus](https://nexusjs.org/docs/) - **replaced with Pothos**
    - [Nexus-Prisma-Plugin](https://graphql-nexus.github.io/nexus-prisma)
    - Uses code-first approach
    - Nexus is a code-first approach to building GraphQL APIs. It allows you to define your schema in Typescript and then generate the SDL from that.
    - Nexus-Prisma-Plugin is a plugin for Nexus that allows you to generate the Nexus types from your Prisma schema. This means that you can define your database schema in Prisma and then generate the GraphQL schema from that.
    - [GraphQL Nexus - Github](https://github.com/prisma/prisma-examples/tree/latest/typescript/graphql-nexus) - **Reference & Used**
        - [Nexus-Graphql Examples](https://github.com/graphql-nexus/nexus/tree/main/examples)
        - [Using nonNull](https://nexusjs.org/docs/api/list-nonNull#nonnull)
    - alternative [TypeGraphQL-Prisma](https://www.npmjs.com/package/typegraphql-prisma)
    - Provided less flexibility than Pothos
- [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server/tutorial/basic/07-connecting-server-and-database) - **Reference - Unused**
    - Simply has more resources and examples
    - A fully-featured GraphQL server with focus on easy setup, performance & great developer experience
    - **TODO**: Replace Apollo Server with Yoga due size and performance
- [Prisma Blog w/ React](https://www.prisma.io/blog/e2e-type-safety-graphql-react-2-j9mEyHY0Ej) - **Reference**
    - A tutorial on how to use Prisma with React
    - It uses Apollo Client to interact with the GraphQL API
    - It uses Prisma Client to interact with the database
    - It uses GraphQL Codegen to generate types for the frontend
- [Apollo Server - Defining a Schema](https://www.apollographql.com/docs/apollo-server/schema/schema) - **Reference - Used**
    - Apollo Server is an open-source, spec-compliant GraphQL server that's compatible with any GraphQL schema
    - It's the best way to build a production-ready, self-documenting GraphQL API that can use data from any source
    - It's designed to help you build and serve your GraphQL API with little to no configuration

The flow of types across your application will be as follows:
1. Prisma will generate types/api based off of your database schema to interact with database.
2. Pothos will use those types via a plugin to generate a GraphQL schema for Apollo Server.
3. GraphQL Codegen will read your GraphQL schema and generate types for your frontend codebase representing what is available via the API and how to interact with it.

## Bugs
GraphQL Cannot return null for non-nullable field User.createdAt.
- This is because a field has a constraint failed. Check the error message for more details as well as your primary keys and `@unique` constraints.
- 1-1 relation is broken. Documentation point to how to use with postgreSQL but not MongoDB. Cannot find any resources on how to fix this. [Stackoverflow issue](https://stackoverflow.com/questions/78038901/prismamongo-cant-delete-model-with-relations-the-change-you-are-trying-to) [Prisma 1-1 relation](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/one-to-one-relations#mongodb)
    - resolving to making 1-1 fields 1-m fields
### Troubshooting
- Drop all collections in the database and re-run the migrations. This aims to remove any constraints & relations that may be causing the issue.
```sh
# for mongodb via mongosh
db.getCollectionNames().forEach(function(collection) {
   db[collection].drop();
});
```
- Check the `prisma/schema.prisma` file for any constraints that may be causing the issue. e.g. `@unique`
- Restart the IDE and Docker services clearing any cache that may be causing the issue.

## References
https://learn.microsoft.com/en-us/azure/app-service/tutorial-nodejs-mongodb-app

### Pothos
- File structure is as is due to recommendations from Pothos.
    - The prisma client should not be put into context. [link](https://pothos-graphql.dev/docs/plugins/prisma#:~:text=It%20is%20strongly,Context)
### Nexus
- [intro](https://www.prisma.io/blog/using-graphql-nexus-with-a-database-pmyl3660ncst)
- [Example](https://blog.reilly.dev/building-typesafe-full-stack-app-w-apollo-server-4-railway-prisma-pothos-next-ts-part-1-setting-up-the-server#heading-add-root-mutation-andamp-resolver-for-user-type)
### Prisma
- [Prisma Client API reference](https://www.prisma.io/docs/orm/reference/prisma-client-reference#upsert)
### Apollo
- [Caching](https://www.apollographql.com/docs/apollo-server/performance/caching#setting-cache-hints)

### Azure
- [Enable Azure Monitor App Insights](https://learn.microsoft.com/en-us/azure/azure-monitor/app/javascript-sdk?tabs=npmpackage)
- [Deploying to Azure Webapps Using local Git](https://learn.microsoft.com/en-us/azure/app-service/deploy-zip?tabs=cli)
- [Deploying to Azure Webapps Using zip](https://learn.microsoft.com/en-us/azure/app-service/deploy-zip?tabs=cli)
- [Azure DevOps](https://www.youtube.com/watch?v=5jOvVY1G62U)
- [Azure Subscription Limits and Quotas](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/azure-subscription-service-limits#api-management-limits)

### Authentication & Authorization
- [reference - basic](https://github.com/mandiwise/basic-apollo-auth-demo)
- [JWT V API](https://softwareengineering.stackexchange.com/a/419604)
- [Apollo Server Auth](https://www.apollographql.com/docs/apollo-server/security/authentication/#in-resolvers)
- [Prisma graphql Auth](https://github.com/prisma/prisma-examples/blob/latest/typescript/graphql-auth/src/permissions/index.ts)
- [MSAL Node](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-node) - For authenticating w/ Azure AD

### Postman
- [Postman - GraphQL](https://learning.postman.com/docs/sending-requests/supported-api-frameworks/graphql/)
- [Testing Queries](https://youtu.be/kygb3sf3Nhc)
- [Extending expiry token time](https://community.postman.com/t/is-it-possible-to-extend-the-expiry-time-of-a-token/44841/3) - Maybe useful later

### Rate Limiting
- Implemented via Azure API Management
- Can be implemented via [directives](https://pothos-graphql.dev/docs/plugins/directives) in Pothos

### Validation
Note other derivatives/alternatives are aviailable. [Custom Validation](https://www.prisma.io/docs/orm/prisma-client/queries/custom-validation)
- [Zod Validator via Pothos](https://pothos-graphql.dev/docs/plugins/validation)
- [joi validator](https://joi.dev/)
- [prisma-joi-validator](https://github.com/omar-dulaimi/prisma-joi-generator)

## Testing

Run tests with `npm test`.

## Contributing

Please read `CONTRIBUTING.md` for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the `LICENSE.md` file for details.
