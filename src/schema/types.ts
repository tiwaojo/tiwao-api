import { builder } from "../builder";

export const UserType = builder.prismaObject("User", {
  findUnique: (User) => ({
    id: User.id,
  }),
  fields: (t) => ({
    id: t.exposeID("id"),
    firstName: t.exposeString("firstName"),
    lastName: t.exposeString("lastName"),
    title: t.exposeString("title"),
    email: t.exposeString("email"),
    about: t.exposeString("about", { nullable: true }),
    location: t.relation("location", { nullable: true }),
    socials: t.relation("socials"),
    skills: t.exposeStringList("skills"),
    education: t.relation("education", { nullable: true }),
    experiences: t.relation("experiences", {
      args: {},
      query() {
        return {
          orderBy: {
            startDate: "desc",
          },
        };
      },
    }),
  }),
});

export const ExperienceType = builder.prismaObject("Experience", {
  fields: (t) => ({
    id: t.exposeID("id"),
    type: t.exposeString("type"),
    title: t.exposeString("title"),
    startDate: t.expose("startDate", {
      type: "DateTime",
      nullable: false,
    }),
    endDate: t.expose("endDate", {
      type: "DateTime",
      nullable: false,
    }),
    description: t.exposeString("description", {
      nullable: true,
    }),
    url: t.exposeString("url"),
    imgSrc: t.exposeString("imgSrc", { nullable: true }),
    tools: t.exposeStringList("tools"),
    company: t.exposeString("company", {
      nullable: true,
      // validate: {
      //   refine: (val) => {
      //     if (val && !["WORK"].includes(ExperienceEnumType.kind)) {
      //       console.error("Company is only required for WORK experience");
      //       return false;
      //     }
      //     return true;
      //   },
      // },
    }),
    role: t.exposeString("role", {
      nullable: true,
      // validate: {
      //   refine: (val) => {
      //     if (val && !["WORK"].includes(ExperienceEnumType.kind)) {
      //       console.error("Company is only required for WORK experience");
      //       return false;
      //     }
      //     return true;
      //   },
      // },
    }),
  }),
});

export const EducationType = builder.prismaObject("Education", {
  findUnique: (Education) => ({ id: Education.id }),
  fields: (t) => ({
    id: t.exposeID("id"),
    institution: t.exposeString("institution"),
    fieldOfStudy: t.exposeString("fieldOfStudy"),
    startDate: t.expose("startDate", {
      type: "DateTime",
      nullable: false,
    }),
    endDate: t.expose("endDate", {
      type: "DateTime",
      nullable: false,
    }),
    description: t.exposeString("description", { nullable: true }),
  }),
});

export const SocialType = builder.prismaObject("Social", {
  description: "Social media links",
  fields: (t) => ({
    id: t.exposeID("id"),
    platform: t.exposeString("platform"),
    url: t.exposeString("url"),
  }),
});

export const Locationtype = builder.prismaObject("Location", {
  // findUnique: (Location) => Location.id,
  fields: (t) => ({
    id: t.exposeID("id"),
    city: t.exposeString("city"),
    province: t.exposeString("province"),
    country: t.exposeString("country"),
  }),
});

export const ExperienceEnumType = builder.enumType("ExperienceTypeEnum", {
  values: {
    WORK: {
      description: "Work experience",
      value: "WORK",
    },
    PROJECT: {
      description: "Project experience",
      value: "PROJECT",
    },
  } as const, // so the values can be inferred
});

// export const Mutation = builder.mutationType({
//   fields: (t) => ({
//     signupUser: t.field({
//       type: AuthPayload,
//       args: {
//         data: t.arg({
//           type: builder.inputType("SignupInput", {
//             fields: (t) => ({
//               firstName: t.string(),
//               lastName: t.string(),
//               email: t.string(),
//               password: t.string(),
//             }),
//           }),
//         }),
//       },
//       resolve: async (_parent, { data }, { prisma }) => {
//         const user = await prisma.user.create({
//           data: {
//             firstName: data.firstName,
//             lastName: data.lastName,
//             email: data.email,
//             password: data.password,
//           },
//         });
//         return {
//           token: "token",
//           user,
//         };
//       },
//     }),
//   }),
// });

// Resourse: https://pothos-graphql.dev/docs/guide/objects

builder.objectType("AuthPayload", {  
  fields: (t) => ({
    token: t.exposeString("token",{
      // resolve: (parent) => parent.token,
    }),
    userId: t.field({
      type: "ID",
      resolve: (parent) =>parent.user.id,
    }),
  }),
});