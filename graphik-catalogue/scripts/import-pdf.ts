import { PrismaClient, ProductCategory, PricingType } from "@prisma/client"

const prisma = new PrismaClient()

const products = [
  // ─────────────────────────────────────────────────────────
  // EXTÉRIEUR
  // ─────────────────────────────────────────────────────────
  { category: ProductCategory.VISUEL_EXTERIEUR, name: "Entrée", description: "Vinyle blanc découpé", defaultWidth: 600, defaultHeight: 150, basePrice: 18.00, pricingType: PricingType.UNIT, sortOrder: 10 },
  { category: ProductCategory.VISUEL_EXTERIEUR, name: "Sortie", description: "Vinyle blanc découpé", defaultWidth: 565, defaultHeight: 150, basePrice: 18.00, pricingType: PricingType.UNIT, sortOrder: 20 },
  { category: ProductCategory.VISUEL_EXTERIEUR, name: "3,2,1 ... Go !", description: "Vinyle blanc découpé", defaultWidth: 980, defaultHeight: 164, basePrice: 25.00, pricingType: PricingType.UNIT, sortOrder: 30 },
  { category: ProductCategory.VISUEL_EXTERIEUR, name: "À bientôt sur les terrains", description: "Vinyle blanc découpé", defaultWidth: 980, defaultHeight: 274, basePrice: 25.00, pricingType: PricingType.UNIT, sortOrder: 40 },
  { category: ProductCategory.VISUEL_EXTERIEUR, name: "Horaires", description: "Vinyle blanc découpé", defaultWidth: 750, defaultHeight: 580, basePrice: 24.00, pricingType: PricingType.UNIT, sortOrder: 50 },
  { category: ProductCategory.VISUEL_EXTERIEUR, name: "Information légales", description: "Impression quadri sur vinyle ultra-transparent", defaultWidth: 297, defaultHeight: 420, basePrice: 15.00, pricingType: PricingType.UNIT, sortOrder: 60 },
  { category: ProductCategory.VISUEL_EXTERIEUR, name: "Bandes de vigilance (1000 x 50 mm)", description: "Vinyle dépoli avec logo", defaultWidth: 1000, defaultHeight: 50, basePrice: 7.00, pricingType: PricingType.UNIT, sortOrder: 70 },
  { category: ProductCategory.VISUEL_EXTERIEUR, name: "Bandes de vigilance (1500 x 50 mm)", description: "Vinyle dépoli avec logo", defaultWidth: 1500, defaultHeight: 50, basePrice: 11.00, pricingType: PricingType.UNIT, sortOrder: 71 },
  { category: ProductCategory.VISUEL_EXTERIEUR, name: "Bandes de vigilance (2000 x 50 mm)", description: "Vinyle dépoli avec logo", defaultWidth: 2000, defaultHeight: 50, basePrice: 15.00, pricingType: PricingType.UNIT, sortOrder: 72 },
  { category: ProductCategory.VISUEL_EXTERIEUR, name: "Dégradé de bleu", description: "Impression quadri + blanc + quadri sur vinyle ultra transparent", defaultWidth: null, defaultHeight: null, basePrice: 65.00, pricingType: PricingType.SQM, sortOrder: 80 },
  { category: ProductCategory.VISUEL_EXTERIEUR, name: "Panneau pour caméra de surveillance", description: "Impression quadri sur panneau Dibond", defaultWidth: 400, defaultHeight: 600, basePrice: 25.00, pricingType: PricingType.UNIT, sortOrder: 90 },

  // ─────────────────────────────────────────────────────────
  // BÂCHE LAMELLES + PVC PLIÉ À CHAUD
  // ─────────────────────────────────────────────────────────
  { category: ProductCategory.BACHE_LAMELLES_PVC, name: "Bâche lamelles en recto seul (1000 x 2330)", description: "Impression quadri sur toile avec dos noir et découpé en lamelles", defaultWidth: 1000, defaultHeight: 2330, basePrice: 105.00, pricingType: PricingType.UNIT, sortOrder: 100 },
  { category: ProductCategory.BACHE_LAMELLES_PVC, name: "Bâche lamelles en recto seul (1500 x 2330)", description: "Impression quadri sur toile avec dos noir et découpé en lamelles", defaultWidth: 1500, defaultHeight: 2330, basePrice: 135.00, pricingType: PricingType.UNIT, sortOrder: 110 },
  { category: ProductCategory.BACHE_LAMELLES_PVC, name: "Bâche lamelles en recto seul (2000 x 2330)", description: "Impression quadri sur toile avec dos noir et découpé en lamelles", defaultWidth: 2000, defaultHeight: 2330, basePrice: 165.00, pricingType: PricingType.UNIT, sortOrder: 120 },
  { category: ProductCategory.BACHE_LAMELLES_PVC, name: "Bâche lamelles en recto seul (2500 x 2330)", description: "Impression quadri sur toile avec dos noir et découpé en lamelles", defaultWidth: 2500, defaultHeight: 2330, basePrice: 195.00, pricingType: PricingType.UNIT, sortOrder: 130 },
  { category: ProductCategory.BACHE_LAMELLES_PVC, name: "Bâche lamelles en recto-verso (1000 x 2330)", description: "Impression quadri sur toile avec verso imprimé et découpée en lamelles", defaultWidth: 1000, defaultHeight: 2330, basePrice: 130.00, pricingType: PricingType.UNIT, sortOrder: 140 },
  { category: ProductCategory.BACHE_LAMELLES_PVC, name: "Bâche lamelles en recto-verso (1500 x 2330)", description: "Impression quadri sur toile avec verso imprimé et découpée en lamelles", defaultWidth: 1500, defaultHeight: 2330, basePrice: 160.00, pricingType: PricingType.UNIT, sortOrder: 150 },
  { category: ProductCategory.BACHE_LAMELLES_PVC, name: "Bâche lamelles en recto-verso (2000 x 2330)", description: "Impression quadri sur toile avec verso imprimé et découpée en lamelles", defaultWidth: 2000, defaultHeight: 2330, basePrice: 190.00, pricingType: PricingType.UNIT, sortOrder: 160 },
  { category: ProductCategory.BACHE_LAMELLES_PVC, name: "Bâche lamelles en recto-verso (2500 x 2330)", description: "Impression quadri sur toile avec verso imprimé et découpée en lamelles", defaultWidth: 2500, defaultHeight: 2330, basePrice: 220.00, pricingType: PricingType.UNIT, sortOrder: 170 },
  { category: ProductCategory.BACHE_LAMELLES_PVC, name: "PVC plié à chaud en recto seul", description: "Impression quadri sur PVC 3mm avec verso blanc", defaultWidth: 963, defaultHeight: 2280, basePrice: 70.00, pricingType: PricingType.UNIT, sortOrder: 180 },
  { category: ProductCategory.BACHE_LAMELLES_PVC, name: "PVC plié à chaud en recto-verso", description: "Impression quadri sur PVC 3mm avec verso imprimé", defaultWidth: 963, defaultHeight: 2280, basePrice: 82.00, pricingType: PricingType.UNIT, sortOrder: 190 },

  // ─────────────────────────────────────────────────────────
  // SIGNALÉTIQUES SUSPENDUES
  // ─────────────────────────────────────────────────────────
  { category: ProductCategory.SIGNALETIQUES_SUSPENDUES, name: "Panneau imprimé 'Sports' en recto-verso", description: "Impression quadri sur panneau Dibond", defaultWidth: 1500, defaultHeight: 600, basePrice: 80.00, pricingType: PricingType.UNIT, sortOrder: 200 },
  { category: ProductCategory.SIGNALETIQUES_SUSPENDUES, name: "Panneau imprimé 'Service' en recto-verso", description: "Impression quadri sur panneau Dibond", defaultWidth: 900, defaultHeight: 900, basePrice: 75.00, pricingType: PricingType.UNIT, sortOrder: 210 },
  { category: ProductCategory.SIGNALETIQUES_SUSPENDUES, name: "Caisson lumineux 'Sports' en recto-verso", description: "Cadre anodisé avec leds + toiles diffusantes imprimées", defaultWidth: 1500, defaultHeight: 600, basePrice: 489.00, pricingType: PricingType.UNIT, sortOrder: 220 },
  { category: ProductCategory.SIGNALETIQUES_SUSPENDUES, name: "Caisson lumineux 'Services' en recto-verso", description: "Cadre anodisé avec leds + toiles diffusantes imprimées", defaultWidth: 900, defaultHeight: 900, basePrice: 446.00, pricingType: PricingType.UNIT, sortOrder: 230 },

  // ─────────────────────────────────────────────────────────
  // PANNEAUX IMPRIMÉS
  // ─────────────────────────────────────────────────────────
  { category: ProductCategory.PANNEAUX_IMPRIMES, name: "Panneau pour locaux sociaux", description: "Impression quadri sur PVC 3mm", defaultWidth: 200, defaultHeight: 200, basePrice: 12.00, pricingType: PricingType.UNIT, sortOrder: 240 },
  { category: ProductCategory.PANNEAUX_IMPRIMES, name: "Panneau pour 'Decathlon vous informe' (1500 x 1000)", description: "Impression quadri sur PVC 5mm + 12 pochettes", defaultWidth: 1500, defaultHeight: 1000, basePrice: 95.00, pricingType: PricingType.UNIT, sortOrder: 250 },
  { category: ProductCategory.PANNEAUX_IMPRIMES, name: "Panneau pour 'Decathlon vous informe' (1000 x 1500)", description: "Impression quadri sur PVC 5mm + 12 pochettes", defaultWidth: 1000, defaultHeight: 1500, basePrice: 95.00, pricingType: PricingType.UNIT, sortOrder: 251 },
  { category: ProductCategory.PANNEAUX_IMPRIMES, name: "Panneau pour QG en recto-verso", description: "Impression quadri sur akyprint + clip's en plastique", defaultWidth: 1390, defaultHeight: 2440, basePrice: 75.00, pricingType: PricingType.UNIT, sortOrder: 260 },

  // ─────────────────────────────────────────────────────────
  // CLAUSTRAS BLEUS + VERRIÈRES
  // ─────────────────────────────────────────────────────────
  { category: ProductCategory.CLAUSTRAS_VERRIERES, name: "Claustra bleu (1000 x 1100)", description: "Claustra en profilés aluminium avec laquage bleu", defaultWidth: 1000, defaultHeight: 1100, basePrice: 0, pricingType: PricingType.UNIT, sortOrder: 270 },
  { category: ProductCategory.CLAUSTRAS_VERRIERES, name: "Claustra bleu (1000 x 1800)", description: "Claustra en profilés aluminium avec laquage bleu", defaultWidth: 1000, defaultHeight: 1800, basePrice: 0, pricingType: PricingType.UNIT, sortOrder: 280 },
  { category: ProductCategory.CLAUSTRAS_VERRIERES, name: "Verrière sur pied de grilles", description: "Cadre en acier avec laquage bleu avec vitrage en polycarbonate + cornieres avec laquage bleu", defaultWidth: 967, defaultHeight: 2154, basePrice: 562.00, pricingType: PricingType.UNIT, sortOrder: 290 },
  { category: ProductCategory.CLAUSTRAS_VERRIERES, name: "Corniere pour pied de grilles", description: "Accessoire d'installation", defaultWidth: null, defaultHeight: null, basePrice: 79.00, pricingType: PricingType.UNIT, sortOrder: 300 },

  // ─────────────────────────────────────────────────────────
  // REBOARD
  // ─────────────────────────────────────────────────────────
  { category: ProductCategory.REBOARD, name: "Cloison sur grille en Reboard en recto seul (1000 x 2370)", description: "Impression quadri sur Reboard Euroclass C avec verso blanc + pelliculage mat", defaultWidth: 1000, defaultHeight: 2370, basePrice: 250.00, pricingType: PricingType.UNIT, sortOrder: 310 },
  { category: ProductCategory.REBOARD, name: "Cloison sur grille en Reboard en recto seul (1000 x 3000)", description: "Impression quadri sur Reboard Euroclass C avec verso blanc + pelliculage mat", defaultWidth: 1000, defaultHeight: 3000, basePrice: 270.00, pricingType: PricingType.UNIT, sortOrder: 320 },
  { category: ProductCategory.REBOARD, name: "Cloison sur grille en Reboard en recto-verso (1000 x 2370)", description: "Impression quadri sur Reboard Euroclass C avec verso imprimé + pelliculage mat", defaultWidth: 1000, defaultHeight: 2370, basePrice: 270.00, pricingType: PricingType.UNIT, sortOrder: 330 },
  { category: ProductCategory.REBOARD, name: "Cloison sur grille en Reboard en recto-verso (1000 x 3000)", description: "Impression quadri sur Reboard Euroclass C avec verso imprimé + pelliculage mat", defaultWidth: 1000, defaultHeight: 3000, basePrice: 290.00, pricingType: PricingType.UNIT, sortOrder: 340 },
  
  { category: ProductCategory.REBOARD, name: "3ème hauteur en Reboard en recto seul (1000 x 1000)", description: "Impression quadri sur Reboard Euroclass C avec verso blanc + pelliculage mat", defaultWidth: 1000, defaultHeight: 1000, basePrice: 170.00, pricingType: PricingType.UNIT, sortOrder: 350 },
  { category: ProductCategory.REBOARD, name: "3ème hauteur en Reboard en recto seul (2000 x 1000)", description: "Impression quadri sur Reboard Euroclass C avec verso blanc + pelliculage mat", defaultWidth: 2000, defaultHeight: 1000, basePrice: 265.00, pricingType: PricingType.UNIT, sortOrder: 360 },
  { category: ProductCategory.REBOARD, name: "3ème hauteur en Reboard en recto seul (1000 x 1200)", description: "Impression quadri sur Reboard Euroclass C avec verso blanc + pelliculage mat", defaultWidth: 1000, defaultHeight: 1200, basePrice: 190.00, pricingType: PricingType.UNIT, sortOrder: 370 },
  { category: ProductCategory.REBOARD, name: "3ème hauteur en Reboard en recto seul (2000 x 1200)", description: "Impression quadri sur Reboard Euroclass C avec verso blanc + pelliculage mat", defaultWidth: 2000, defaultHeight: 1200, basePrice: 285.00, pricingType: PricingType.UNIT, sortOrder: 380 },
  
  { category: ProductCategory.REBOARD, name: "3ème hauteur en Reboard en recto-verso (1000 x 1000)", description: "Impression quadri sur Reboard Euroclass C avec verso imprimé + pelliculage mat", defaultWidth: 1000, defaultHeight: 1000, basePrice: 190.00, pricingType: PricingType.UNIT, sortOrder: 390 },
  { category: ProductCategory.REBOARD, name: "3ème hauteur en Reboard en recto-verso (2000 x 1000)", description: "Impression quadri sur Reboard Euroclass C avec verso imprimé + pelliculage mat", defaultWidth: 2000, defaultHeight: 1000, basePrice: 285.00, pricingType: PricingType.UNIT, sortOrder: 400 },
  { category: ProductCategory.REBOARD, name: "3ème hauteur en Reboard en recto-verso (1000 x 1200)", description: "Impression quadri sur Reboard Euroclass C avec verso imprimé + pelliculage mat", defaultWidth: 1000, defaultHeight: 1200, basePrice: 210.00, pricingType: PricingType.UNIT, sortOrder: 410 },
  { category: ProductCategory.REBOARD, name: "3ème hauteur en Reboard en recto-verso (2000 x 1200)", description: "Impression quadri sur Reboard Euroclass C avec verso imprimé + pelliculage mat", defaultWidth: 2000, defaultHeight: 1200, basePrice: 305.00, pricingType: PricingType.UNIT, sortOrder: 420 },
]

async function main() {
  console.log("⚠️ Nettoyage de la base de données (Briefs et Produits)...")
  
  // Supprimer les lignes de brief puis les briefs pour éviter les conflits de clé étrangère
  await prisma.briefLine.deleteMany()
  await prisma.brief.deleteMany()
  
  // Supprimer les anciens produits factices
  await prisma.product.deleteMany()

  console.log(`📦 Importation de ${products.length} produits du PDF Decathlon...`)

  let count = 0
  for (const p of products) {
    await prisma.product.create({
      data: {
        name: p.name,
        category: p.category,
        description: p.description,
        defaultWidth: p.defaultWidth,
        defaultHeight: p.defaultHeight,
        unitPriceHT: p.basePrice,
        pricingType: p.pricingType,
        sortOrder: p.sortOrder,
        isActive: true,
      }
    })
    count++
  }

  console.log(`✅ ${count} produits importés avec succès !`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
