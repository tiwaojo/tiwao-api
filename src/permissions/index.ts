import { not, rule, shield, allow, deny } from "graphql-shield";
import { GraphQLContext } from "../context";
import { verifyToken } from "../utils";
import { GraphQLError } from "graphql";

const isPromethus = rule()(async (parent, args, ctx: GraphQLContext) => {
  const user = await verifyToken(ctx);


  if (user) {
    return Boolean(user);
  }

  return new GraphQLError("User is not authenticated", {
    extensions: {
      code: "UNAUTHENTICATED",
      http: { status: 401 },
    },
  });
});

// defines the rules of the query and mutation
export default shield(
  {
    Query: {
      getUsers: isPromethus,
      getUser: isPromethus,
      getUserByEmail: isPromethus,
      getExperiences: allow,
      getExperience: not(isPromethus),
      getEducation: isPromethus,
      getSocial: isPromethus,
      getSocials: allow,
      getSkills: allow,
      getLocation: isPromethus,
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
