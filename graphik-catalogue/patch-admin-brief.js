const fs = require('fs');
const path = 'src/components/admin/brief-editor.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('Paperclip')) {
  content = content.replace(
    'Trash2 }',
    'Trash2, Paperclip }'
  );
}

content = content.replace(
  '{CATEGORY_LABELS[line.product.category]}\\n                        </p>\\n                      )}',
  `{CATEGORY_LABELS[line.product.category]}
                        </p>
                      )}
                      
                      {line.attachmentUrl && (
                        <a href={line.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-2 py-1 mt-1 bg-blue-50 text-blue-600 rounded text-xs font-medium hover:bg-blue-100 transition-colors">
                          <Paperclip className="w-3 h-3" />
                          Pièce jointe client
                        </a>
                      )}`
);

fs.writeFileSync(path, content);
console.log("Patched admin brief-editor");
