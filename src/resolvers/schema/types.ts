import {
  User,
  Experience,
  Education,
  Social,
  Location,
  ExperienceType as ExperienceTypeEnum,
} from "nexus-prisma";
import { objectType, enumType } from "nexus";

// NOTE: The following types are used to generate your GraphQL schema types AND to generate the TypeScript types for your resolvers.
// the models in `prisma/schema.prisma` must match the types in `src/resolvers/schema_types.ts`(this file)
// If you want to add a new field to the User type, you need to add it to the User type in the schema AND to the User type in the resolvers.

export const UserType = objectType({
  name: User.$name,
  description: User.$description,
  definition(t) {
    // t.id("id");
    t.field(User.id);
    t.nonNull.field("firstName", {
      type: "String",
      description: User.firstName.description,
    }); // You can also add a resolver to a field
    t.nonNull.field(User.lastName);
    t.nonNull.field(User.title);
    t.nonNull.field(User.email);
    t.field(User.about);
    t.field(User.location);
    t.nonNull.field(User.socials);
    t.nonNull.list.field("skills", {
      type: "String",
      description: User.skills.description,
    });
    t.field(User.education);
    t.nonNull.field(User.experiences);
    // t.nonNull.list.nonNull.field("experiences", {
    //   type: "Experience",
    //   description: User.experiences.description,
    //   resolve: async (parent, _args, ctx) => {
    //     // returns all experiences of a user
    //     return await ctx.prisma.user.findUnique({
    //       where: { id: parent.id }, // trust me the id is not null
    //     }).experiences();
    //   },
    // });
  },
});

export const ExperienceType = objectType({
  name: Experience.$name,
  description: Experience.$description,
  definition(t) {
    t.nonNull.field(Experience.id);
    t.nonNull.field(Experience.type);
    // t.field("type", {
    //   type: ExperienceTypeEnumType,
    //   resolve: async (parent, _args, ctx) => {
    //     // returns the type of an experience
    //     return ["WORK", "PROJECT"].filter(e=>{
    //       // return e === parent.type;
    //       return !
    //     });
    //   },
      
    //   description: ExperienceTypeEnum.description,
    // });
    t.nonNull.field(Experience.title);
    t.nonNull.dateTime("startDate", {
      description: Experience.startDate.description,
    });
    t.nonNull.dateTime("endDate", {
      description: Experience.endDate.description,
    });
    // t.nonNull.field(Experience.startDate);
    // t.nonNull.field(Experience.endDate);
    t.nullable.field(Experience.description);
    t.nonNull.field(Experience.url);
    t.nullable.field(Experience.imgSrc);
    t.field(Experience.tools);
    t.nullable.field(Experience.company);
    // t.field("company", {
    //   type: Experience.company.type,
    //   resolve: async (parent, _args, ctx) => {
    //     // returns the company of an experience
    //     return await ctx.prisma.experience
    //       .findUnique({ where: { id: parent.id! } })
    //       .company();
    //   },
    // });
    t.nullable.field(Experience.role);
    t.nonNull.field(Experience.user);
    // t.nonNull.field("user", {
    //   type: "User",
    //   resolve: async (parent, _args, ctx) => {
    //     // returns the user of an experience
    //     return await ctx.prisma.experience
    //       .findUnique({ where: { id: parent.id! } })
    //       .user();
    //   },
    // });
    t.field(Experience.userId);
    // t.nonNull.field('userId', {
    //   type: 'ID',
    //   resolve: (parent) => {
    //     // return the userId from the parent object, or use the ctx (context) to fetch it
    //     return parent.id;
    //   },
    // });
  },
});

export const EducationType = objectType({
  name: Education.$name,
  description: Education.$description,
  definition(t) {
    t.nonNull.field(Education.id);
    t.nonNull.field(Education.institution);  
    t.nonNull.field(Education.fieldOfStudy);
    t.nonNull.dateTime("startDate",{
      description: Education.startDate.description,
    });
    t.nonNull.dateTime("endDate",{
      description: Education.endDate.description,
    });
    t.nullable.field(Education.description);
    t.field(Education.user);
    // t.nonNull.field("user", {
    //   type: "User",
    //   resolve: async (parent, _args, ctx) => {
    //     // returns the user of an experience
    //     return await ctx.prisma.experience
    //       .findUnique({ where: { id: parent.id! } })
    //       .user();
    //   },
    // });
    // t.field(Experience.userId);
    t.nonNull.field('userId', {
      type: 'ID',
      resolve: (parent) => {
        // return the userId from the parent object, or use the ctx (context) to fetch it
        return parent.id;
      },
    });

  },
});

export const SocialType = objectType({
  name: Social.$name,
  description: Social.$description,
  definition(t) {
    t.nonNull.field(Social.id);
    t.nonNull.field(Social.platform);
    t.nonNull.field(Social.url);
    t.field(Social.user);
    // t.nonNull.field("user", {
    //   type: "User",
    //   resolve: async (parent, _args, ctx) => {
    //     // returns the user of an experience
    //     return await ctx.prisma.experience
    //       .findUnique({ where: { id: parent.id! } })
    //       .user();
    //   },
    // });
    t.field(Social.userId);
  },
});

export const LocationType = objectType({
  name: Location.$name,
  description: Location.$description,
  definition(t) {
    t.field(Location.id);
    t.field(Location.city);
    t.field(Location.province);
    t.field(Location.country);
  },
});

// export const SkillsType = objectType({
//   name: "Skills",
//   description: "The skills of a user",
//   definition(t) {
//     t.list.field("skills", {
//       type: "String",
//       description: "The skills of a user",
//     });
//   },
// });

export const ExperienceTypeEnumType = enumType(ExperienceTypeEnum);
// export const ExperienceTypeEnumType = enumType({
//   name: ExperienceTypeEnum.name,
//   description: ExperienceTypeEnum.description,
//   // members: ExperienceTypeEnum.members,
//   members: ["WORK", "PROJECT"]
// });
