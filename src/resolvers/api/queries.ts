import { queryField, idArg, stringArg, nonNull, arg, list } from "nexus";

export const GetUsersQuery = queryField((t) => {
  t.list.field("getUsers", {
    type: "User",
    description: "Get all users",
    resolve: async (_, __, ctx) => {
      return await ctx.prisma.user.findMany({ orderBy: { id: "asc" } });
    },
  });
});

export const GetUserByIdQuery = queryField("getUser", {
  type: "User",
  args: {
    id: nonNull(
      idArg({
        description: "The id of the user",
      })
    ),
  },
  description: "Get a user by its id",
  resolve: async (_parent, { id }, ctx) => {
    return await ctx.prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        title: true,
        about: true,
        education: true,
        skills: true,
      },
    });
  },
});

export const GetUserByEmailQuery = queryField("getUserByEmail", {
  type: "User",
  args: {
    email: stringArg({
      description: "The email of the user",
      default: "employ@tiwaojo.com",
    }),
  },
  description: "Get a user by its email",
  resolve: async (_parent, { email }, ctx) => {
    return await ctx.prisma.user.findUnique({
      where: { email: email },
      select: {
        experiences: true,
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        title: true,
        about: true,
        education: true,
        skills: true,
      },
    });
  },
});

export const GetExperiencesQuery = queryField("getExperiences", {
  type: list("Experience"),
  description: "Get all experiences os a user",
  args: {
    startDate: stringArg({
      description: "The start date of the experience",
    }),
    endDate: stringArg({
      description: "The end date of the experience",
    }),
    userId: nonNull(
      idArg({
        description: "The user id of the experience",
      })
    ),
    experienceType: nonNull(
      arg({
        type: "ExperienceType",
        description: "The type of the experience",
        default: "PROJECT",
      })
    ),
  },
  resolve: async (_parent, _args, ctx) => {
    // NOTE: The resolver returns an array of experiences and therefore the return type identified in the `type` field must be a list("Experience")
    return await ctx.prisma.experience.findMany({
      where: {
        userId: _args.userId,
        OR: [
          { type: _args.experienceType },
          {
            startDate: {
              gte: new Date(_args.startDate?.toString()),
            },
            endDate: {
              lte: new Date(_args.endDate?.toString()),
            },
          },
        ],
      },
      orderBy: { startDate: "asc" },
    });
  },
});

export const GetExperienceByIdQuery = queryField("getExperience", {
  type: list("Experience"),
  args: {
    id: idArg({
      description: "The id of the experience",
    }),
    userId: idArg({
      description: "The user id of the experience",
    }),
  },
  description: "Get an experience by its id",
  resolve: async (_parent, { id, userId }, ctx) => {
    return await ctx.prisma.experience.findMany({
      where: { id: id, userId: userId },
    });
  },
});

export const GetEducationQuery = queryField("getEducationById", {
  type: list("Education"),
  description: "Get all education of a user",
  args: {
    userId: nonNull(
      idArg({
        description: "The start date of the experience",
      })
    ),
    id: nonNull(
      idArg({
        description: "The id of the education",
      })
    ),
  },
  resolve: async (_parent, _args, ctx) => {
    return await ctx.prisma.education.findMany({
      where: { userId: _args.userId, id: _args.id },
    });
  },
});

export const GetSocialsByIdQuery = queryField("getSocialsById", {
  type: list("Social"),
  description: "Get all socials of a user",
  args: {
    userId: nonNull(
      idArg({
        description: "The start date of the experience",
      })
    ),
  },
  resolve: async (_parent, _args, ctx) => {
    return await ctx.prisma.social.findMany({
      where: { userId: _args.userId },
    });
  },
});

export const GetSocialsQuery = queryField("getSocials", {
  type: list("Social"),
  description: "Get all socials",
  resolve: async (_, __, ctx) => {
    return await ctx.prisma.social.findMany({ orderBy: { id: "asc" } });
  },
});