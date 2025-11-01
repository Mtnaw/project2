import type { NextAuthOptions, User, TokenSet, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import fs from "fs";
import path from "path";

interface CustomUser extends User {
  role?: string;
}

interface CustomToken extends TokenSet {
  role?: string;
}

interface CustomSession extends Session {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const adminPath = path.join(process.cwd(), "src/data/admin.json");
        const adminDataRaw = fs.readFileSync(adminPath, "utf8");
        const adminData = JSON.parse(adminDataRaw);

        if (
          credentials?.email === adminData.email &&
          credentials?.password === adminData.password
        ) {
          return {
            id: adminData.id,
            name: adminData.name,
            email: adminData.email,
            role: adminData.role
          } as CustomUser;
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      const customToken = token as CustomToken;
      if (user) {
        const u = user as CustomUser;
        customToken.role = u.role;
      }
      return customToken;
    },
    async session({ session, token }) {
      const customSession = session as CustomSession;
      if (customSession.user) {
        const t = token as CustomToken;
        customSession.user.role = t.role;
      }
      return customSession;
    },
    async redirect({ url, baseUrl }) {
      // Allows callback URLs on the same origin
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  pages: {
    signIn: "/admin/signin"
  },
};