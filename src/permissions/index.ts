import { not, rule, shield, allow, deny } from "graphql-shield";
import { GraphQLContext } from "../context";
import { verifyToken } from "../utils";
import { GraphQLError } from "graphql";

const isPromethus = rule()(
  async (parent: GraphQLContext, args, ctx: GraphQLContext) => {

    const user = await verifyToken(ctx);

    if (!user) {
      throw new GraphQLError("User is not authenticated", {
        extensions: {
          code: "UNAUTHENTICATED",
          http: { status: 401 },
        },
      });
    }
    return Boolean(user);
  }
);

// defines the rules of the query and mutation
export default shield(
  {
    Query: {
      getUsers: not(isPromethus),
      getUser: isPromethus,
      getUserByEmail: not(isPromethus),
      getExperiences: not(isPromethus),
      getExperience: not(isPromethus),
      getEducation: isPromethus,
      getSocial: isPromethus,
      getSocials: not(isPromethus),
      getSkills: not(isPromethus),
      getLocations: isPromethus,
    },
    Mutation: {
      "*": deny,
      upsertExperience: isPromethus,
      upsertExperiences: isPromethus,
      deleteExperience: isPromethus,

      upsertEducation: isPromethus,

      upsertSocial: isPromethus,
      deleteSocial: isPromethus,

      updateSkills: isPromethus,

      upsertLocation: isPromethus,

      getUserToken: allow,
    },
  },
  {
    fallbackRule: allow,
    allowExternalErrors: true,
  }
);
