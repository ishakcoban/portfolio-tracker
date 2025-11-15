// Source - https://stackoverflow.com/a
// Posted by dev_ire
// Retrieved 2025-11-15, License - CC BY-SA 4.0

import { defineConfig } from "prisma/config";
import { config } from "dotenv";

config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL!,  
  },
});
