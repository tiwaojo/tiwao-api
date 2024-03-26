# tiwao-api

This is a GraphQL application that uses the Prisma ORM and integrates with a MongoDB database. The API and MongoDB database run in separate Docker services.

## Project Structure

- `src/index.ts`: Entry point of the application.
- `src/schema.graphql`: Defines the GraphQL schema.
- `src/resolvers/index.ts`: Exports the resolvers for the GraphQL schema.
- `src/prisma/client.ts`: Initializes and exports the Prisma client.
- `src/prisma/schema.prisma`: Defines the Prisma schema.
- `prisma`: Contains the Prisma migration files.
- `docker-compose.yml`: Defines the Docker services.
- `Dockerfile`: Defines the Docker image for the application.
- `package.json`: Lists the dependencies and scripts.
- `tsconfig.json`: Configuration file for TypeScript.

## Setup

1. Install dependencies: `npm install`
2. Start the Docker services: `docker-compose up -d`
3. Generate the Prisma client: `npx prisma generate`
4. Run migrations: `npx prisma migrate dev`
5. Start the application: `npm start`

## Usage

The application runs on `http://localhost:4000`. You can send GraphQL queries and mutations to this endpoint.

## Resources
- [Pothos](https://pothos-graphql.dev/) - Unused
    - Supports Deno
    - Its supposed to build GraphQL type definitions from the Typescript types generated from our database schema
- [GraphQL Codegen](https://the-guild.dev/graphql/codegen) - Unused
    - Generates TS types from the GraphQL schema & frontend queries
    - Can generate types for the frontend and backend
    - Seems best for SDL-first development. i.e. you write your schema in SDL(`schema.graphql`) and then generate types from that
- [Nexus](https://nexusjs.org/docs/) - **Used**
    - [Nexus-Prisma-Plugin](https://graphql-nexus.github.io/nexus-prisma)
    - Uses code-first approach
    - Nexus is a code-first approach to building GraphQL APIs. It allows you to define your schema in Typescript and then generate the SDL from that.
    - Nexus-Prisma-Plugin is a plugin for Nexus that allows you to generate the Nexus types from your Prisma schema. This means that you can define your database schema in Prisma and then generate the GraphQL schema from that.
    - [GraphQL Nexus - Github](https://github.com/prisma/prisma-examples/tree/latest/typescript/graphql-nexus) - **Reference & Used**
        - [Nexus-Graphql Examples](https://github.com/graphql-nexus/nexus/tree/main/examples)
        - [Using nonNull](https://nexusjs.org/docs/api/list-nonNull#nonnull)
    - alternative [TypeGraphQL-Prisma](https://www.npmjs.com/package/typegraphql-prisma)
- [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server/tutorial/basic/07-connecting-server-and-database) - **Reference**
    - Simply has more resources and examples
    - A fully-featured GraphQL server with focus on easy setup, performance & great developer experience
    - It is built on top of Apollo Server and Express
- [Prisma Blog w/ React](https://www.prisma.io/blog/e2e-type-safety-graphql-react-2-j9mEyHY0Ej) - **Reference**
    - A tutorial on how to use Prisma with React
    - It uses Apollo Client to interact with the GraphQL API
    - It uses Prisma Client to interact with the database
    - It uses GraphQL Codegen to generate types for the frontend
- [Apollo Server - Defining a Schema](https://www.apollographql.com/docs/apollo-server/schema/schema) - **Reference**
    - Apollo Server is an open-source, spec-compliant GraphQL server that's compatible with any GraphQL schema
    - It's the best way to build a production-ready, self-documenting GraphQL API that can use data from any source
    - It's designed to help you build and serve your GraphQL API with little to no configuration

So the entire flow of types across your application will be as follows:
1. Prisma will generate types/api based off of your database schema to interact with database.
2. Pothos will use those types to expose GraphQL types via an API.
3. GraphQL Codegen will read your GraphQL schema and generate types for your frontend codebase representing what is available via the API and how to interact with it.
### Validation
Note other derivatives/alternatives are aviailable. [Custom Validation](https://www.prisma.io/docs/orm/prisma-client/queries/custom-validation)
- [joi validator](https://joi.dev/)
- [prisma-joi-validator](https://github.com/omar-dulaimi/prisma-joi-generator)
## Bugs
GraphQL Cannot return null for non-nullable field User.createdAt.
- This is because a field has a constraint failed. Check the error message for more details as well as your primary keys and `@unique` constraints.
- 1-1 relation is broken. Documentation point to how to use with postgreSQL but not MongoDB. Cannot find any resources on how to fix this. [Stackoverflow issue](https://stackoverflow.com/questions/78038901/prismamongo-cant-delete-model-with-relations-the-change-you-are-trying-to) [Prisma 1-1 relation](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/one-to-one-relations#mongodb)
    - resolving to making 1-1 fields 1-m fields

### mongodb
drop all collections in a database
```sh
db.getCollectionNames().forEach(function(collection) {
   db[collection].drop();
});
```

### Pothos
- File structure is as is due to recommendations from Pothos.
    - The prisma client should not be put into context. [link](https://pothos-graphql.dev/docs/plugins/prisma#:~:text=It%20is%20strongly,Context)
### Nexus
- [intro](https://www.prisma.io/blog/using-graphql-nexus-with-a-database-pmyl3660ncst)
- [Example](https://blog.reilly.dev/building-typesafe-full-stack-app-w-apollo-server-4-railway-prisma-pothos-next-ts-part-1-setting-up-the-server#heading-add-root-mutation-andamp-resolver-for-user-type)
### Prisma
[Prisma Client API reference](https://www.prisma.io/docs/orm/reference/prisma-client-reference#upsert)

## Testing

Run tests with `npm test`.

## Contributing

Please read `CONTRIBUTING.md` for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the `LICENSE.md` file for details.
