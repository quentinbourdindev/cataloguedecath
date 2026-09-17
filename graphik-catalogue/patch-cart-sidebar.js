const fs = require('fs');
const path = 'src/components/catalogue/cart-sidebar.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('Paperclip')) {
  content = content.replace(
    'Trash2,',
    'Trash2, Paperclip,'
  );
}

content = content.replace(
  '{line.selectedOption && (\\n                      <p className="text-xs text-neutral-400">{line.selectedOption}</p>\\n                    )}',
  `{line.selectedOption && (
                      <p className="text-xs text-neutral-400">{line.selectedOption}</p>
                    )}
                    {line.attachmentUrl && (
                      <a href={line.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 mt-1 transition-colors">
                        <Paperclip className="w-3 h-3" />
                        Pièce jointe
                      </a>
                    )}`
);

fs.writeFileSync(path, content);
console.log("Patched cart-sidebar.tsx");
