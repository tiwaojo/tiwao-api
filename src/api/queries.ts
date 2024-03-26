import Zod from "zod";
import { builder } from "../builder";
import { prisma } from "../context";
import { ExperienceType } from "@prisma/client";

builder.queryField("getUsers", (t) =>
  t.prismaField({
    type: ["User"],
    description: "Get all users",
    resolve: async (
      query
      // root,
      // args,
      //  ctx,
      //  info
    ) => {
      return await prisma.user.findMany({ ...query, orderBy: { id: "asc" } });
    },
  })
);

builder.queryField("getUser", (t) =>
  t.prismaField({
    type: "User",
    args: {
      id: t.arg.id({ description: "The id of the user", required: true }),
    },
    nullable: true,
    description: "Get a user by its id",
    resolve: async (query, root, { id }) => {
      return await prisma.user.findUnique({
        ...query,
        where: { id: id as string },
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
  })
);

builder.queryField("getUserByEmail", (t) =>
  t.prismaField({
    type: "User",
    args: {
      email: t.arg.string({
        description: "The email of the user",
        defaultValue: "employ@tiwaojo.com",
        required: true,
        validate: {
          email: true,
        },
      }),
    },
    description: "Get a user by its email",
    nullable: true,
    resolve: async (query, _parent, { email }) => {
      return await prisma.user.findUnique({
        ...query,
        where: { email: email },
        // select: {
        //   experiences: true,
        //   id: true,
        //   email: true,
        //   firstName: true,
        //   lastName: true,
        //   title: true,
        //   about: true,
        //   education: true,
        //   skills: true,
        // },
      });
    },
  })
);

builder.queryField("getExperiences", (t) =>
  t.prismaField({
    type: ["Experience"],
    description: "Get all experiences of a user",
    args: {
      startDate: t.arg({
        // type: "String",
        type: "DateTime",
        description: "The start date of the experience",
        defaultValue: new Date(),
        // defaultValue: new Date("2021-01-01").toISOString(),
        validate: {
          schema: Zod.date({
            invalid_type_error:
              "Invalid date format. Date must be in ISO format",
          }), //.transform(date => date.toISOString()),
        },
      }),
      endDate: t.arg({
        type: "DateTime",
        description: "The end date of the experience",
        defaultValue: new Date(),
        validate: {
          schema: Zod.date({
            invalid_type_error:
              "Invalid date format. Date must be in ISO format",
          }), //.transform(date => date.toISOString()),
        },
      }),
      userId: t.arg.id({
        description: "The user id of the experience",
        required: true,
      }),
      experienceType: t.arg.string({
        description: "The type of the experience",
        defaultValue: "PROJECT",
        validate: {
          schema: Zod.enum(["PROJECT", "WORK"], {
            invalid_type_error:
              "Invalid experience type. Expereince type must be either PROJECT or WORK.",
          }),
        },
      }),
    },
    nullable: true,
    validate: [
      (args) => !!args.experienceType || !!args.startDate || !!args.endDate,
      { message: "Must provide either experience type or start/end date" },
    ],
    resolve: async (
      query,
      _root,
      { startDate, endDate, userId, experienceType }
    ) => {
      return await prisma.experience.findMany({
        ...query,
        where: {
          userId: userId as string,
          OR: [
            { type: experienceType as ExperienceType },
            {
              startDate: {
                gte: new Date(startDate!),
              },
              endDate: {
                lte: new Date(endDate!),
              },
            },
          ],
        },
        orderBy: { startDate: "asc" },
      });
    },
  })
);

builder.queryField("getExperience", (t) =>
  t.prismaField({
    type: "Experience",
    description: "Get an experience by its id",
    args: {
      id: t.arg.id({
        description: "The id of the experience",
        required: true,
      }),
      userId: t.arg.id({
        description: "The user id of the experience",
        required: true,
      }),
    },
    nullable: true,
    // validate: [
    //   (args) => !!args.id || !!args.userId,
    //   { message: "Must provide either phone number or email address" },
    // ],
    resolve: async (query, root, { id, userId }) => {
      return await prisma.experience.findUnique({
        ...query,
        where: { id: id as string, userId: userId as string },
      });
    },
  })
);

builder.queryField("getEducation", (t) =>
  t.prismaField({
    type: "Education",
    description: "Get all education of a user",
    args: {
      userId: t.arg.id({
        description: "The start date of the experience",
        required: true,
      }),
      id: t.arg.id({
        description: "The id of the education",
        required: true,
      }),
    },
    nullable: true,
    resolve: async (query, _root, { userId, id }) => {
      return await prisma.education.findUnique({
        where: { userId: userId as string, id: id as string },
      });
    },
  })
);

builder.queryField("getSocialById", (t) =>
  t.prismaField({
    type: "Social",
    description: "Get all socials of a user",
    deprecationReason: "Use getSocials instead",
    args: {
      userId: t.arg.id({
        description: "The start date of the experience",
        required: true,
      }),
      id: t.arg.id({
        description: "The id of the social",
        required: true,
      }),
    },
    nullable: true,
    resolve: async (query, _root, { userId, id }) => {
      return await prisma.social.findUnique({
        where: { userId: userId as string, id: id as string },
      });
    },
  })
);

builder.queryField("getSocials", (t) =>
  t.prismaField({
    type: ["Social"],
    description: "Get all socials",
    resolve: async (query) => {
      return await prisma.social.findMany({ ...query, orderBy: { id: "asc" } });
    },
  })
);

builder.queryField("getSkills", (t) =>
  t.prismaField({
    type: ["User"],
    description: "Get all skills",
    args: {
      userId: t.arg.id({
        description: "The user id of the skill",
        required: true,
      }),
    },
    resolve: async (query, _, args) => {
      return await prisma.user.findMany({
        ...query,
        where: { id: args.userId as string },
        orderBy: { id: "asc" },
      });
    },
  })
);

builder.queryField("getLocations", (t) =>
  t.prismaField({
    type: ["Location"],
    description: "Get all locations",
    args: {
      userId: t.arg.id({
        description: "The user id of the location",
        required: true,
      }),
    },
    resolve: async (query, _, args) => {
      return await prisma.location.findMany({
        where: { userId: args.userId as string },
        ...query,
        orderBy: { id: "asc" },
      });
    },
  })
);
