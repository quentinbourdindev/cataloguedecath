import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // ─── Admin Graphik ─────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "remy.haller@graphik.fr" },
    update: {},
    create: {
      email: "remy.haller@graphik.fr",
      firstName: "Rémy",
      lastName: "Haller",
      role: "ADMIN",
    },
  })

  const commercial = await prisma.user.upsert({
    where: { email: "franck.bellamy@graphik.fr" },
    update: {},
    create: {
      email: "franck.bellamy@graphik.fr",
      firstName: "Franck",
      lastName: "Bellamy",
      role: "COMMERCIAL",
    },
  })

  // ─── Magasins Decathlon ────────────────────────────────────────
  const storeNancy = await prisma.store.upsert({
    where: { id: "store-nancy" },
    update: {},
    create: {
      id: "store-nancy",
      name: "Decathlon Nancy",
      address: "Rue des Champs Blancs",
      city: "Nancy",
      zipCode: "54000",
    },
  })

  const storeMetz = await prisma.store.upsert({
    where: { id: "store-metz" },
    update: {},
    create: {
      id: "store-metz",
      name: "Decathlon Metz",
      address: "3 Avenue de la Paix",
      city: "Metz",
      zipCode: "57000",
    },
  })

  // ─── Client test ────────────────────────────────────────────────
  const client = await prisma.user.upsert({
    where: { email: "directeur@decathlon-nancy.fr" },
    update: {},
    create: {
      email: "directeur@decathlon-nancy.fr",
      firstName: "Jean",
      lastName: "Dupont",
      role: "CLIENT",
    },
  })

  await prisma.userStore.upsert({
    where: { userId_storeId: { userId: client.id, storeId: storeNancy.id } },
    update: {},
    create: { userId: client.id, storeId: storeNancy.id },
  })

  // ─── Produits Catalogue ─────────────────────────────────────────
  const products = [
    // Visuel Extérieur
    {
      category: "VISUEL_EXTERIEUR" as const,
      name: "Bâche extérieure grand format",
      description: "Impression haute définition, résistante aux UV",
      defaultWidth: 6.0,
      defaultHeight: 2.5,
      pricingType: "SQM" as const,
      unitPriceHT: 45.0,
      options: ["Sans finition", "Ourlets + œillets", "Baguettes alu"],
      sortOrder: 1,
    },
    {
      category: "VISUEL_EXTERIEUR" as const,
      name: "Covering vitrine",
      description: "Film adhésif premium, pose incluse sur devis",
      defaultWidth: 4.0,
      defaultHeight: 2.0,
      pricingType: "SQM" as const,
      unitPriceHT: 55.0,
      options: ["Opaque", "Perforé 50/50", "Micro-perforé"],
      sortOrder: 2,
    },
    // Bâche Lamelles + PVC
    {
      category: "BACHE_LAMELLES_PVC" as const,
      name: "Rideau de lamelles PVC",
      description: "Séparation transparente, pliage à chaud, sur mesure",
      defaultWidth: 2.0,
      defaultHeight: 2.2,
      pricingType: "SQM" as const,
      unitPriceHT: 38.0,
      options: ["Standard", "Anti-statique", "Souple renforcé"],
      sortOrder: 1,
    },
    {
      category: "BACHE_LAMELLES_PVC" as const,
      name: "PVC plié à chaud",
      description: "Bâche rigide pliée pour séparation ou protection",
      pricingType: "SQM" as const,
      unitPriceHT: 42.0,
      options: ["Transparent", "Blanc opaque"],
      sortOrder: 2,
    },
    // Signalétiques Suspendues
    {
      category: "SIGNALETIQUES_SUSPENDUES" as const,
      name: "Kakémono double face",
      description: "Structure aluminium + impression recto-verso",
      defaultWidth: 0.85,
      defaultHeight: 2.0,
      pricingType: "UNIT" as const,
      unitPriceHT: 189.0,
      options: ["Recto simple", "Recto-verso"],
      sortOrder: 1,
    },
    {
      category: "SIGNALETIQUES_SUSPENDUES" as const,
      name: "Bandeau suspendu",
      description: "Impression sur bâche ou PVC semi-rigide",
      defaultWidth: 3.0,
      defaultHeight: 0.6,
      pricingType: "SQM" as const,
      unitPriceHT: 48.0,
      options: ["Bâche", "PVC 5mm", "Dibond"],
      sortOrder: 2,
    },
    // Panneaux Imprimés
    {
      category: "PANNEAUX_IMPRIMES" as const,
      name: "Panneau PVC 5mm",
      description: "Impression directe UV, découpe sur mesure",
      defaultWidth: 1.2,
      defaultHeight: 0.8,
      pricingType: "SQM" as const,
      unitPriceHT: 62.0,
      options: ["Recto", "Recto-verso", "Pelliculage mat", "Pelliculage brillant"],
      sortOrder: 1,
    },
    {
      category: "PANNEAUX_IMPRIMES" as const,
      name: "Panneau Dibond 3mm",
      description: "Composite aluminium, haute résistance",
      defaultWidth: 1.0,
      defaultHeight: 1.4,
      pricingType: "SQM" as const,
      unitPriceHT: 95.0,
      options: ["Recto", "Pelliculage mat"],
      sortOrder: 2,
    },
    // Claustras + Verrières
    {
      category: "CLAUSTRAS_VERRIERES" as const,
      name: "Claustra bleu Decathlon",
      description: "Structure bois ou métal, habillage vinyle bleu",
      pricingType: "UNIT" as const,
      unitPriceHT: 320.0,
      options: ["Module 1m", "Module 2m", "Module 3m"],
      sortOrder: 1,
    },
    {
      category: "CLAUSTRAS_VERRIERES" as const,
      name: "Verrière décorative",
      description: "Structure acier + verre ou plexiglas",
      pricingType: "SQM" as const,
      unitPriceHT: 280.0,
      sortOrder: 2,
    },
    // Reboard
    {
      category: "REBOARD" as const,
      name: "PLV Reboard découpé",
      description: "Carton alvéolaire renforcé, impression UV, découpe laser",
      pricingType: "SQM" as const,
      unitPriceHT: 75.0,
      options: ["Plat", "Relief 3D", "Pelliculage mat"],
      sortOrder: 1,
    },
    {
      category: "REBOARD" as const,
      name: "Présentoir Reboard A3",
      description: "Format A3, autoportant, impression recto",
      defaultWidth: 0.3,
      defaultHeight: 0.42,
      pricingType: "UNIT" as const,
      unitPriceHT: 28.0,
      sortOrder: 2,
    },
  ]

  for (const product of products) {
    await prisma.product.create({ data: product })
  }

  console.log("✅ Seed terminé !")
  console.log(`   Admin: ${admin.email}`)
  console.log(`   Commercial: ${commercial.email}`)
  console.log(`   Client test: ${client.email}`)
  console.log(`   Magasins: ${storeNancy.name}, ${storeMetz.name}`)
  console.log(`   Produits: ${products.length} créés`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
