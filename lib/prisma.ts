import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prismaInstance: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// Lazy proxy: PrismaClient is only instantiated on first property access (first actual
// DB operation). This prevents initialization with DATABASE_URL=undefined when
// server/socket-server.ts is imported at the top of server.ts before app.prepare()
// has a chance to load .env.
const handler: ProxyHandler<PrismaClient> = {
  get(_target, prop, receiver) {
    if (!globalForPrisma.prismaInstance) {
      globalForPrisma.prismaInstance = createPrismaClient();
    }
    const value = Reflect.get(globalForPrisma.prismaInstance, prop, receiver);
    if (typeof value === "function") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (value as (...args: any[]) => any).bind(globalForPrisma.prismaInstance);
    }
    return value;
  },
};

export const prisma = new Proxy({} as PrismaClient, handler);
