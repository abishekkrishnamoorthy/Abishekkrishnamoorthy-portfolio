import { connectDb, disconnectDb } from "@/config/db.js";
import { env } from "@/config/env.js";
import { usersService } from "@/modules/users/users.service.js";
import { usersRepository } from "@/modules/users/users.repository.js";

async function main() {
  if (!env.SUPER_ADMIN_EMAIL || !env.SUPER_ADMIN_PASSWORD) throw new Error("SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are required");
  await connectDb();
  await usersService.seedRoles();
  const existing = await usersRepository.findByEmail(env.SUPER_ADMIN_EMAIL);
  if (!existing) {
    await usersService.createUser({
      name: env.SUPER_ADMIN_NAME ?? "Portfolio Admin",
      email: env.SUPER_ADMIN_EMAIL,
      password: env.SUPER_ADMIN_PASSWORD,
      roleName: "SUPER_ADMIN",
    });
  }
  await disconnectDb();
}

void main();
