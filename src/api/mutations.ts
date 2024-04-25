import { ExperienceType } from "@prisma/client";
import { AuthPayloadType, builder } from "../builder";
import { prisma } from "../context";
import {
  EducationInput,
  ExperienceInput,
  LocationInput,
  SocialInput,
  UserInput,
} from "../schema/input";
import { APP_SECRET, HASHED_APP_SECRET } from "../utils";
import { sign } from "jsonwebtoken";
import { compare } from "bcryptjs";
import { GraphQLError } from "graphql";

builder.mutationField("createUser", (t) =>
  t.prismaField({
    type: "User",
    args: {
      input: t.arg({
        type: UserInput,
        required: true,
      }),
    },
    resolve: async (query, root, args) => {
      return await prisma.user
        .create({
          data: {
            email: args.input.email,
            firstName: args.input.firstName,
            lastName: args.input.lastName,
            title: args.input.title,
            about: args.input.about,
            experiences: {
              createMany: {
                data: args.input.experiences?.map((exp) => {
                  return {
                    // ...exp,
                    company: exp.company,
                    description: exp.description,
                    imgSrc: exp.imgSrc,
                    role: exp.role,
                    tools: {
                      set: exp.tools,
                    },
                    type: exp.type as ExperienceType,
                    title: exp.title,
                    startDate: new Date(exp.startDate),
                    endDate: new Date(exp.endDate),
                    url: exp.url,
                  };
                }),
              },
            },
            education: {
              create: {
                institution: args.input.education?.institution || "",
                fieldOfStudy: args.input.education?.fieldOfStudy || "",
                startDate: new Date(args.input.education?.startDate as Date),
                endDate: new Date(args.input.education?.endDate as Date),
              },
            },
            socials: {
              createMany: {
                data:
                  args.input.socials?.map((social) => {
                    return {
                      platform: social.platform,
                      url: social.url,
                    };
                  }) || [],
              },
            },
            location: {
              create: {
                city: args.input.location?.city || "",
                province: args.input.location?.province || "",
                country: args.input.location?.country || "",
              },
            },
            skills: {
              set: args.input.skills,
            },
          },
        })
        .catch(() => {
          throw new GraphQLError(`Invalid Input. User may already exist`, {
            extensions: {
              code: "BAD_REQUEST",
              http: { status: 400 },
            },
          });
        });
    },
  })
);

builder.mutationField("deleteUser", (t) =>
  t.string({
    args: {
      id: t.arg.id({
        description: "The user id",
        required: true,
        validate: {
          type: "string",
        },
      }),
    },
    nullable: true,
    resolve: async (root, args) => {
      return await prisma.user
        .delete({
          where: {
            id: String(args.id),
          },
        })
        .then((ret) => {
          return `User ${ret.firstName} ${ret.lastName} has been deleted`;
        })
        .catch(() => {
          throw new GraphQLError(`The requested resource does not exist`, {
            extensions: {
              code: "GONE",
              http: { status: 410 },
            },
          });
        });
    },
  })
);

builder.mutationField("upsertLocation", (t) =>
  t.prismaField({
    type: "Location",
    args: {
      input: t.arg({
        description: "The location to update",
        type: LocationInput,
        required: true,
      }),
      userId: t.arg.id({
        description: "The user assiciated with the location to be updated",
        required: true,
        validate: {
          type: "string",
        },
      }),
    },
    // nullable: true,
    resolve: async (query, root, args) => {
      return await prisma.location.upsert({
        where: {
          id: args.input.id as string,
          userId: args.userId as string,
        },
        update: {
          city: args.input.city,
          province: args.input.province,
          country: args.input.country,
        },
        create: {
          userId: args.userId as string,
          city: args.input.city,
          province: args.input.province,
          country: args.input.country,
        },
      });
    },
  })
);

builder.mutationField("updateSkills", (t) =>
  t.stringList({
    description: "update skills to a user",
    args: {
      skills: t.arg.stringList({
        description: "The users skills to update",
        required: true,
        validate: {
          items: {
            minLength: 2,
            maxLength: 50,
          },
        },
      }),
      userId: t.arg({
        description: "The user id",
        type: "String",
        required: true,
        validate: {
          type: "string",
        },
      }),
      resetSkills: t.arg.boolean({
        description: "Reset the skills",
        defaultValue: false,
        required: false,
      }),
    },
    resolve: async (_, args) => {
      return await prisma.user
        .update({
          where: {
            id: args.userId,
          },
          data: {
            skills: args.resetSkills
              ? { set: args.skills }
              : { push: args.skills },
          },
        })
        .then((ret) => {
          return ret.skills;
        })
        .catch(() => {
          throw new GraphQLError(
            `The desired operation failed or the requested resource does not exist. Please check your arguments`,
            {
              extensions: {
                code: "BAD_REQUEST",
                http: { status: 400 },
              },
            }
          );
        });
    },
  })
);

