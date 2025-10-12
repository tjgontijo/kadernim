import { defineConfig } from "prisma/config";
import path from "path";
import dotenv from "dotenv";

// Carregar variáveis de ambiente do .env
dotenv.config();

export default defineConfig({
  
  schema: path.join("prisma", "schema.prisma"),
  
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "ts-node --project prisma/tsconfig.json -r tsconfig-paths/register prisma/seed.ts"
  }
});
