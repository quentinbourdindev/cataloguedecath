import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// Validation du secret en production
if (
  process.env.NODE_ENV === "production" &&
  (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.includes("CHANGEZ_MOI"))
) {
  throw new Error(
    "AUTH_SECRET must be set to a secure value in production. Generate one with: openssl rand -base64 32"
  )
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "CLIENT" | "COMMERCIAL" | "ADMIN" | "SUPER_ADMIN"
      firstName: string | null
      lastName: string | null
      email: string
    }
  }
  interface User {
    role: string
    firstName: string | null
    lastName: string | null
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Email et Mot de passe",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })
        
        if (!user) throw new Error("Email introuvable")
        
        // Si l'utilisateur n'est pas approuvé
        if (user.isApproved === false) {
          throw new Error("Votre compte est en attente de validation par un administrateur.")
        }

        // Tout utilisateur doit avoir un mot de passe
        if (!user.password) {
          throw new Error("Veuillez réinitialiser votre mot de passe")
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.password)
        if (!isValid) throw new Error("Mot de passe incorrect")
        
        return user
      },
    }),
  ],

  events: {
    async signIn({ user }) {
      if (user?.id) {
        try {
          await prisma.connectionLog.create({
            data: { userId: user.id }
          })
        } catch(e) {
          console.error("Failed to log connection", e)
        }
      }
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.firstName = user.firstName
        token.lastName = user.lastName
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as any
        session.user.firstName = token.firstName as string | null
        session.user.lastName = token.lastName as string | null
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
