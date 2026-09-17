const fs = require('fs');
const path = 'src/components/catalogue/custom-request-card.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Make the main card wrapper stretch vertically
content = content.replace(
  'className="flex flex-col sm:flex-row gap-6 bg-white border-2 border-dashed border-neutral-300 rounded-2xl overflow-hidden hover:border-neutral-400 hover:shadow-lg hover:shadow-neutral-200/40 transition-all p-6"',
  'className="flex flex-col sm:flex-row gap-6 bg-white border-2 border-dashed border-neutral-300 rounded-2xl overflow-hidden hover:border-neutral-400 hover:shadow-lg hover:shadow-neutral-200/40 transition-all p-6 min-h-[60vh] lg:min-h-[500px]"'
);

// 2. Update the Description div to grow
content = content.replace(
  '<div>\\n          <label className="text-[11px] font-bold text-neutral-500 mb-1.5 block uppercase tracking-wider">Description de votre besoin *</label>\\n          <textarea',
  '<div className="flex flex-col flex-1">\\n          <label className="text-[11px] font-bold text-neutral-500 mb-1.5 block uppercase tracking-wider">Description de votre besoin *</label>\\n          <textarea'
);

// 3. Make textarea flex-1 instead of h-24
content = content.replace(
  'focus:ring-neutral-950 resize-none h-24"',
  'focus:ring-neutral-950 resize-none flex-1 min-h-[120px]"'
);

fs.writeFileSync(path, content);
console.log("Patched card height");
