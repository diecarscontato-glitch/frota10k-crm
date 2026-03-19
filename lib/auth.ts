import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { db } from "./db";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
          include: { account: true },
        });

        if (!user || !user.password) return null;

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordCorrect) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          accountId: user.account_id,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // For Google login, check if the user exists in our database
      if (account?.provider === "google") {
        const existingUser = await db.user.findUnique({
          where: { email: user.email! },
        });
        // Only allow sign-in if the user already exists in the database
        if (!existingUser) {
          return false;
        }
        // Update avatar if not set
        if (!existingUser.avatar && user.image) {
          await db.user.update({
            where: { email: user.email! },
            data: { avatar: user.image },
          });
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user && account?.provider === "credentials") {
        token.role = (user as Record<string, unknown>).role;
        token.accountId = (user as Record<string, unknown>).accountId;
      }
      // For Google sign-in, fetch role and accountId from database
      if (account?.provider === "google" && user?.email) {
        const dbUser = await db.user.findUnique({
          where: { email: user.email },
        });
        if (dbUser) {
          token.sub = dbUser.id;
          token.role = dbUser.role;
          token.accountId = dbUser.account_id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string;
        const s = session as unknown as Record<string, Record<string, unknown>>;
        s.user.role = token.role as string;
        s.user.accountId = token.accountId as string;
      }
      return session;
    },
  },
});
