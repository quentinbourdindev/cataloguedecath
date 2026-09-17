import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const groupings = [
  { prefix: "Bâche lamelles en recto seul", newName: "Bâche lamelles en recto seul" },
  { prefix: "Bâche lamelles en recto-verso", newName: "Bâche lamelles en recto-verso" },
  { prefix: "Bandes de vigilance", newName: "Bandes de vigilance" },
  { prefix: "Panneau pour 'Decathlon vous informe'", newName: "Panneau pour 'Decathlon vous informe'" },
  { prefix: "Claustra bleu", newName: "Claustra bleu" },
  { prefix: "Cloison sur grille en Reboard en recto seul", newName: "Cloison sur grille en Reboard en recto seul" },
  { prefix: "Cloison sur grille en Reboard en recto-verso", newName: "Cloison sur grille en Reboard en recto-verso" },
  { prefix: "3ème hauteur en Reboard en recto seul", newName: "3ème hauteur en Reboard en recto seul" },
  { prefix: "3ème hauteur en Reboard en recto-verso", newName: "3ème hauteur en Reboard en recto-verso" },
]

async function main() {
  for (const group of groupings) {
    const products = await prisma.product.findMany({
      where: { name: { startsWith: group.prefix } },
      orderBy: { sortOrder: "asc" }
    })
    
    if (products.length <= 1) continue;

    console.log(`Grouping ${products.length} products for ${group.newName}...`)

    const options = products.map(p => {
      // Extract size from name, e.g. "Bâche lamelles en recto seul (1000 x 2330)" -> "1000 x 2330"
      const match = p.name.match(/\((.*?)\)/);
      const label = match ? match[1] : p.name;
      return { label, price: p.unitPriceHT }
    })

    const primaryProduct = products[0]
    
    // Update primary product
    await prisma.product.update({
      where: { id: primaryProduct.id },
      data: {
        name: group.newName,
        options: options as any,
        unitPriceHT: primaryProduct.unitPriceHT
      }
    })

    // Delete others
    const idsToDelete = products.slice(1).map(p => p.id)
    await prisma.product.deleteMany({
      where: { id: { in: idsToDelete } }
    })
    
    console.log(`Done grouping ${group.newName}`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
