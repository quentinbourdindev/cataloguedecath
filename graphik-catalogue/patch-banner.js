const fs = require('fs');
let content = fs.readFileSync('src/components/catalogue/readonly-banner.tsx', 'utf8');

// 1. Add briefId to props
content = content.replace(
  'interface ReadonlyBannerProps {',
  'interface ReadonlyBannerProps {\n  briefId: string'
);
content = content.replace(
  'export function ReadonlyBanner({ status, storeName }: ReadonlyBannerProps) {',
  'import { FileDown } from "lucide-react"\n\nexport function ReadonlyBanner({ status, storeName, briefId }: ReadonlyBannerProps) {'
);

// 2. Add buttons on the right side
const buttonsHtml = `
      <div className="ml-auto flex items-center gap-2 shrink-0">
        <a
          href={\`/api/briefs/\${briefId}/pdf\`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg hover:bg-neutral-50 transition-colors shadow-sm"
        >
          <FileDown className="w-3.5 h-3.5" />
          PDF
        </a>
        <a
          href={\`/api/briefs/\${briefId}/word\`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg hover:bg-neutral-50 transition-colors shadow-sm"
        >
          <FileDown className="w-3.5 h-3.5" />
          Word
        </a>
      </div>
    </div>
  )
}
`;

content = content.replace(
  '    </div>\n  )\n}',
  buttonsHtml
);

fs.writeFileSync('src/components/catalogue/readonly-banner.tsx', content);
console.log("Patched readonly-banner.tsx")
