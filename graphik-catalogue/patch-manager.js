const fs = require('fs');
const path = 'src/components/admin/products-manager.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Change State type
content = content.replace('useState<string[]>([])', 'useState<any[]>([])');

// 2. Change removeOption
content = content.replace('const removeOption = (opt: string) => setOptions((prev) => prev.filter((o) => o !== opt))', 'const removeOption = (opt: any) => setOptions((prev) => prev.filter((o) => o !== opt))');

// 3. Change render
content = content.replace(
  '{options.map((opt) => (',
  `{options.map((opt, i) => {
    const label = typeof opt === 'string' ? opt : (opt.label + (opt.price ? " (" + opt.price + "€)" : ""));
    return (`
);
content = content.replace(
  '<span key={opt} className="flex items-center gap-1.5 bg-neutral-100 text-neutral-700 text-xs px-2.5 py-1.5 rounded-full">',
  '<span key={i} className="flex items-center gap-1.5 bg-neutral-100 text-neutral-700 text-xs px-2.5 py-1.5 rounded-full">'
);
content = content.replace(
  '{opt}',
  '{label}'
);

fs.writeFileSync(path, content);
console.log("Patched products-manager.tsx")
