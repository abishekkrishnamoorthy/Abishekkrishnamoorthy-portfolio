import { createApp } from "@/app.js";
import { connectDb } from "@/config/db.js";
import { env } from "@/config/env.js";
import { logger } from "@/config/logger.js";

async function bootstrap() {
  await connectDb();
  const app = createApp();
  app.listen(env.PORT, () => logger.info({ port: env.PORT }, "Backend API listening"));
}

void bootstrap().catch((error) => {
  logger.error({ error }, "Backend failed to start");
  if (error && typeof error === "object" && "code" in error && error.code === 8000) {
    console.error("MongoDB Atlas authentication failed. Check MONGODB_URI username/password, URL-encode special characters in the password, and confirm the Atlas database user has access to this cluster.");
  }
  process.exit(1);
});
