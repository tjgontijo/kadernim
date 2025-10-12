import { defineConfig } from "prisma/config";
import path from "path";

export default defineConfig({
  
  schema: path.join("prisma", "schema.prisma"),
  
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "ts-node --project prisma/tsconfig.json -r tsconfig-paths/register prisma/seed.ts"
  }
});
