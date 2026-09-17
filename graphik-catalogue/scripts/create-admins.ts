import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const plainPassword = process.env.ADMIN_PASSWORD
  if (!plainPassword) {
    throw new Error("ADMIN_PASSWORD manquant dans le .env")
  }

  console.log("🔒 Hachage du mot de passe admin...")
  const password = await bcrypt.hash(plainPassword, 10)

  const admins = [
    { email: "remy.haller@graphik.fr", firstName: "Rémy", lastName: "Haller", role: "ADMIN" },
    { email: "franck.bellamy@graphik.fr", firstName: "Franck", lastName: "Bellamy", role: "ADMIN" },
    { email: "quentin.bourdin@graphik.fr", firstName: "Quentin", lastName: "Bourdin", role: "SUPER_ADMIN" }
  ]

  console.log("🛠️ Création ou mise à jour des administrateurs...")

  for (const admin of admins) {
    const user = await prisma.user.upsert({
      where: { email: admin.email },
      update: {
        password,
        role: admin.role as any,
        firstName: admin.firstName,
        lastName: admin.lastName,
      },
      create: {
        email: admin.email,
        password,
        role: admin.role as any,
        firstName: admin.firstName,
        lastName: admin.lastName,
      }
    })
    console.log(`✅ Admin configuré : ${user.email}`)
  }

  console.log("🎉 C'est tout bon ! Vous pouvez vous connecter.")
}

main()
  .catch((e) => {
    console.error("❌ Erreur :", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
