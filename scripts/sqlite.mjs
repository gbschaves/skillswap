// roda local com sqlite: copia o schema trocando o banco, a vercel continua usando o neon
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { execSync } from "child_process";

const schema = readFileSync("prisma/schema.prisma", "utf8");
const local = schema.replace(
  /datasource db \{[^}]*\}/,
  'datasource db {\n  provider = "sqlite"\n  url      = "file:../dev.db"\n}'
);

mkdirSync("prisma/sqlite", { recursive: true });
writeFileSync("prisma/sqlite/schema.prisma", local);

execSync("npx prisma db push --schema prisma/sqlite/schema.prisma --accept-data-loss", { stdio: "inherit" });
