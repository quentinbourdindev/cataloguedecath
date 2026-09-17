const fs = require('fs');
const path = 'src/components/catalogue/custom-request-card.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'filename: file.name,',
  'fileName: file.name,'
);

content = content.replace(
  'const { url, key } = await presignRes.json()',
  'const { uploadUrl, fileUrl } = await presignRes.json()'
);

content = content.replace(
  'const uploadRes = await fetch(url, {',
  'const uploadRes = await fetch(uploadUrl, {'
);

content = content.replace(
  'attachmentUrl = `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`',
  'attachmentUrl = fileUrl'
);

fs.writeFileSync(path, content);
console.log("Patched custom-request-card.tsx");
