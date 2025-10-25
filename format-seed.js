const fs = require('fs');
const path = 'prisma/seeds/data-resources.ts';
const raw = fs.readFileSync(path, 'utf8');
const prefix = 'export const resourcesData = ';
if (!raw.startsWith(prefix)) throw new Error('unexpected format');
let jsonText = raw.slice(prefix.length).trim();
if (!jsonText.endsWith(']')) {
  jsonText = jsonText.replace(/,\s*$/, '');
  jsonText += ']';
}
const array = JSON.parse(jsonText);
const cleaned = array.map(item => {
  const { featured, ...rest } = item;
  return rest;
});
const output = prefix + JSON.stringify(cleaned, null, 4) + '\n';
fs.writeFileSync(path, output);
