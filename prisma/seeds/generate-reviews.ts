import { PrismaClient } from '@db/client';
import { fakerPT_BR as faker } from '@faker-js/faker';

const TEACHER_COMMENTS = [
  "Material excelente! Usei na minha turma de 2º ano e eles ficaram super engajados. 😍",
  "Amei a proposta lúdica. Facilitou muito a explicação de frações.",
  "Muito bem organizado e as ilustrações são de altíssima qualidade. Recomendo!",
  "Achei o conteúdo um pouco denso para o 1º ano, mas adaptei e funcionou bem.",
  "Simplesmente perfeito! Salvou meu planejamento de sexta-feira. Gratidão! 🙏✨",
  "Os alunos amaram o desafio. É difícil encontrar materiais assim tão completos.",
  "Qualidade impecável do PDF. Imprime super bem e as cores são lindas.",
  "Poderia ter mais uma página de exercícios, mas no geral é nota 10.",
  "Uma das melhores aquisições que fiz este ano para minhas aulas de matemática.",
  "O link com a BNCC está perfeito, facilitou muito meu registro no diário.",
  "Material didático, criativo e muito prático. Parabéns pelo trabalho!",
  "Minhas crianças pediram para repetir a atividade no dia seguinte! Sucesso total. 🚀",
  "Uso sempre os materiais dessa autora. Nunca decepcionam.",
  "Estava com dificuldade de ensinar esse tópico, mas esse recurso clareou tudo.",
  "Muito bom! Só senti falta de um gabarito no final, mas o conteúdo é ótimo."
];

export async function seedReviews(prisma: PrismaClient) {
  console.log('📝 Gerando Avaliações Sociais Realísticas...');

  // 1. Criar 30 usuários fictícios (professores)
  const users = [];
  for (let i = 0; i < 30; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    
    // Tentamos usar upsert para evitar duplicatas de email se rodar 2x
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: `${firstName} ${lastName}`,
        email,
        roleTitle: faker.helpers.arrayElement([
          'Professora Alfabetizadora',
          'Pedagoga',
          'Prof. de Matemática',
          'Coordenadora Escolar',
          'Estudante de Pedagogia'
        ]),
        location: `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
        image: faker.image.avatar()
      }
    });
    users.push(user);
  }

  const resources = await prisma.resource.findMany(); // Pega todos os recursos
  console.log(`💬 Distribuindo avaliações para ${resources.length} recursos...`);

  for (const resource of resources) {
    // Cada recurso recebe entre 2 e 6 reviews
    const numReviews = faker.number.int({ min: 2, max: 8 });
    const selectedUsers = faker.helpers.arrayElements(users, numReviews);

    for (const user of selectedUsers) {
      await prisma.review.upsert({
        where: { 
          resourceId_userId: { resourceId: resource.id, userId: user.id } 
        },
        update: {
          rating: faker.helpers.weightedArrayElement([
            { weight: 70, value: 5 },
            { weight: 20, value: 4 },
            { weight: 10, value: 3 }
          ]),
          comment: faker.helpers.arrayElement(TEACHER_COMMENTS),
          status: 'APPROVED'
        },
        create: {
          resourceId: resource.id,
          userId: user.id,
          rating: faker.helpers.weightedArrayElement([
            { weight: 70, value: 5 },
            { weight: 20, value: 4 },
            { weight: 10, value: 3 }
          ]),
          comment: faker.helpers.arrayElement(TEACHER_COMMENTS),
          status: 'APPROVED'
        }
      });
    }

    // Atualizar o cache de média no resource
    const stats = await prisma.review.aggregate({
      where: { resourceId: resource.id, status: 'APPROVED' },
      _avg: { rating: true },
      _count: { id: true },
    });

    await prisma.resource.update({
      where: { id: resource.id },
      data: {
        averageRating: stats._avg.rating || 4.5,
        reviewCount: stats._count.id || 0,
      }
    });
  }

  console.log('✅ Avaliações geradas com sucesso!');
}
