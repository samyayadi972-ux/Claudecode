import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("@Mylene007!", 12);
  await prisma.user.upsert({
    where: { email: "gauss.amazon.seller@gmail.com" },
    update: { password },
    create: {
      email: "gauss.amazon.seller@gmail.com",
      password,
    },
  });
  console.log("Seed done — gauss.amazon.seller@gmail.com / @Mylene007!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
