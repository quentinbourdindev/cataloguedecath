import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = registerSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: "Données invalides", details: result.error.flatten() }, { status: 400 })
    }

    const { email, password, firstName, lastName } = result.data

    // 0. Déterminer si le compte est approuvé automatiquement
    const emailDomain = email.split('@')[1]?.toLowerCase()
    const isApproved = emailDomain === 'decathlon.fr' || emailDomain === 'graphik.fr'

    // 1. Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 })
    }

    // 2. Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // 3. Créer l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "CLIENT",
        isApproved,
      },
    })

    return NextResponse.json({ success: true, isApproved, user: { email: newUser.email, id: newUser.id } }, { status: 201 })
  } catch (error) {
    console.error("Erreur Inscription:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
