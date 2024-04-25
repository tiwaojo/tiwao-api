import { builder } from "../builder";
import { ExperienceEnumType } from "./types";
import Zod from "zod";

export const UserInput = builder.inputType("UserInput", {
  fields: (t) => ({
    firstName: t.string({
      description: "The first name of the user",
      required: true,
      validate: {
        minLength: 2,
        maxLength: 50,
      },
    }),
    lastName: t.string({
      description: "The last name of the user",
      required: true,
      validate: {
        minLength: 2,
        maxLength: 50,
      },
    }),
    title: t.string({
      description: "The title of the user",
      required: true,
      validate: {
        minLength: 2,
        maxLength: 255,
      },
    }),
    email: t.string({
      description: "The email of the user",
      required: true,
      validate: {
        email: true,
      },
    }),
    about: t.string({
      validate: {
        minLength: 2,
        maxLength: 50,
      },
    }),
    socials: t.field({
      type: [SocialInput],
      description: "The socials of the user",
    }),
    location: t.field({
      type: LocationInput,
      description: "The location of the user",
      required: false,
    }),
    skills: t.stringList({
      validate: {
        items: {
          minLength: 2,
          maxLength: 50,
        },
      },
      required: true,
      description: "The skills of the user",
    }),
    education: t.field({
      type: EducationInput,
      description: "The education of the user",
    }),
    experiences: t.field({
      type: [ExperienceInput],
      required: true,
      description: "The experiences of the user",
    }),
  }),
});

export const SocialInput = builder.inputType("SocialInput", {
  fields: (t) => ({
    id: t.id({
      description: "The id of the social platform object",
      validate: { type: "string" },
    }),
    platform: t.field({
      type: "String",
      description: "The social platform the user is present on",
      required: true,
      validate: {
        maxLength: 255,
      },
    }),
    url: t.field({
      type: "String",
      required: true,
      description: "The url of the social platform",
      validate: {
        maxLength: 255,
        url: true,
      },
    }),
  }),
});

export const EducationInput = builder.inputType("EducationInput", {
  fields: (t) => ({
    id: t.id({ description: "" }),
    institution: t.string({
      description: "The institution of the education",
      required: true,
      validate: {
        minLength: 2,
        maxLength: 255,
      },
    }),
    fieldOfStudy: t.string({
      description: "The field of study of the education",
      required: true,
      validate: {
        minLength: 2,
        maxLength: 255,
      },
    }),
    startDate: t.field({
      description: "The start date of the education",
      type: "DateTime",
      required: true,
      validate: {
        schema: Zod.date({
          invalid_type_error: "Invalid date format. Date must be in ISO format",
        }), 
      },
    }),
    endDate: t.field({
      description: "The end date of the education",
      type: "DateTime",
      required: true,
      validate: {
        schema: Zod.date({
          invalid_type_error: "Invalid date format. Date must be in ISO format",
        }), 
      },
    }),
    description: t.field({
      type: "String",
      description: "The description of the education",
      required: false,
      validate: {
        maxLength: 255,
      },
    }),
  }),
});

export const ExperienceInput = builder.inputType("ExperienceInput", {
  fields: (t) => ({
    type: t.field({
      required: true,
      type: ExperienceEnumType,
      defaultValue: "PROJECT",
      description: "The type of the experience. Can be either WORK or PROJECT",
    }),
    title: t.field({
      type: "String",
      required: true,
      description: "The title of the experience",
      validate: {
        minLength: 2,
        maxLength: 255,
      },
    }),
    startDate: t.field({
      description: "The start date of the experience",
      type: "DateTime",
      required: true,
      validate: {
        schema: Zod.date({
          invalid_type_error: "Invalid date format. Date must be in ISO format",
        }), 
      },
    }),
    endDate: t.field({
      description: "The end date of the experience",
      type: "DateTime",
      required: true,
      validate: {
        schema: Zod.date({
          invalid_type_error: "Invalid date format. Date must be in ISO format",
        }),
      },
    }),
    description: t.field({
      type: "String",
      description: "The description of the experience",
      required: false,
      validate: {
        maxLength: 255,
      },
    }),
    url: t.field({
      type: "String",
      description: "The web url of where the experience documenting the experience can be found. Applies to PROJECT experience only",
      required: true,
      validate: {
        maxLength: 255,
        url: true,
      },
    }),
    imgSrc: t.field({
      type: "String",
      description: "The image url of the experience",
      required: false,
      validate: {
        maxLength: 255,
        url: true,
      },
    }),
    tools: t.stringList({
      validate: {
        items: {
          minLength: 2,
          maxLength: 50,
        },
      },
      description: "The tools used to achieve the experience",
      required: true,
    }),
    company: t.field({
      type: "String",
      description:
        "The company of the experience. Applies to WORK experience only",
      required: false,
      validate: {
        maxLength: 50,
        // refine: (value) => {          
        //   if (value && !["WORK"].includes(ExperienceEnumType.$inferInput)) {
        //     console.error("Company is only required for WORK experience");
        //     return false;
        //   }
        //   return true;
        // },
      },
    }),
    role: t.field({
      type: "String",
      description:
        "The role of the experience. Applies to WORK experience only",
      required: false,
      validate: {
        minLength: 2,
        maxLength: 50,
        // refine: (value) => {
        //   if (value && !["WORK"].includes(ExperienceEnumType.kind)) {
        //     console.error("Role is only required for WORK experience");
        //     return false;
        //   }
        //   return true;
        // },
      },
    }),
    userId: t.field({
      type: "ID",
    }),
  }),
});

export const LocationInput = builder.inputType("LocationInput", {
  fields: (t) => ({
    id: t.id({ description: "", }),
    city: t.field({
      type: "String",
      required: true,
      validate: {
        minLength: 2,
        maxLength: 50,
      },
    }),
    province: t.field({
      type: "String",
      required: true,
      validate: {
        minLength: 2,
        maxLength: 50,
      },
    }),
    country: t.field({
      type: "String",
      required: true,
      validate: {
        minLength: 2,
        maxLength: 50,
      },
    }),
  }),
});
