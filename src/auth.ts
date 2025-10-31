import NextAuth from "next-auth";
import { authOptions } from "@/auth-config";

export const auth = NextAuth(authOptions).auth;
export const signIn = NextAuth(authOptions).signIn;
export const signOut = NextAuth(authOptions).signOut;