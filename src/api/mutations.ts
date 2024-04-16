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

builder.mutationField("createUser", (t) =>
  t.prismaField({
    // typeOptions: {
    //   name: "UserInput",
    //   definition: {
    //     firstName: t.arg.string(),
    //     lastName: t.arg.string(),
    //     title: t.arg.string(),
    //     email: t.arg.string(),
    //     about: t.arg.string(),
    //     skills: t.arg.stringList(),
    //     location: t.arg.listRef(""),
    //   },
    // },
    type: "User",
    // authz: {
    // rules: {
    //   canCreateUser: ({ ctx }) => {
    //     return ctx.ctx.user?.role === "ADMIN";
    //   },
    // },
    // },
    args: {
      input: t.arg({
        type: UserInput,
        required: true,
        // validate: {
        //   email: Zod.string().email(),
        //   firstName: Zod.string().min(2),
        //   lastName: Zod.string().min(2),
        //   title: Zod.string().min(2),
        //   about: Zod.string().max(224),
        //   experiences: Zod.array(
        //     Zod.object({
        //       title: Zod.string(),
        //       startDate: Zod.string(),
        //       endDate: Zod.string(),
        //       url: Zod.string(),
        //       description: Zod.string(),
        //       imgSrc: Zod.string(),
        //       tools: Zod.array(Zod.string()),
        //       company: Zod.string(),
        //       role: Zod.string(),
        //       type: Zod.enum(["WORK", "EDUCATION"]),
        //     })
        //   ),
        //   education: Zod.object({
        //     institution: Zod.string(),
        //     fieldOfStudy: Zod.string(),
        //     startDate: Zod.string(),
        //     endDate: Zod.string(),
        //     description: Zod.string(),
        //   }),
        // },
      }),
    },
    resolve: async (query, root, args) => {
      return await prisma.user.create({
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
      });
    },
  })
);

