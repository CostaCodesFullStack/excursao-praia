import "dotenv/config";

import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const envSchema = z.object({
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(6),
});

const env = envSchema.parse(process.env);
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: env.ADMIN_EMAIL },
    update: { password: passwordHash },
    create: {
      email: env.ADMIN_EMAIL,
      password: passwordHash,
    },
  });

  console.log(`Admin pronto: ${user.email}`);
}

main()
  .catch((error) => {
    console.error("Falha ao criar admin", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

