const fs = require('fs');
const path = 'src/app/api/briefs/[id]/lines/route.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'isOutOfCatalogue: z.boolean().default(false),',
  'isOutOfCatalogue: z.boolean().default(false),\n  attachmentUrl: z.string().optional().nullable(),'
);

content = content.replace(
  'isOutOfCatalogue: line.isOutOfCatalogue || false,',
  'isOutOfCatalogue: line.isOutOfCatalogue || false,\n          attachmentUrl: line.attachmentUrl || null,'
);

fs.writeFileSync(path, content);
console.log("Patched lines route");