builder.mutationField("upsertExperiences", (t) =>
  t.prismaField({
    type: ["Experience"],
    description: "Bulk update experiences of a user",
    deprecationReason: "Use upsertExperience instead",
    args: {
      experiences: t.arg({
        description: "The experiences to update",
        required: false,
        type: [ExperienceInput],
      }),
      userId: t.arg({
        description: "The user id",
        type: "String",
        required: true,
        validate: {
          type: "string",
        },
      }),
    },
    resolve: async (_, __, args) => {
      return await prisma.user
        .update({
          where: {
            id: args.userId,
          },
          data: {
            experiences: {
              // connectOrCreate: args.experiences?.map((exp) => {
              //   return {
              //     where: {
              //       id:
              //         args.experienceIds?.map((id) => {
              //           return id as string;
              //         }) || [],
              //       userId: args.userId,
              //       title: exp.title,
              //     },
              //     create: {
              //       ...exp,
              //       userId: args.userId,
              //       title: exp.title,
              //       startDate: new Date(exp.startDate),
              //       endDate: new Date(exp.endDate),
              //       url: exp.url,
              //     },
              //   };
              // }),
              createMany: {
                data:
                  args.experiences?.map((exp) => {
                    return {
                      ...exp,
                      title: exp.title,
                      startDate: new Date(exp.startDate),
                      endDate: new Date(exp.endDate),
                      url: exp.url,
                    };
                  }) || [],
              },
            },
          },
        })
        .catch((err) => {
          console.error("error: ", err.message);
          return err.message;
        });
    },
  })
);

builder.mutationField("upsertExperience", (t) =>
  t.prismaField({
    type: "Experience",
    description: "update experience to a user",
    args: {
      experience: t.arg({
        description: "The experience to update",
        required: true,
        type: ExperienceInput,
      }),
      id: t.arg.id({
        description: "The experience id",
        required: true,
        validate: {
          type: "string",
        },
      }),
    },
    resolve: async (_, __, args) => {
      return await prisma.experience
        .upsert({
          where: {
            userId: args.experience.userId as string,
            id: args.id as string,
          },
          update: {
            ...args.experience,
            userId: args.experience.userId as string,
          },
          create: {
            userId: args.experience.userId as string,
            title: args.experience?.title,
            url: args.experience?.url,
            startDate: new Date(args.experience.startDate),
            endDate: new Date(args.experience.endDate),
            description: args.experience.description,
            imgSrc: args.experience.imgSrc,
            tools: {
              set: args.experience.tools,
            },
            company: args.experience.company,
            role: args.experience.role,
            type: args.experience.type,
          },
        })
        .catch(() => {
          throw new GraphQLError(
            `The desired operation failed or the requested resource does not exist. Please check your arguments`,
            {
              extensions: {
                code: "BAD_REQUEST",
                http: { status: 400 },
              },
            }
          );
        });
    },
  })
);

builder.mutationField("deleteExperience", (t) =>
  t.string({
    args: {
      id: t.arg.id({
        description: "The experience id",
        required: true,
        validate: {
          type: "string",
        },
      }),
    },
    resolve: async (_, args) => {
      return await prisma.experience
        .delete({
          where: {
            id: args.id as string,
          },
        })
        .then((ret) => {
          return `${ret.type} experience of ${ret.title} has been deleted`;
        })
        .catch(() => {
          throw new GraphQLError(
            `The desired operation failed or the requested resource does not exist`,
            {
              extensions: {
                code: "GONE",
                http: { status: 410 },
              },
            }
          );
        });
    },
  })
);

