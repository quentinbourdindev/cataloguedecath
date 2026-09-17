const fs = require('fs');
const path = 'src/components/stepper/devis-stepper.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add state
if (!content.includes('formValidity')) {
  content = content.replace(
    'const [isSubmitted, setIsSubmitted] = useState(',
    'const [formValidity, setFormValidity] = useState({ 2: false, 3: false })\n  const [isSubmitted, setIsSubmitted] = useState('
  );
}

// 2. Add onValidityChange to StepContact
content = content.replace(
  '<StepContact\n            initialData={contactData}\n            readonly={isReadonly}\n            onValidate={(data) => {',
  '<StepContact\n            initialData={contactData}\n            readonly={isReadonly}\n            onValidityChange={(v) => setFormValidity(p => ({ ...p, 2: v }))}\n            onValidate={(data) => {'
);

// 3. Add onValidityChange to StepLogistique
content = content.replace(
  '<StepLogistique\n            initialData={logisticsData}\n            readonly={isReadonly}\n            onValidate={(data) => {',
  '<StepLogistique\n            initialData={logisticsData}\n            readonly={isReadonly}\n            onValidityChange={(v) => setFormValidity(p => ({ ...p, 3: v }))}\n            onValidate={(data) => {'
);

// 4. Update the Next button disabled state
const disabledLogic = `disabled={
              (currentStep === 2 && !formValidity[2]) ||
              (currentStep === 3 && !formValidity[3])
            }`;

content = content.replace(
  'className="flex items-center gap-2 bg-neutral-950 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral-800 transition-colors"',
  disabledLogic + '\n            className="flex items-center gap-2 bg-neutral-950 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"'
);

fs.writeFileSync(path, content);
console.log("Patched devis-stepper.tsx");
