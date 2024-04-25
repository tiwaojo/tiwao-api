import Zod from "zod";
import { builder } from "../builder";
import { prisma } from "../context";
import { ExperienceType } from "@prisma/client";
import { GraphQLError } from "graphql";
import { cacheControlFromInfo } from '@apollo/cache-control-types';

builder.queryField("getUsers", (t) =>
  t.prismaField({
    type: ["User"],
    description: "Get all users",
    // authz: {
    //   rules: ["isPromethus"]
    // },
    resolve: async (query,_,__,___,info) => {
      const cacheControl = cacheControlFromInfo(info)
      cacheControl.setCacheHint({ maxAge: 60, scope: 'PRIVATE' });
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
        validate: {
          type: "string",
        },
        required: false,
      }),
      userId: t.arg.id({
        description: "The user id of the experience",
        required: true,
      }),
    },
    nullable: true,
    // validate: [
    //   (args) => !!args.id || !!args.userId,
    //   { message: "Must provide either userId or id" },
    // ],
    resolve: async (query, root, { userId, id }) => {
      return await prisma.experience
        .findFirst({
          ...query,
          where: {
            userId: userId as string,
            id: id as string,
          },
        })
        .catch(() => {
          throw new GraphQLError(
            `The requested resource was not found. Please check your arguments`,
            {
              extensions: {
                code: "NOT_FOUND",
                http: { status: 404 },
              },
            }
          );
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
        validate: {
          type: "string",
        },
      }),
    },
    nullable: true,
    resolve: async (query, _root, { userId }) => {
      return await prisma.education
        .findUnique({
          where: { userId: userId as string },
        })
        .catch(() => {
          throw new GraphQLError(
            `User is not authenticated or invalid argument`,
            {
              extensions: {
                code: "Bad Request",
                http: { status: 400 },
              },
            }
          );
        });
    },
  })
);

builder.queryField("getSocial", (t) =>
  t.prismaField({
    type: "Social",
    description: "Get single social of a user",
    deprecationReason: "Use getSocials instead",
    args: {
      id: t.arg.id({
        description: "The id of the social",
        required: true,
      }),
      userId: t.arg.id({
        description: "The user id associated with the social",
        required: true,
      }),
    },
    nullable: true,
    resolve: async (query, _root, { id, userId }) => {
      return await prisma.social
        .findFirst({
          where: {
            id: id as string,
            userId: userId as string,
          },
        })
        .catch(() => {
          throw new GraphQLError(
            `The requested resource has been deprecated. Please use getSocials instead.`,
            {
              extensions: {
                code: "NOT_FOUND",
                http: { status: 404 },
              },
            }
          );
        });
    },
  })
);

builder.queryField("getSocials", (t) =>
  t.prismaField({
    type: ["Social"],
    description: "Get all socials",
    args: {
      userId: t.arg.id({
        description: "The user id of the social",
        required: true,
      }),
      platform: t.arg.string({
        description: "The platform of the social",
        required: false,
      }),
      url: t.arg.string({
        description: "The url of the social",
        required: false,
      }),
    },
    resolve: async (query, _, args) => {
      return await prisma.social.findMany({
        ...query,
        where: {
          userId: args.userId as string,
          OR: [
            {
              platform: {
                equals: args.platform as string,
              },
            },
            {
              url: {
                contains: args.url as string,
              },
            },
          ],
        },
        orderBy: { id: "asc" },
      });
    },
  })
);

builder.queryField(
  "getSkills",
  (t) =>
    t.stringList({
      description: "Get all skills",
      args: {
        userId: t.arg.id({
          description: "The user id of the skill",
          required: true,
        }),
      },
      resolve: async (query, { userId }) => {
        return await prisma.user
          .findUnique({
            ...query,
            where: { id: userId as string },
            // orderBy: { id: "asc" },
            // select: {
            //   skills: true,
            // },
          })
          .then((skills) => {
            return skills?.skills || [];
          });
      },
    })
  // t.prismaField({
  //   type: ["String"],
  //   description: "Get all skills",
  //   args: {
  //     userId: t.arg.id({
  //       description: "The user id of the skill",
  //       required: true,
  //     }),
  //   },
  //   resolve: async (query, _, args) => {
  //     return await prisma.user.findMany({
  //       ...query,
  //       where: { id: args.userId as string },
  //       orderBy: { id: "asc" },
  //       select: {
  //         skills: true,
  //     }});
  //   },
  // })
);

builder.queryField("getLocation", (t) =>
  t.prismaField({
    type: "Location",
    description: "Get all locations",
    args: {
      userId: t.arg.id({
        description: "The user id of the location",
        required: true,
      }),
      city: t.arg.string({
        description: "The city of the location",
        required: false,
      }),
      country: t.arg.string({
        description: "The country of the location",
        required: false,
      }),
      id: t.arg.id({
        description: "The user id of the location",
        required: false,
      }),
    },
    nullable: true,
    resolve: async (query, _, args) => {
      return await prisma.location
        .findFirst({
          ...query,
          where: {
            userId: args.userId as string,
            OR: [
              { id: args.id as string },
              { city: args.city as string },
              { country: args.country as string },
            ],
          },
        })
        .catch(() => {
          throw new GraphQLError(
            `The requested resource was not found. Please check your arguments`,
            {
              extensions: {
                code: "NOT_FOUND",
                http: { status: 404 },
              },
            }
          );
        });
    },
  })
);
