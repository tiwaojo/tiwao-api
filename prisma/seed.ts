import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Seed the database with some initial data
// Resource: https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding#how-to-seed-your-database-in-prisma-orm
async function main() {
  await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      firstName: "Alice",
      lastName: "Smith",
      email: "alice@example.com",
      title: "Senior Platform Engineer",
      about: null,
      role:"GUEST",
      education: {
        create: {
          fieldOfStudy: "BSc Computer Science",
          institution: "University of Birmingham",
          startDate: new Date("2017-09-01"),
          endDate: new Date("2020-06-01"),
          description:
            "I studied Computer Science at the University of Birmingham.",
          // other fields...
        },
      },
      skills: [
        "JavaScript",
        "TypeScript",
        "GraphQL",
        "React",
        "Node.js",
        "Docker",
        "Kubernetes",
        "AWS",
      ],
      socials: {
        create: [
          {
            platform: "Twitter",
            url: "https://twitter.com/alice",
          },
          {
            platform: "LinkedIn",
            url: "https://linkedin.com/alice",
          },
        ],
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "bob@burger.com" },
    update: {},
    create: {
      firstName: "Bob",
      lastName: "Belcher",
      email: "bob@burger.com",
      title: "Software Developer",
      about: "If I were a spice, I'd be flour",
      role:"GUEST",
      location: {
        create: {
          city: "Seymour's Bay",
          province: "New Jersey",
          country: "United States Of America",
        },
      },
      education: {
        create: {
          fieldOfStudy: "BSc Computer Science",
          institution: "University of Worcestershire",
          startDate: new Date("2017-09-01"),
          endDate: new Date("2020-06-01"),
          description:
            "I studied Computer Science at the University of Worcestershire.",
          // other fields...
        },
      },
      skills: [
        "Java",
        "Google Cloud",
        "Python",
        "React",
        "Node.js",
        "Docker",
        "Kubernetes",
        "AWS",
      ],
      experiences: {
        create: [
          {
            startDate: new Date("2019-06-01"),
            endDate: new Date("2020-06-01"),
            title: "Software Developer",
            company: "Dunder Mifflin",
            description: "I worked as a software developer at Dunder Mifflin.",
            url: "https://www.dundermifflin.com",
            type: "WORK",
            tools: ["React", "Node.js", "GraphQL"],
            // other fields...
          },
          {
            startDate: new Date("2020-06-01"),
            endDate: new Date("2021-06-01"),
            title: "Big Burger App",
            description:
              "I worked on a burger application using a layered architecture",
            url: "https://www.buns.com",
            type: "PROJECT",
            // other fields...
          },
        ],
      },
      socials: {
        create: [
          {
            platform: "Facebook",
            url: "https://x.com/bob",
          },
          {
            platform: "Instagram",
            url: "https://ig.com/bob",
          },
        ],
      },
    },
  });
}

main()
  .then(async () => {
    console.log("Data seeded...");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });
