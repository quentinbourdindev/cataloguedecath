const fs = require('fs');
const path = 'src/components/catalogue/custom-request-card.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'contentType: file.type,',
  'contentType: file.type,\n            fileSize: file.size,'
);

fs.writeFileSync(path, content);
console.log("Patched filesize");
