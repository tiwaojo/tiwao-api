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

### Validation
Note other derivatives/alternatives are aviailable. [Custom Validation](https://www.prisma.io/docs/orm/prisma-client/queries/custom-validation)
- [joi validator](https://joi.dev/)
- [prisma-joi-validator](https://github.com/omar-dulaimi/prisma-joi-generator)
## Bugs
GraphQL Cannot return null for non-nullable field User.createdAt.
- This is because a field has a constraint failed. Check the error message for more details as well as your primary keys and `@unique` constraints.

## Testing

Run tests with `npm test`.

## Contributing

Please read `CONTRIBUTING.md` for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the `LICENSE.md` file for details.
