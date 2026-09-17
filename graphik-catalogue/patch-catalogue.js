const fs = require('fs');
const path = 'src/components/catalogue/catalogue-client.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Initialiser le panier avec attachmentUrl
content = content.replace(
  'isOutOfCatalogue: line.isOutOfCatalogue,',
  'isOutOfCatalogue: line.isOutOfCatalogue,\n      attachmentUrl: line.attachmentUrl,'
);

// 2. Sauvegarder les lignes avec attachmentUrl
content = content.replace(
  'isOutOfCatalogue: l.isOutOfCatalogue ?? false,',
  'isOutOfCatalogue: l.isOutOfCatalogue ?? false,\n              attachmentUrl: l.attachmentUrl,'
);

// 3. Modifier la structure de la grille pour pleine largeur sur SUR_MESURE
const searchBlock = `{activeCategory === "SUR_MESURE" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                  <CustomRequestCard readonly={isReadonly} onAdd={handleAddToCart} />
                </div>
              )`;

const replaceBlock = `{activeCategory === "SUR_MESURE" ? (
                <div className="w-full max-w-4xl">
                  <CustomRequestCard readonly={isReadonly} onAdd={handleAddToCart} />
                </div>
              )`;

content = content.replace(searchBlock, replaceBlock);

fs.writeFileSync(path, content);
console.log("Patched catalogue-client.tsx");
