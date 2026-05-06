import type { NextAuthConfig } from "next-auth";

// Edge-safe auth config — no Prisma, no bcrypt, no Node.js-only modules.
// Used by middleware.ts for JWT validation only.
export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  providers: [],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = (token.role as "ADMIN" | "STUDENT") ?? "STUDENT";
      return session;
    },
  },
};
