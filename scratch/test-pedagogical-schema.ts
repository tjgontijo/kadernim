import { validatePedagogicalContent } from '../src/lib/resources/schemas/pedagogical-schemas';

const validData = {
  objectives: [
    { id: 'a9aa199a-ca94-40ca-aa9b-e6e9d7e53915', text: 'Desenvolver raciocínio lógico em matemática.', order: 1 }
  ],
  steps: [
    {
      id: 'a9aa199a-ca94-40ca-aa9b-e6e9d7e53916',
      type: 'DISCUSSION',
      title: 'Introdução ao Tema',
      duration: '15 min',
      content: 'Discussão inicial sobre o que os alunos conhecem de frações.',
      order: 1
    }
  ]
};

const invalidData = {
  objectives: [], // min(1) should fail
  steps: []
};

console.log('--- TEST: VALID DATA ---');
const resultValid = validatePedagogicalContent(validData);
console.log('Success:', resultValid.success);
if (!resultValid.success) console.log('Errors:', resultValid.error.format());

console.log('\n--- TEST: INVALID DATA ---');
const resultInvalid = validatePedagogicalContent(invalidData);
console.log('Success:', resultInvalid.success);
if (!resultInvalid.success) {
    console.log('Errors (Formatted):', JSON.stringify(resultInvalid.error.format(), null, 2));
}
