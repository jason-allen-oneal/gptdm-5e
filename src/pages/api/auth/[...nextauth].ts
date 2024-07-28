import NextAuth from "next-auth";
import { nextAuthConfig } from "@/lib/auth";

export default NextAuth(nextAuthConfig);