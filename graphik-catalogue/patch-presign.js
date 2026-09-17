const fs = require('fs');
const path = 'src/app/api/upload/presign/route.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'briefId: z.string().min(1),',
  'briefId: z.string().optional(),'
);

content = content.replace(
  'const key = buildPlanKey(briefId, fileName)',
  'const key = briefId ? buildPlanKey(briefId, fileName) : `attachments/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase()}`'
);

fs.writeFileSync(path, content);
console.log("Patched presign route");
