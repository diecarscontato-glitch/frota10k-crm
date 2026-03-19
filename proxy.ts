import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Match all routes except API, static files, and images
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
