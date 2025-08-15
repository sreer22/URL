/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
      tenantId: process.env.AZURE_AD_TENANT_ID || "common",
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email/Username/Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;
        const identifier = credentials.identifier;
        const user = await prisma.user.findFirst({
          where: { OR: [{ email: identifier }, { username: identifier }, { phone: identifier }] },
        });
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, name: user.name || user.username || user.email || "User", email: user.email || undefined } as any;
      },
    }),
    CredentialsProvider({
      id: "otp",
      name: "OTP",
      credentials: {
        target: { label: "Email or Phone", type: "text" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.target || !credentials?.code) return null;
        const target = credentials.target;
        const code = credentials.code;
        const now = new Date();
        const record = await prisma.otpCode.findFirst({
          where: { target, purpose: "login", code, consumed: false, expiresAt: { gt: now } },
          orderBy: { createdAt: "desc" },
        });
        if (!record) return null;
        await prisma.otpCode.update({ where: { id: record.id }, data: { consumed: true } });
        let user = await prisma.user.findFirst({ where: { OR: [{ email: target }, { phone: target }] } });
        if (!user) {
          user = await prisma.user.create({ data: { email: target.includes("@") ? target : null, phone: target.includes("@") ? null : target } });
        }
        return { id: user.id, name: user.name || user.username || user.email || "User", email: user.email || undefined } as any;
      },
    }),
  ],
  session: { strategy: "database" },
  pages: { signIn: "/login" },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;
        (session.user as any).role = (user as any).role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};