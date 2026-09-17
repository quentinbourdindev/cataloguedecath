const fs = require('fs');
const path = 'src/components/catalogue/custom-request-card.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'transition-all p-6 flex-1"',
  'transition-all p-6 min-h-[calc(100vh-360px)] flex-1"'
);

fs.writeFileSync(path, content);
console.log("Patched card height exact calculation");
