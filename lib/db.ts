import { PrismaClient } from "@prisma/client";

// evita criar varias conexoes quando o next recarrega em dev
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
