import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

export const nextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        let user = null;
        
        try {
          const { email, password } = await loginSchema.validate(credentials);

          const result = await prisma.user.findFirst({
            where: { email }
          });
          
          if (!result) return null;
          
          const isValidPassword = await bcrypt.compare(password, result.password);
          
          if (!isValidPassword) return null;
          
          return result;
        } catch (e) {
          console.log("error", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id as number;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user = token;
      }
      
      return session;
    },
  },
  jwt: {
    maxAge: 15 * 24 * 30 * 60, // 15 days
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  secret: process.env.NEXTAUTH_SECRET
};



