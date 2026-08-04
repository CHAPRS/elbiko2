import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts", // Современный и быстрый запуск сидинга
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
