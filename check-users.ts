import { prisma } from "./src/lib/prisma";

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      universityEmail: true,
      role: true,
      name: true,
      surname: true,
    },
  });
  console.log("USERS_LIST:", JSON.stringify(users, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
