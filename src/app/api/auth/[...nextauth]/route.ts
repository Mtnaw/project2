import NextAuth from "next-auth";
import { authOptions } from "@/auth-config";
import { Session } from "inspector/promises";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };