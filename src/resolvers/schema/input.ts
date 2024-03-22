import { Education, Experience, Location, Social, User } from "nexus-prisma";
import { inputObjectType } from "nexus";
import { ExperienceTypeEnumType } from "./types";

export const UserInputType = inputObjectType({
  name: User.$name + "Input",
  description: User.$description,
  definition(t) {
    t.nonNull.field(User.firstName);
    t.nonNull.field(User.lastName);
    t.nonNull.field(User.title);
    t.nonNull.field(User.email);
    t.field(User.skills);
    t.nullable.field(User.about);
    t.nullable.list.nonNull.field("skills", {
      type: "String",
      description: User.skills.description,
    });
    t.list.nonNull.field("socials", {
      type: "SocialInput",
      description: User.socials.description,
    });
    t.field("location", {
      type: "LocationInput",
      description: User.location.description,
    });
    t.field("education", {
      type: "EducationInput",
      description: User.education.description,
    });
    t.nonNull.list.field("experiences", {
      type: "ExperienceInput",
      description: User.experiences.description,
    });
  },
});

export const SocialInputType = inputObjectType({
  name: Social.$name + "Input",
  description: Social.$description,
  definition(t) {
    // t.field(Social.id);
    t.nonNull.field(Social.platform);
    t.nonNull.field(Social.url);
    t.field(Social.userId);
  },
});

export const EducationInputType = inputObjectType({
  name: Education.$name + "Input",
  description: Education.$description,
  definition(t) {
    t.id("id", { description: Education.id.description });
    t.nonNull.field(Education.institution);
    t.nonNull.field(Education.fieldOfStudy);
    t.nonNull.dateTime("startDate", {
      description: Education.startDate.description,
    });
    t.nonNull.dateTime("endDate", {
      description: Education.endDate.description,
    });
    t.nullable.field(Education.description);
    // t.field(Education.userId);
  },
});

export const ExperienceInputType = inputObjectType({
  name: "ExperienceInput",
  description: Experience.$description,
  definition(t) {
    t.id("id", { description: Experience.id.description });
    t.nonNull.field("type", {
      type: ExperienceTypeEnumType,
      default: "PROJECT",
    });
    t.nonNull.field("title", {
      type: "String",
      description: Experience.title.description,
    });
    t.nonNull.dateTime("startDate", {
      description: Experience.startDate.description,
    });
    t.nonNull.dateTime("endDate", {
      description: Experience.endDate.description,
    });
    t.nullable.field(Experience.description);
    t.nonNull.field("url", {
      type: "String",
      description: Experience.url.description,
    });
    t.nullable.field(Experience.imgSrc);
    t.nonNull.list.nonNull.field("tools", {
      type: "String",
      description: Experience.tools.description,
    });
    t.nullable.field(Experience.company);
    t.nullable.field(Experience.role);
    t.field(Experience.userId);
  },
});

export const LocationInputType = inputObjectType({
  name: Location.$name + "Input",
  description: Location.$description,
  definition(t) {
    t.id("id", { description: Location.id.description });
    t.field(Location.city);
    t.field(Location.province);
    t.field(Location.country);
    // t.field(Location.userId);
  },
});
