import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      householdId: number;
    } & DefaultSession["user"];
  }

  interface User {
    householdId?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    householdId?: number;
  }
}
