const fs = require('fs');
const path = 'prisma/seeds/data-resources.ts';
const raw = fs.readFileSync(path, 'utf8');
const prefix = 'export const resourcesData = ';
const jsonText = raw.slice(prefix.length).trim();
const resources = JSON.parse(jsonText);
const slugToName = {
  portugues: 'Português',
  matematica: 'Matemática',
  ciencias: 'Ciências',
  historia: 'História',
  geografia: 'Geografia',
  artes: 'Artes',
  'educacao-fisica': 'Educação Física',
  ingles: 'Inglês',
  socioemocional: 'Socioemocional',
  administrativo: 'Administrativo',
  planejamento: 'Planejamento',
  'datas-especiais': 'Datas Especiais'
};
const levelSlugToName = {
  infantil: 'Educação Infantil',
  'fundamental-i': 'Fundamental I',
  'fundamental-ii': 'Fundamental II',
  docente: 'Docente'
};
const updated = resources.map(item => {
  const subjectName = slugToName[item.subjectSlug];
  const educationLevelName = levelSlugToName[item.educationLevelSlug];
  if (!subjectName || !educationLevelName) {
    throw new Error(`Missing mapping for ${item.subjectSlug} / ${item.educationLevelSlug}`);
  }
  const { subjectSlug, educationLevelSlug, ...rest } = item;
  return {
    ...rest,
    subjectName,
    educationLevelName
  };
});
const output = prefix + JSON.stringify(updated, null, 4) + '\n';
fs.writeFileSync(path, output);
