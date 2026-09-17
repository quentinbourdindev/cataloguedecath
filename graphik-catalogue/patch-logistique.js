const fs = require('fs');
const path = 'src/components/stepper/step-logistique.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Import useEffect
if (!content.includes('useEffect')) {
  content = content.replace(
    'import { useForm, Controller } from "react-hook-form"',
    'import { useEffect } from "react"\nimport { useForm, Controller } from "react-hook-form"'
  );
}

// 2. Props
content = content.replace(
  'onValidate: (data: BriefLogisticsValues) => void',
  'onValidate: (data: BriefLogisticsValues) => void\n  onValidityChange?: (isValid: boolean) => void'
);
content = content.replace(
  'export function StepLogistique({ initialData, readonly, onValidate }: StepLogistiqueProps) {',
  'export function StepLogistique({ initialData, readonly, onValidate, onValidityChange }: StepLogistiqueProps) {'
);

// 3. Form config
content = content.replace(
  'formState: { errors },',
  'formState: { errors, isValid },'
);
content = content.replace(
  'defaultValues: initialData ?? {',
  'mode: "onChange",\n    defaultValues: initialData ?? {'
);

// 4. useEffect
content = content.replace(
  'const installationByGraphik = watch("installationByGraphik")',
  `const installationByGraphik = watch("installationByGraphik")\n\n  useEffect(() => {\n    onValidityChange?.(isValid)\n  }, [isValid, onValidityChange])`
);

fs.writeFileSync(path, content);
console.log("Patched step-logistique.tsx");
