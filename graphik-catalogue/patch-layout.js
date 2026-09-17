const fs = require('fs');
let clientPath = 'src/components/catalogue/catalogue-client.tsx';
let cardPath = 'src/components/catalogue/custom-request-card.tsx';

let clientCode = fs.readFileSync(clientPath, 'utf8');
clientCode = clientCode.replace(
  '<div className="flex-1 min-w-0">',
  '<div className="flex-1 min-w-0 flex flex-col">'
);
clientCode = clientCode.replace(
  '{activeCategory && (categories[activeCategory] || activeCategory === "SUR_MESURE") && (\\n            <div>',
  '{activeCategory && (categories[activeCategory] || activeCategory === "SUR_MESURE") && (\\n            <div className="flex-1 flex flex-col pb-12">'
);
clientCode = clientCode.replace(
  '<div className="w-full">\\n                  <CustomRequestCard',
  '<div className="w-full flex-1 flex flex-col">\\n                  <CustomRequestCard'
);
fs.writeFileSync(clientPath, clientCode);

let cardCode = fs.readFileSync(cardPath, 'utf8');
cardCode = cardCode.replace(
  'transition-all p-6 min-h-[400px] lg:min-h-[450px]"',
  'transition-all p-6 flex-1"'
);
fs.writeFileSync(cardPath, cardCode);

console.log("Patched flex layout");
