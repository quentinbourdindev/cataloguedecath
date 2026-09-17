import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  const mapping: Record<string, string> = {
    "Entrée": "/images/products/img_7.jpg",
    "Sortie": "/images/products/img_9.jpg",
    "3,2,1 ... Go !": "/images/products/img_11.jpg",
    "À bientôt sur les terrains": "/images/products/img_13.jpg",
    "Horaires": "/images/products/img_0.jpg",
    "Information légales": "/images/products/img_2.jpg",
    "Bandes de vigilance (1000 x 50 mm)": "/images/products/img_4.jpg",
    "Bandes de vigilance (1500 x 50 mm)": "/images/products/img_4.jpg",
    "Bandes de vigilance (2000 x 50 mm)": "/images/products/img_4.jpg",
    "Dégradé de bleu": "/images/products/img_6.jpg",
    "Panneau pour caméra de surveillance": "/images/products/img_8.jpg",
    "Bâche lamelles en recto seul (1000 x 2330)": "/images/products/img_25.jpg",
    "Bâche lamelles en recto seul (1500 x 2330)": "/images/products/img_25.jpg",
    "Bâche lamelles en recto seul (2000 x 2330)": "/images/products/img_25.jpg",
    "Bâche lamelles en recto seul (2500 x 2330)": "/images/products/img_25.jpg",
    "Bâche lamelles en recto-verso (1000 x 2330)": "/images/products/img_26.jpg",
    "Bâche lamelles en recto-verso (1500 x 2330)": "/images/products/img_26.jpg",
    "Bâche lamelles en recto-verso (2000 x 2330)": "/images/products/img_26.jpg",
    "Bâche lamelles en recto-verso (2500 x 2330)": "/images/products/img_26.jpg",
    "PVC plié à chaud en recto seul": "/images/products/img_23.jpg",
    "PVC plié à chaud en recto-verso": "/images/products/img_23.jpg",
    "Panneau imprimé 'Sports' en recto-verso": "/images/products/img_12.jpg",
    "Panneau imprimé 'Service' en recto-verso": "/images/products/img_10.jpg",
    "Caisson lumineux 'Sports' en recto-verso": "/images/products/img_12.jpg",
    "Caisson lumineux 'Services' en recto-verso": "/images/products/img_10.jpg",
    "Panneau pour locaux sociaux": "/images/products/img_5.jpg",
    "Panneau pour 'Decathlon vous informe' (1500 x 1000)": "/images/products/img_16.jpg",
    "Panneau pour 'Decathlon vous informe' (1000 x 1500)": "/images/products/img_16.jpg",
    "Panneau pour QG en recto-verso": "/images/products/img_16.jpg",
    "Claustra bleu (1000 x 1100)": "/images/products/img_18.jpg",
    "Claustra bleu (1000 x 1800)": "/images/products/img_18.jpg",
    "Verrière sur pied de grilles": "/images/products/img_19.jpg",
    "Corniere pour pied de grilles": "/images/products/img_19.jpg",
    "Cloison sur grille en Reboard en recto seul (1000 x 2370)": "/images/products/img_17.jpg",
    "Cloison sur grille en Reboard en recto seul (1000 x 3000)": "/images/products/img_17.jpg",
    "Cloison sur grille en Reboard en recto-verso (1000 x 2370)": "/images/products/img_17.jpg",
    "Cloison sur grille en Reboard en recto-verso (1000 x 3000)": "/images/products/img_17.jpg",
    "3ème hauteur en Reboard en recto seul (1000 x 1000)": "/images/products/img_30.jpg",
    "3ème hauteur en Reboard en recto seul (2000 x 1000)": "/images/products/img_30.jpg",
    "3ème hauteur en Reboard en recto seul (1000 x 1200)": "/images/products/img_30.jpg",
    "3ème hauteur en Reboard en recto seul (2000 x 1200)": "/images/products/img_30.jpg",
    "3ème hauteur en Reboard en recto-verso (1000 x 1000)": "/images/products/img_30.jpg",
    "3ème hauteur en Reboard en recto-verso (2000 x 1000)": "/images/products/img_30.jpg",
    "3ème hauteur en Reboard en recto-verso (1000 x 1200)": "/images/products/img_30.jpg",
    "3ème hauteur en Reboard en recto-verso (2000 x 1200)": "/images/products/img_30.jpg",
  }

  const products = await prisma.product.findMany()
  for (const product of products) {
    if (mapping[product.name]) {
      await prisma.product.update({
        where: { id: product.id },
        data: { imageUrl: mapping[product.name] }
      })
      console.log(`Updated ${product.name} with ${mapping[product.name]}`)
    } else {
      console.log(`⚠️ No mapping for ${product.name}`)
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
