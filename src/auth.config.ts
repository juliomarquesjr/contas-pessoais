import type { NextAuthConfig } from "next-auth";

/**
 * Config edge-safe (sem bcrypt/db) usada pelo middleware.
 * Os providers que precisam do Node ficam em auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/registrar");

      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.householdId = (user as { householdId?: number }).householdId;
        token.name = user.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.householdId = token.householdId as number;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