builder.mutationField("deleteUser", (t) =>
  t.prismaField({
    type: "User",
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
    resolve: async (root, __, args) => {
      return await prisma.user
        .delete({
          where: {
            // ...root,
            id: String(args.id),
          },
        })
        .then((ret) => {
          console.log(ret);
        })
        .catch((err) => {
          console.error("error: ", err.message);
          return err.message;
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
      userId: t.arg({
        description: "The user id",
        type: "String",
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
          id: (args.input.id as string) || "",
        },
        update: {
          city: args.input.city || "",
          province: args.input.province || "",
          country: args.input.country || "",
        },
        create: {
          userId: args.userId,
          city: args.input.city || "",
          province: args.input.province || "",
          country: args.input.country || "",
        },
      });
    },
  })
);

builder.mutationField("updateSkills", (t) =>
  t.prismaField({
    type: "User",
    description: "update skills to a user",
    args: {
      skills: t.arg.stringList({
        description: "The location to update",
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
    },
    resolve: async (_, __, args) => {
      return await prisma.user
        .update({
          where: {
            id: args.userId,
          },
          data: {
            skills: {
              set: args.skills,
            },
          },
        })
        .then((ret) => {
          console.log(ret);
        })
        .catch((err) => {
          console.error("error: ", err.message);
          return err.message;
        });
    },
  })
);

builder.mutationField("upsertExperiences", (t) =>
  t.prismaField({
    type: ["Experience"],
    description: "update experiences of a user",
    deprecationReason: "Use upsertExperience instead",
    args: {
      experiences: t.arg({
        description: "The experiences to update",
        required: false,
        type: [ExperienceInput],
        // validate: {
        //   items: {
        //     minLength: 2,
        //     maxLength: 50,
        //   },
        // },
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
            // id: args.experiences.map,
          },
          data: {
            experiences: {
              // connectOrCreate: args.experiences?.map((exp) => {
              //   return {
              //     where: {
              //       id: exp.id as string || "",
              //       userId: args.userId,
              //       title: exp.title,
              //     },
              //     create: {
              //       ...exp,
              //       // id: exp.id,
              //       // id: exp.id as string || "",
              //       userId: args.userId,
              //       title: exp.title,
              //       startDate: new Date(exp.startDate),
              //       endDate: new Date(exp.endDate),
              //       url: exp.url,
              //     },
              //   };
              // }) ,
              createMany: {
                data:
                  args.experiences?.map((exp) => {
                    return {
                      ...exp,
                      // company: exp.company || "",
                      // description: exp.description || "",
                      // imgSrc: exp.imgSrc ,
                      // role: exp.role,
                      // tools: {
                      //   set: exp.tools || [],
                      // },
                      // type: exp.type,
                      // id: String(exp.id),
                      // userId: exp.userId,
                      title: exp.title,
                      startDate: new Date(exp.startDate),
                      endDate: new Date(exp.endDate),
                      url: exp.url,
                      id: (exp.id as string) || "",
                    };
                  }) || [],
                // ...args.experiences,
                // id: exp.id,
                // id: exp.id as string || "",
                // userId: args.userId,
                // title: exp.title,
                // startDate: new Date(exp.startDate),
                // endDate: new Date(exp.endDate),
                // url: exp.url,
              },
              // },
              // where: {
              //   id: (args.experiences?.map((exp)=> {
              //     return exp.id
              //   })),
              //   userId: args.userId,
              // },
              // create: {
              //   // ...args.experiences,
              //   // userId: args.userId,
              //   title: args.experiences?.title || "",
              //   url: args.experiences?.url || "",
              //   startDate: new Date(args.experiences?.startDate as Date),
              //   endDate: new Date(args.experiences?.endDate as Date),
              //   description: args.experiences?.description,
              //   imgSrc: args.experiences?.imgSrc,
              //   tools: {
              //     set: args.experiences?.tools || [],
              //   },
              //   company: args.experiences?.company,
              //   role: args.experiences?.role,
              //   type: args.experiences?.type,
              // },
            },
          },
        })
        .then((ret) => {
          console.log(ret);
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
        // validate: {
        //   items: {
        //     minLength: 2,
        //     maxLength: 50,
        //   },
        // },
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
    // nullable: true,
    resolve: async (_, __, args) => {
      return await prisma.experience
        .upsert({
          where: {
            userId: args.userId,
            id: (args.experience.id as string) || "",
            // NOT: [
            //   {
            //     AND: [
            //       {
            //         title: args.experience.title,
            //       },
            //       {
            //         url: args.experience.url,
            //       },
            //     ],
            //   },
            // ],
          },
          update: { ...args.experience, userId: args.userId },
          create: {
            userId: args.userId,
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
        .then((ret) => {
          console.log(ret);
        })
        .catch((err) => {
          console.error("error: ", err.message);
          return err.message;
        });
    },
  })
);

builder.mutationField("deleteExperience", (t) =>
  t.prismaField({
    type: "Experience",
    args: {
      id: t.arg.id({
        description: "The experience id",
        required: true,
        validate: {
          type: "string",
        },
      }),
    },
    resolve: async (_, __, args) => {
      return await prisma.experience.delete({
        where: {
          id: args.id as string,
        },
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
        // validate: {
        //   items: {
        //     minLength: 2,
        //     maxLength: 50,
        //   },
        // },
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
    // nullable: true,
    resolve: async (_, __, args) => {
      return await prisma.education
        .upsert({
          where: {
            userId: args.userId,
            id: (args.education.id as string) || "",
            // NOT: [
            //   {
            //     AND: [
            //       {
            //         title: args.experience.title,
            //       },
            //       {
            //         url: args.experience.url,
            //       },
            //     ],
            //   },
            // ],
          },
          update: { ...args.education },
          create: {
            userId: args.userId,
            institution: args.education?.institution,
            fieldOfStudy: args.education?.fieldOfStudy,
            startDate: new Date(args.education.startDate),
            endDate: new Date(args.education.endDate),
            description: args.education.description,
          },
        })
        .then((ret) => {
          console.log(ret);
        })
        .catch((err) => {
          console.error("error: ", err.message);
          return err.message;
        });
    },
  })
);

// builder.mutationField("deleteEducation", (t) =>
//   t.prismaField({
//     type: "Education",
//     args: {
//       id: t.arg.string({
//         description: "The education id",
//         required: true,
//         validate: {
//           type: "string",
//         },
//       }),
//     },
//     resolve: async (_, __, args) => {
//       return await prisma.education.delete({
//         where: {
//           id: args.id,
//         },
//       });
//     },
//   })
// );

builder.mutationField("upsertSocial", (t) =>
  t.prismaField({
    type: "Social",
    description: "update social to a user",
    args: {
      social: t.arg({
        description: "The social to update",
        required: true,
        type: SocialInput,
        // validate: {
        //   items: {
        //     minLength: 2,
        //     maxLength: 50,
        //   },
        // },
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
    // nullable: true,
    resolve: async (_, __, args) => {
      return await prisma.social
        .upsert({
          where: {
            userId: args.userId,
            platform: args.social.platform,
            id: (args.social.id as string) || "",
            // NOT: [
            //   {
            //     AND: [
            //       {
            //         title: args.experience.title,
            //       },
            //       {
            //         url: args.experience.url,
            //       },
            //     ],
            //   },
            // ],
          },
          update: { ...args.social, userId: args.userId },
          create: {
            userId: args.userId,
            platform: args.social.platform,
            url: args.social.url,
          },
        })
        .then((ret) => {
          console.log(ret);
        })
        .catch((err) => {
          console.error("error: ", err.message);
          return err.message;
        });
    },
  })
);

builder.mutationField("deleteSocial", (t) =>
  t.prismaField({
    type: "Social",
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
    resolve: async (_, __, args) => {
      return await prisma.social
        .delete({
          where: {
            id: args.id as string,
          },
        })
        .then((ret) => {
          console.log(ret);
        })
        .catch((err) => {
          console.error("error: ", err.message);
          return err.message;
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
      id: t.arg.id({
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
    },
    resolve: async (_, args) => {
      const user = await prisma.user.findUnique({
        where: {
          email: args.email as string,
        },
      });

      // compare the secret key with the APP_SECRET
      const hashedAppSecret = await HASHED_APP_SECRET();
      
      const isSecretValid = await compare(args.id as string, hashedAppSecret); // Compares the hashed secret key with the APP_SECRET
      if (!isSecretValid) {
        throw new Error("Invalid secret key");
      }      
      if (!user) {
        throw new Error(`No user found for email: ${args.email}`);
      }

      const payload: AuthPayloadType = {
        token: sign({ userId: user.id, email: args.email }, APP_SECRET),
        user: user.id ,
      };
      return payload;
    },
  })
);
