const fs = require('fs');
const path = 'src/components/catalogue/custom-request-card.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'min-h-[calc(100vh-16rem)]',
  'min-h-[calc(100vh-250px)]'
);

fs.writeFileSync(path, content);
console.log("Patched card height to vh precisely");
