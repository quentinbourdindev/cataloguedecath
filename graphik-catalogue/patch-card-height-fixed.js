const fs = require('fs');
const path = 'src/components/catalogue/custom-request-card.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'min-h-[calc(100vh-250px)]',
  'min-h-[400px] lg:min-h-[450px]'
);

fs.writeFileSync(path, content);
console.log("Patched card height to fixed");