builder.mutationField("upsertEducation", (t) =>
  t.prismaField({
    type: "Education",
    description: "update education to a user",
    args: {
      education: t.arg({
        description: "The education to update",
        required: true,
        type: EducationInput,
      }),
      userId: t.arg.id({
        description: "The user id",
        required: true,
        validate: {
          type: "string",
        },
      }),
    },
    resolve: async (_, __, args) => {
      return await prisma.education
        .upsert({
          where: {
            userId: args.userId as string,
            id: args.education.id as string,
          },
          update: { ...args.education },
          create: {
            userId: args.userId as string,
            institution: args.education?.institution,
            fieldOfStudy: args.education?.fieldOfStudy,
            startDate: new Date(args.education.startDate),
            endDate: new Date(args.education.endDate),
            description: args.education.description,
          },
        })
        .catch(() => {
          throw new GraphQLError(
            `The desired operation failed or the requested resource does not exist. Please check your arguments`,
            {
              extensions: {
                code: "BAD_REQUEST",
                http: { status: 400 },
              },
            }
          );
        });
    },
  })
);

builder.mutationField("upsertSocial", (t) =>
  t.prismaField({
    type: "Social",
    description: "update a single social of a user",
    args: {
      social: t.arg({
        description: "The social to update",
        required: true,
        type: SocialInput,
      }),
      userId: t.arg.id({
        description: "The user id",
        required: true,
        validate: {
          type: "string",
        },
      }),
    },
    resolve: async (_, __, args) => {
      return await prisma.social
        .upsert({
          where: {
            userId: args.userId as string,
            id: args.social.id as string,
          },
          update: { userId: args.userId as string,platform: args.social.platform, url: args.social.url},
          create: {
            userId: args.userId as string,
            platform: args.social.platform,
            url: args.social.url,
          },
        })
        .catch((e) => {
          console.log(e);
          
          throw new GraphQLError(
            `The desired operation failed or the requested resource does not exist. Please check your arguments`,
            {
              extensions: {
                code: "BAD_REQUEST",
                http: { status: 400 },
              },
            }
          );
        });
    },
  })
);

builder.mutationField("deleteSocial", (t) =>
  t.string({
    args: {
      id: t.arg.id({
        description: "The social id",
        required: true,
        validate: {
          type: "string",
        },
      }),
    },
    nullable: true,
    resolve: async (_, args) => {
      return await prisma.social
        .delete({
          where: {
            id: args.id as string,
          },
        })
        .then((ret) => {
          return `${ret.platform} social of ${ret.url} has been deleted`;
        })
        .catch(() => {
          throw new GraphQLError(`The requested resource does not exist`, {
            extensions: {
              code: "GONE",
              http: { status: 410 },
            },
          });
        });
    },
  })
);

// User sends a secret and email to get the user id and set the token.
// if the secret is correct and the email is correct, then return the user id of the admin.
// if the secret is correct and the email is incorrect, then return the user id of the guest.
builder.mutationField("getUserToken", (t) =>
  t.field({
    type: "AuthPayload",
    args: {
      secret: t.arg.id({
        description: "The secret key",
        required: true,
        validate: {
          type: "string",
        },
      }),
      email: t.arg.string({
        description: "The user email",
        validate: {
          type: "string",
        },
      }),
      expiry_date: t.arg({
        type: "DateTime",
        required: false,
      }),
    },
    resolve: async (_, args) => {
      const user = await prisma.user.findUnique({
        where: {
          email: args.email as string,
        },
      });

      // compare the secret key with the APP_SECRET
      const hashedAppSecret = await HASHED_APP_SECRET();

      const isSecretValid = await compare(
        args.secret as string,
        hashedAppSecret
      ); // Compares the hashed secret key with the APP_SECRET
      if (!isSecretValid) {
        throw new Error("Invalid secret key");
      }
      if (!user) {
        throw new Error(`No user found for email: ${args.email}`);
      }
      const today = new Date();

      const expiry_date =
        args.expiry_date || new Date(today.setDate(today.getDate() + 14));

      // Set a header for the token to expire in 14 days
      // ctx.req.headers["set-cookie"]?.push(`token_expiry=${expiry_date}; Expires=${expiry_date}; path=/profile Secure`);
      // ctx.res.setHeader('Set-Cookie', [`token_expiry=${expiry_date}`, `Expires=${expiry_date}`, `Secure`, "SameSite=None"]);
      // ctx.res.setHeader('Set-Cookie', [`token_expiry=${expiry_date}`, `Expires=${expiry_date}`, `path=/profile`, `Secure`, "SameSite=None"]);

      const payload: AuthPayloadType = {
        token: sign({ userId: user.id, email: args.email }, APP_SECRET),
        expiry: expiry_date,
      };
      return payload;
    },
  })
);
