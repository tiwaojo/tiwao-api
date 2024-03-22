import { mutationField, arg, nonNull, idArg, list } from "nexus";
import { UserCreateSchema } from "../../generated/yup-validate/schemas";

export const createUser = mutationField("createUser", {
  type: "User",
  args: {
    user: nonNull(
      arg({
        type: "UserInput",
        description: "The user to create",
      })
    ),
  },
  // async validate(_, args, ctx) {
    // const count = await ctx.prisma.user.findUnique({ where: { email: args.user.email } });
    // if (count) {
    //   throw new Error('email already taken');
    // }
    // await UserCreateSchema.validate(args.user.email, { abortEarly: false, });
    // user: object({
    //   name: string().required(),
    // }).validate({ email: object.email }),
  // },
  resolve: async (_, args, ctx) => {
    // const res=await UserCreateSchema.validate(
    //   // args.user,
    //   {
    //     ...args.user,
    //     email: args.user.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    //     firstName: args.user.firstName,
    //     lastName: args.user.lastName,
    //   },
    //   { abortEarly: false,context: ctx,}
    // );
    console.log("UserCreateSchema.deps", UserCreateSchema.deps);
    // console.log("UserCreateSchema return", res);
    
    return await ctx.prisma.user
      .create({
        data: {
          email: args.user.email,
          firstName: args.user.firstName,
          lastName: args.user.lastName,
          title: args.user.title,
          about: args.user.about,
          experiences: {
            createMany: {
              data: args.user.experiences?.map((exp) => {
                return {
                  ...exp,
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
              institution: args.user.education.institution,
              fieldOfStudy: args.user.education.fieldOfStudy,
              startDate: new Date(args.user.education.startDate),
              endDate: new Date(args.user.education.endDate),
            },
          },
          socials: {
            createMany: {
              data: args.user.socials,
            },
          },
          location: {
            create: {
              city: args.user.location.city ,
              province: args.user.location.province ,
              country: args.user.location.country ,
            },
          },
          skills: {
            set: args.user.skills || [],
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
});

export const deleteUser = mutationField("deleteUser", {
  type: "User",
  args: {
    id: nonNull(
      idArg({
        description: "The deleted user id",
      })
    ),
  },
  resolve: async (_, args, ctx) => {
    return await ctx.prisma.user.delete({
      where: {
        id: args.id,
      },
    });
  },
});

export const updateExperience = mutationField("upsertExperience", {
  type: "Experience",
  description: "update an experience to a user",
  args: {
    experience: nonNull(
      arg({
        type: "ExperienceInput",
        description: "The experience to update",
      })
    ),
  },
  resolve: async (_, args, ctx) => {
    return await ctx.prisma.experience
      .upsert({
        where: {
          userId: args.experience.userId,
          id: args.experience.id || "",
          NOT: [
            {
              AND: [
                {
                  title: args.experience.title,
                },
                {
                  url: args.experience.url,
                },
              ],
            },
          ],
        },
        update: { ...args.experience },
        create: {
          userId: args.experience.userId,
          title: args.experience.title,
          url: args.experience.url,
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
});

export const deleteExpereince = mutationField("deleteExpereince", {
  type: "Experience",
  args: {
    id: nonNull(
      idArg({
        description: "The deleted experience id",
      })
    ),
  },
  resolve: async (_, args, ctx) => {
    return await ctx.prisma.experience.delete({
      where: {
        id: args.id,
      },
    });
  },
});

export const updateEducation = mutationField("upsertEducation", {
  type: "Education",
  description: "update an education to a user",
  args: {
    education: nonNull(
      arg({
        type: "EducationInput",
        description: "The education to update",
      })
    ),
    userId: nonNull(
      idArg({
        description: "The user id",
      })
    ),
  },
  resolve: async (_, args, ctx) => {
    return await ctx.prisma.education
      .upsert({
        where: {
          id: args.education.id || "",
        },
        update: { ...args.education },
        create: {
          userId: args.userId,
          institution: args.education.institution,
          fieldOfStudy: args.education.fieldOfStudy,
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
});

export const updateSocial = mutationField("upsertSocial", {
  type: "Social",
  description: "update a social to a user",
  args: {
    social: nonNull(
      arg({
        type: "SocialInput",
        description: "The social to update",
      })
    ),
    socialId: nonNull(
      idArg({
        description: "The social id",
      })
    ),
  },
  resolve: async (_, args, ctx) => {
    return await ctx.prisma.social
      .upsert({
        where: {
          userId: args.social.userId,
          platform: args.social.platform,
          id: args.socialId || "",
        },
        update: { ...args.social },
        create: {
          userId: args.social.userId,
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
});

export const deleteSocial = mutationField("deleteSocial", {
  type: "Social",
  args: {
    id: nonNull(
      idArg({
        description: "The deleted social id",
      })
    ),
  },
  resolve: async (_, args, ctx) => {
    return await ctx.prisma.social.delete({
      where: {
        id: args.id,
      },
    });
  },
});

export const updateLocation = mutationField("upsertLocation", {
  type: "Location",
  description: "update a location to a user",
  args: {
    location: nonNull(
      arg({
        type: "LocationInput",
        description: "The location to update",
      })
    ),
    userId: nonNull(
      idArg({
        description: "The user id",
      })
    ),
  },
  resolve: async (_, args, ctx) => {
    return await ctx.prisma.location
      .upsert({
        where: {
          userId: args.location.id,
        },
        update: { ...args.location },
        create: {
          userId: args.userId,
          city: args.location.city,
          province: args.location.province,
          country: args.location.country,
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
});

export const updateSkills = mutationField("updateSkills", {
  type: "User",
  description: "update skills to a user",
  args: {
    userId: nonNull(
      idArg({
        description: "The user to update",
      })
    ),
    skills: nonNull(
      list(
        arg({
          type: nonNull("String"),
          description: "The skills to update",
        })
      )
    ),
  },
  resolve: async (_, args, ctx) => {
    return await ctx.prisma.user
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
});
