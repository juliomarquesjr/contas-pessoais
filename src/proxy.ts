import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Protege tudo, exceto a API de auth e assets públicos (PWA, ícones, SW).
  matcher: [
    "/((?!api|_next/static|_next/image|manifest.webmanifest|sw.js|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webmanifest)).*)",
  ],
};
