const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

schema = schema.replace(
  'isOutOfCatalogue Boolean @default(false)',
  'isOutOfCatalogue Boolean @default(false)\n  attachmentUrl  String?'
);
fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Schema updated');
