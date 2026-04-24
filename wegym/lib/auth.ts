import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { type: "text" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).trim();

        const user = await prisma.user.findFirst({
          where: {
            email: { equals: email, mode: "insensitive" },
          },
          select: {
            id: true,
            email: true,
            role: true,
            passwordHash: true,
          },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60,
    updateAge: 12 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        if (user.email) token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        if (token.email && typeof token.email === "string") {
          session.user.email = token.email;
        }
      }
      return session;
    },
  },

  pages: {
    signIn: "/",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
