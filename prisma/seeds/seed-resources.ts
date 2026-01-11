import type { PrismaClient } from '../generated/prisma/client'
import { prisma } from '../../src/lib/db'
import { uploadImageFromUrl } from '../../src/server/clients/cloudinary/image-client'

export interface ResourceSeedItem {
  title: string
  imageUrl: string
  educationLevel: string
  subject: string
  isFree?: boolean
  externalId: number
}

const RESOURCES: ResourceSeedItem[] = [
  {
    title: '40 Páginas de Atividades de Matemática para 5º ANO',
    imageUrl:
      'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/40-paginas-de-atividades-de-matematica-para-5o-ano-676d5f6f5c159-medium.png',
    educationLevel: 'ensino-fundamental-1',
    subject: 'matematica',
    externalId: 37235525,
  },
  {
    title: '50 Cards - Escrita mágica',
    imageUrl:
      'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/50-cards-escrita-magica-661559362aee1-medium.png',
    educationLevel: 'ensino-fundamental-1',
    subject: 'lingua-portuguesa',
    externalId: 30200121,
  },
  {
    title: '50 frases e expressões para relatórios descritivos',
    imageUrl:
      'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/50-frases-e-expressoes-para-relatorios-descritivos-66129585751ea-medium.png',
    educationLevel: 'ensino-fundamental-1',
    subject: 'planejamento',
    isFree: true,
    externalId: 30201120,
  },
  // {
  //   title: 'Álbum de figurinhas - desvendando enigmas',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/album-de-figurinhas-desvendando-enigmas-6612948a4f2cf-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'matematica',
  //   externalId: 30201083,
  // },
  // {
  //   title: 'Alfabeto Cursivo',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/alfabeto-cursivo-66676628d6323-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'lingua-portuguesa',
  //   externalId: 32970420,
  // },
  // {
  //   title: 'Alfabeto em Pixel Art',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/alfabeto-em-pixel-art-68c097fc8a5cc-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 42219116,
  // },
  // {
  //   title: 'Apostila Alfabeto Fônico',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/apostila-alfabeto-fonico-667063ac591af-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'lingua-portuguesa',
  //   externalId: 33192369,
  // },
  // {
  //   title: 'Apostila Atividades Festa Junina',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/apostila-atividades-festa-junina-666748382d1e7-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'data-importante',
  //   externalId: 32967105,
  // },
  // {
  //   title: 'Apostila Consciência Fonológica',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/atividades-consiencia-fonologica-667222e1ca364-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'lingua-portuguesa',
  //   externalId: 33249797,
  // },
  // {
  //   title: 'Apostila de Atividades do Folclore',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/apostila-de-atividades-do-folclore-66be9f499f6c9-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'data-importante',
  //   externalId: 34801248,
  // },
  // {
  //   title: 'Apostila de Atividades Sílabas Complexas',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/organize-as-silabas-silabas-complexas-66674b2c8ffc3-medium.jpg',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 32967425,
  // },
  // {
  //   title: 'Apostila Família Silábica Simples',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/atividades-de-alfabetizacao-com-familias-silabicas-simples-66609f88c060c-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'lingua-portuguesa',
  //   externalId: 32801347,
  // },
  // {
  //   title: 'Apostila Famílias Silábicas - Complete',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/apostila-familias-silabicas-complete-66880a5b8b383-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'lingua-portuguesa',
  //   externalId: 33746900,
  // },
  // {
  //   title: 'Apostila Interpretação de Textos',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/aventuras-na-leitura-textos-e-atividades-de-interpretacao-para-criancas-665f619c31726-medium.jpg',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 32762140,
  // },
  // {
  //   title: 'Apostila Numerais de 1 a 20',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/apostila-de-numerais-de-1-a-20-para-educacao-infantil-e-fundamental-6660a45898fed-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'matematica',
  //   externalId: 32802615,
  // },
  // {
  //   title: 'As 4 Operações Matemática em Pixel Art',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/as-4-operacoes-matematica-em-pixel-art-6682bed79c121-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'matematica',
  //   externalId: 33612530,
  // },
  // {
  //   title: 'Atividade Digital de Encontro Consonantal - R e L: Recurso Pedagógico Interativo',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/atividade-digital-de-encontro-consonantal-r-e-l-recurso-pedagogico-interativo-661559c81ec30-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 30200143,
  // },
  // {
  //   title: 'Atividade Eu Sou Assim',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/eu-sou-assim-66659e315a738-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'lingua-portuguesa',
  //   externalId: 32923728,
  // },
  // {
  //   title: 'Atividade Interativa - Formação de palavras',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/atividade-interativa-formacao-de-palavras-661559587c4ac-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 30200127,
  // },
  // {
  //   title: 'Atividade Interativa - Início do outono',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/atividade-interativa-inicio-do-outono-6616f3e4070b1-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'data-importante',
  //   externalId: 30366028,
  // },
  // {
  //   title: 'Atividade Interativa - Livro dos Sistemas Humanos',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/atividade-interativa-livro-dos-sistemas-humanos-66435da307cd2-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'ciencias',
  //   externalId: 31865123,
  // },
  // {
  //   title: 'Atividade Interativa - Voltas às Aulas - Tudo Sobre Mim',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/atividade-interativa-voltas-as-aulas-tudo-sobre-mim-6773f80e280ff-medium.jpg',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'data-importante',
  //   externalId: 37914331,
  // },
  // {
  //   title: 'Atividade Interativa Dia Internacional da Mulher - 8 de Março',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/atividade-interativa-dia-internacional-da-mulher-8-de-marco-6616cc473d373-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'data-importante',
  //   externalId: 30354472,
  // },
  // {
  //   title: 'Atividade Interativa- Livro dos Sistemas Humanos',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/atividade-interativa-livro-dos-sistemas-humanos-67c70e3cde6d2-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'ciencias',
  //   externalId: 39305065,
  // },
  // {
  //   title: 'Atividade Povos Indígenas do Brasil',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/atividade-povos-indigenas-do-brasil-6616ac6609544-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'data-importante',
  //   externalId: 30347427,
  // },
  // {
  //   title: 'Atividade Proclamação da República',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/atividade-proclamacao-da-republica-66169f85e65ce-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'data-importante',
  //   externalId: 30345127,
  // },
  // {
  //   title: 'Atividade Setembro Amarelo - Conscientização no Ensino Fundamental',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/atividade-setembro-amarelo-conscientizacao-no-ensino-fundamental-66169e492753a-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'data-importante',
  //   externalId: 30343622,
  // },
  // {
  //   title: 'Atividade Vaso de Flor Dia da Mulher - Homenagem Criativa',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/atividade-vaso-de-flor-dia-da-mulher-homenagem-criativa-6616cdd918c8e-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'data-importante',
  //   externalId: 30355549,
  // },
  // {
  //   title: 'Atividades de Gêneros & Narrativa 5º Ano',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/atividades-de-generos-narrativa-5o-ano-68b9889b590c7-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 42156695,
  // },
  // {
  //   title: 'Atividades de Gramática Avançada 5º Ano',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/atividades-de-gramatica-avancada-5o-ano-68b98b01ed3d9-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 42156742,
  // },
  // {
  //   title: 'Atividades de Gramática Base 5º Ano',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/atividades-de-gramatica-base-5o-ano-68b98dd713804-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 42156785,
  // },
  // {
  //   title: 'Atividades de Ortografia Certa 5º Ano',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/atividades-de-ortografia-certa-5o-ano-68b99041159a4-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 42156811,
  // },
  // {
  //   title: 'atividades-portugues-folhinhas-parte-i-1o-ao-5o-ano',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/atividades-portugues-folhinhas-parte-i-1o-ao-5o-ano-663a9ce761f66-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 31566073,
  // },
  // {
  //   title: 'Atividades Português 5º Ano Acervo Essencial',
  //   imageUrl: 'https://king-assets.yampi.me/dooki/68b8535f66991/68b8535f66999.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 42153812,
  // },
  // {
  //   title: 'Avaliação ciências - 4º bimestre - 4º ano',
  //   imageUrl: 'https://king-assets.yampi.me/dooki/68daf43ea8b54/68daf43ea8b5d.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'ciencias',
  //   externalId: 42478068,
  // },
  // {
  //   title: 'Avaliação ciências - 4º bimestre - 5º ano',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/avaliacao-ciencias-4o-bimestre-5o-ano-68c9c2200372f-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'ciencias',
  //   externalId: 42311388,
  // },
  // {
  //   title: 'Avaliação Geografia - 4º bimestre - 5º ano',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/avaliacao-geografia-4o-bimestre-5o-ano-68c9c58125e51-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'geografia',
  //   externalId: 42313389,
  // },
  // {
  //   title: 'Avaliação Geografia 4º bimestre 4º ano',
  //   imageUrl: 'https://king-assets.yampi.me/dooki/68db17262d045/68db17262d04c.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'geografia',
  //   externalId: 42479572,
  // },
  // {
  //   title: 'Avaliação história - 4º bimestre - 5º ano',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/avaliacao-historia-4o-bimestre-5o-ano-68c9c863896bd-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'historia',
  //   externalId: 42315251,
  // },
  // {
  //   title: 'Avaliação história 4º bimestre 4º ano',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/avaliacao-historia-4o-bimestre-4o-ano-68db19387ddc8-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'historia',
  //   externalId: 42479601,
  // },
  // {
  //   title: 'Avaliação matemática - 4º Bimestre - 5º ano',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/avaliacao-matematica-4o-bimestre-5o-ano-68c9cc84c7a55-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'matematica',
  //   externalId: 42317126,
  // },
  // {
  //   title: 'Avaliação matemática 4º bimestre 4º ano',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/avaliacao-matematica-4o-bimestre-4o-ano-68db1496d3853-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'matematica',
  //   externalId: 42479330,
  // },
  // {
  //   title: 'Avaliação português - 4º Bimestre - 5º ano',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/avaliacao-portugues-4o-bimestre-5o-ano-68c9ce62f2305-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 42317283,
  // },
  // {
  //   title: 'Avaliação português 4º bimestre 4º ano',
  //   imageUrl: 'https://king-assets.yampi.me/dooki/68db0e091fdf6/68db0e091fdff.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 42479069,
  // },
  // {
  //   title: 'Bingo Junino',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/bingo-junino-diversao-e-aprendizado-para-criancas-66577f29defca-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'data-importante',
  //   externalId: 32556256,
  // },
  // {
  //   title: 'Caixinhas 3D Páscoa',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/caixinhas-3d-pascoa-67f4539915b29-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'data-importante',
  //   externalId: 39952412,
  // },
  // {
  //   title: 'Capas de Caderno',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/capas-de-caderno-6616937d4a4c9-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'planejamento',
  //   externalId: 30201068,
  // },
  // {
  //   title: 'Cards do Substantivo',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/cards-do-substantivo-68d18e8e58e2b-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 30200131,
  // },
  // {
  //   title: 'Cartão Jardim 3D',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/cartao-jardim-3d-666746e42992d-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'data-importante',
  //   externalId: 32965409,
  // },
  // {
  //   title: 'Cartão Pop UP - Encontro de culturas: a chegada dos Portugueses ao Brasil',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/encontro-de-culturas-a-chegada-dos-portugueses-ao-brasil-661e890079449-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'data-importante',
  //   externalId: 30620983,
  // },
  // {
  //   title: 'Cartão Surpresa dia dos Pais',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/cartao-surpresa-dia-dos-pais-6616c57ac915f-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'data-importante',
  //   externalId: 30353503,
  // },
  // {
  //   title: 'Cartaz Número do Dia',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/cartaz-numero-do-dia-664d38ebcf9cc-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'matematica',
  //   externalId: 32169562,
  // },
  // {
  //   title: 'Casinha do Alfabeto',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/casinha-do-alfabeto-6615598324006-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 30200132,
  // },
  // {
  //   title: 'Casinha dos Números',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/casinha-dos-numeros-sequencia-numerica-para-educacao-infantil-6653c9885342e-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'matematica',
  //   externalId: 32439709,
  // },
  // {
  //   title: 'Combo Folhinhas Português + Bônus Atividades',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/combo-folhinhas-portugues-bonus-atividades-6679b20224b0f-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 33408866,
  // },
  // {
  //   title: 'Combo Páscoa',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/combo-pascoa-6616d0e531d41-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'data-importante',
  //   externalId: 30356118,
  // },
  // {
  //   title: 'Começo Brilhante - Planos de aula para a 1ª Semana (1º ano)',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/comeco-brilhante-planos-de-aula-para-a-1a-semana-1o-ano-679cf21666212-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'planejamento',
  //   externalId: 38492181,
  // },
  // {
  //   title: 'Começo Brilhante - Planos de aula para a 1ª Semana (2º ano)',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/comeco-brilhante-planos-de-aula-para-a-1a-semana-2o-ano-679ba0263ed2c-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'planejamento',
  //   externalId: 38471695,
  // },
  // {
  //   title: 'Começo Brilhante - Planos de aula para a 1ª Semana (3º ano)',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/comeco-brilhante-planos-de-aula-para-a-1a-semana-3o-ano-679a2705e04c1-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'planejamento',
  //   externalId: 38442965,
  // },
  // {
  //   title: 'Começo Brilhante - Planos de aula para a 1ª Semana (4º ano)',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/comeco-brilhante-planos-de-aula-para-a-1a-semana-4o-ano-679a00e6dc817-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'planejamento',
  //   externalId: 38433983,
  // },
  // {
  //   title: 'Começo Brilhante - Planos de aula para a 1ª Semana (5º ano)',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/comeco-brilhante-planos-de-aula-para-a-1a-semana-5o-ano-679a0346054a6-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'planejamento',
  //   externalId: 38430779,
  // },
  // {
  //   title: 'Contando Sílabas',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/arquivo-contando-silabas-desenvolvendo-a-consciencia-fonologica-6654b4d7eb690-medium.jpg',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 32459349,
  // },
  // {
  //   title: 'Conto de Terror interativo',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/conto-de-terror-interativo-6615599a3a002-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 30200135,
  // },
  // {
  //   title: 'Criando Frases',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/kit-criando-frases-aprender-e-brincar-6666352ba7aa2-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'lingua-portuguesa',
  //   externalId: 32942405,
  // },
  // {
  //   title: 'Dia da árvore',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/dia-da-arvore-68c18a540fe7c-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'data-importante',
  //   externalId: 42229493,
  // },
  // {
  //   title: 'Dia das Crianças - Cartão com Blister - Lembrancinha',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/dia-das-criancas-cartao-com-blister-lembrancinha-66fe6972dfa5c-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'data-importante',
  //   externalId: 36010554,
  // },
  // {
  //   title: 'Escrita mágica 50 folhinhas com comandos para pequenos escritores',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/escrita-magica-50-folhinhas-com-comandos-para-pequenos-escritores-661559e42f377-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 30200243,
  // },
  // {
  //   title: 'Explorando Emoções: Atividades Interativas Inspiradas em Divertidamente',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/explorando-emocoes-atividades-interativas-inspiradas-em-divertidamente-6686bdcf8a5f6-medium.jpg',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'arte',
  //   externalId: 33721430,
  // },
  // {
  //   title: 'Folhinhas de Conceito - Gênero Textual - 1º ao 5º ano',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/folhinhas-de-conceito-genero-textual-1o-ao-5o-ano-6615609e5f652-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 30296625,
  // },
  // {
  //   title: 'Folhinhas de Conceito - Matemática 1º ao 5º ano',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/folhinhas-de-conceito-matematica-1o-ao-5o-ano-66155b16c97ae-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'matematica',
  //   externalId: 30107631,
  // },
  // {
  //   title: 'Folhinhas de conceito Prevenção à Dengue',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/folhinhas-de-conceito-prevencao-a-dengue-6616920c0efa5-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'data-importante',
  //   externalId: 30200991,
  // },
  // {
  //   title: 'Folhinhas de Conceitos - Português - Parte I - 1º ao 5º ano',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/folhinhas-conceito-de-portugues-1o-ao-5o-ano-661558fb2a3f6-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 30100557,
  // },
  // {
  //   title: 'Folhinhas de Conceitos - Português - Parte II - 1º ao 5º ano',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/folhinhas-de-conceitos-portugues-parte-ii-atividades-ludicas-em-pdf-para-ensino-fundamental-i-662fbc21e4441-medium.jpeg',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 31219018,
  // },
  // {
  //   title: 'Folhinhas de Conceitos Datas Comemorativas/Sazonais',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/folhinhas-de-conceitos-datas-comemorativassazonais-6811445cde70e-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'data-importante',
  //   externalId: 40339636,
  // },
  // {
  //   title: 'Folhinhas de conceitos de ciências',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/folhinhas-de-conceitos-de-ciencias-6615571234e3c-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 30201437,
  // },
  // {
  //   title: 'Folhinhas de conceitos de Geografia para o 1º ao 5º ano',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/folhinhas-de-conceitos-de-geografia-para-o-1o-ao-5o-ano-66126a6fbb258-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'geografia',
  //   externalId: 30200115,
  // },
  // {
  //   title: 'Folhinhas de conceitos História',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/folhinhas-de-conceitos-historia-661557512d84a-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'historia',
  //   externalId: 30201143,
  // },
  // {
  //   title: 'Fração em Pixel Art',
  //   imageUrl: 'https://king-assets.yampi.me/dooki/68bcbc2a2d207/68bcbc2a2d20d.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'matematica',
  //   externalId: 42181865,
  // },
  // {
  //   title: 'Frase Misteriosa',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/frase-misteriosa-6675f304076d3-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'lingua-portuguesa',
  //   externalId: 33350543,
  // },
  // {
  //   title: 'Gênero Textual: Conto de Fadas',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/genero-textual-conto-de-fadas-66155a0d4ecda-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 30200826,
  // },
  // {
  //   title: 'Gênero Textual: Reportagem',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/genero-textual-reportagem-66155a242e8bc-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 30200830,
  // },
  // {
  //   title: 'Histórias Para Missões Literárias',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/40-historinhas-para-fichas-literarias-68b862e770a3c-medium.jpg',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 40651167,
  // },
  // {
  //   title: 'Interpretação de Frases',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/interpretacao-de-frases-668ff3d07ed59-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'lingua-portuguesa',
  //   externalId: 33915782,
  // },
  // {
  //   title: 'Interpretando Textos (3º ano)',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/interpretando-textos-3o-ano-67af3d0e9b309-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 38768242,
  // },
  // {
  //   title: 'Interpretando Textos 4°ano',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/interpretando-textos-40ano-67c20439035cc-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 39255572,
  // },
  // {
  //   title: 'Interpretando Textos 5°ano',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/interpretando-textos-50ano-67cb42720f634-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 39382017,
  // },
  // {
  //   title: 'Jogo da Memória Folclore',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/jogo-da-memoria-folclore-66be9b5dcf14e-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'data-importante',
  //   externalId: 34800521,
  // },
  // {
  //   title: 'Jogos da Memória - S/SS e R/RR',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/jogos-da-memoria-sss-e-rrr-66155a47e51ea-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 30200840,
  // },
  // {
  //   title: 'Kit de Atividades do Folclore',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/kit-de-atividades-do-folclore-66bea29eb1f6b-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'data-importante',
  //   externalId: 34801637,
  // },
  // {
  //   title: 'Kit de Férias Criativas: Desafio de Recesso e Pintura Anti-Stress',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/kit-de-ferias-criativas-desafio-de-recesso-e-pintura-anti-stress-6686b6ef82f46-medium.jpg',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'data-importante',
  //   externalId: 33721093,
  // },
  // {
  //   title: 'Kit Dia da Consciência Negra',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/conciencia-negra-6616bdab891c8-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'data-importante',
  //   externalId: 30350749,
  // },
  // {
  //   title: 'Kit Dia dos Professores',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/kit-dia-dos-professores-68e3c3a145479-thumb.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'data-importante',
  //   externalId: 42560107,
  // },
  // {
  //   title: 'Kit Interativo- Alimentação saudável',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/kit-interativo-alimentacao-saudavel-67cf0184a9dfa-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'ciencias',
  //   externalId: 39420230,
  // },
  // {
  //   title: 'Kit Natal',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/kit-natal-6750666ad4046-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'data-importante',
  //   externalId: 37450127,
  // },
  // {
  //   title: 'Lapbook Alfabeto',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/lapbook-do-alfabeto-666b3e590d98f-medium.jpg',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 33071521,
  // },
  // {
  //   title: 'Lapbook Numerais de 0 a 10',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/lapbook-de-aprendizagem-numerica-665b621967983-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'matematica',
  //   externalId: 32663286,
  // },
  // {
  //   title: 'Lembrança Dia dos Professores',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/lembranca-dia-dos-professores-66fe662adea59-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'data-importante',
  //   externalId: 36010532,
  // },
  // {
  //   title: 'Livrinho Minhas Férias',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/aventuras-de-ferias-interativa-66630a93c6d7e-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'data-importante',
  //   externalId: 32872296,
  // },
  // {
  //   title: 'Manual dos Relatórios',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/manual-dos-relatorios-66674590f2450-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'planejamento',
  //   externalId: 32964447,
  // },
  // {
  //   title: 'Narrativa Criativa - Livro Interativo com Flash Cards',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/narrativa-criativa-livro-interativo-com-flash-cards-66155a6e5eab4-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 30200842,
  // },
  // {
  //   title: 'O Baú dos Tesouros',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/o-bau-dos-tesouros-666738ae65c71-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'lingua-portuguesa',
  //   externalId: 32964026,
  // },
  // {
  //   title: 'O Corpo Humano',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/o-corpo-humano-669ac60cf3424-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'ciencias',
  //   externalId: 34158154,
  // },
  // {
  //   title: 'Oferta de Black Friday Recursos Pedagógicos Português + Bônus',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/oferta-de-black-friday-recursos-pedagogicos-portugues-bonus-673b4dd1071c6-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'data-importante',
  //   externalId: 37081242,
  // },
  // {
  //   title: 'Operação Maluca',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/operacao-maluca-66abd1f23df87-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'matematica',
  //   externalId: 34461430,
  // },
  // {
  //   title: 'Operações Matemáticas em Pixel Art - Divertidamente II',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/operacoes-matematicas-em-pixel-art-divertidamente-ii-67032d0b836a6-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'matematica',
  //   externalId: 34240101,
  // },
  // {
  //   title: 'Operações Matemáticas em Pixel Art Editável - Divertidamente II',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/versao-editavel-das-operacoes-matematicas-em-pixel-art-do-filme-divertidamente-ii-67043720c9d89-medium.jpg',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'matematica',
  //   externalId: 35655266,
  // },
  // {
  //   title: 'Ortografia em Pixel Art',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/ortografia-em-pixel-art-67ef1b392dba6-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 39893386,
  // },
  // {
  //   title: 'Pack com 25 Estampas Criativas para Camisetas e Canecas Personalizadas',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/pack-com-25-estampas-criativas-para-camisetas-e-canecas-personalizadas-661692fea769c-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'planejamento',
  //   externalId: 30201002,
  // },
  // {
  //   title: 'Pareando Palavrinhas',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/pareando-palavrinhas-667464926d00a-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'lingua-portuguesa',
  //   externalId: 33306666,
  // },
  // {
  //   title: 'Pense Rápido',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/pense-rapido-adivinhas-interativas-665e0a39641a7-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'lingua-portuguesa',
  //   externalId: 32719427,
  // },
  // {
  //   title: 'Planner Moranguinho - "Na minha época..."',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/planner-moranguinho-na-minha-epoca-6782bda41794f-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'data-importante',
  //   externalId: 38102381,
  // },
  // {
  //   title: 'Plano de Aula Independência do Brasil',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/plano-de-aula-independencia-do-brasil-atividades-completas-6616d30ca4c60-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'data-importante',
  //   externalId: 30357444,
  // },
  // {
  //   title: 'Plano de aula: A origem dos seres humanos',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/plano-de-aula-a-origem-dos-seres-humanos-67f50965113aa-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'ciencias',
  //   externalId: 39959830,
  // },
  // {
  //   title: 'Plano de aula: Gênero textual Notícia',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/plano-de-aula-genero-textual-noticia-66155a9208e9c-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 30200859,
  // },
  // {
  //   title: 'Plano de aula: O planeta terra e sua Superfície',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/plano-de-aula-o-planeta-terra-e-sua-superficie-66169978a3c1b-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'geografia',
  //   externalId: 30341530,
  // },
  // {
  //   title: 'Projeto Desafio Literário',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/projeto-desafio-literario-presentes-68b808bacc3fb-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 41997313,
  // },
  // {
  //   title: 'Projeto Desvendando Conceitos de Português - Fundamental 1',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/projeto-desvendando-conceitos-de-portugues-fundamental-1-6845a0d50dd46-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 40866795,
  // },
  // {
  //   title: 'Projeto Dia das Mães',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/projeto-dia-das-maes-6616cfe821952-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'data-importante',
  //   externalId: 30356018,
  // },
  // {
  //   title: 'Projeto Leitor do Futuro',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/projeto-leitor-do-futuro-683c2947c81c3-medium.jpeg',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 40860782,
  // },
  // {
  //   title: 'Projeto Literário: Recurso Pedagógico Completo para Professores',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/projeto-literario-6616915f0c279-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 30200883,
  // },
  // {
  //   title: 'Recurso Alfabeto na Caixa',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/recurso-alfabeto-na-caixa-66672ea85b50d-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'lingua-portuguesa',
  //   externalId: 32962574,
  // },
  // {
  //   title: 'Recurso Complete a Frase',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/fichas-educativas-para-alfabetizacao-e-leitura-6660abb3293cc-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'lingua-portuguesa',
  //   externalId: 32804268,
  // },
  // {
  //   title: 'Roda Gigante da Ordem Alfabética',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/roda-gigante-da-ordem-alfabetica-66155aadcaf36-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 30200942,
  // },
  // {
  //   title: 'Roleta dos Números',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/roleta-dos-numeros-66ae4398555cb-medium.png',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'matematica',
  //   externalId: 34501242,
  // },
  // {
  //   title: 'Sistema de Recompensas - Realis',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/sistema-de-recompensas-realis-67d4336e35cbd-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'matematica',
  //   externalId: 39530909,
  // },
  // {
  //   title: 'Tabuada',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/tabuada-66b11080853e2-medium.jpg',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'matematica',
  //   externalId: 34546068,
  // },
  // {
  //   title: 'Tangram',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/tangram-668301b14c6d2-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'matematica',
  //   externalId: 33625961,
  // },
  // {
  //   title: 'Traçando os Numerais',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-didatica/uploads/images/tracando-os-numerais-664d31fc3b962-medium.jpg',
  //   educationLevel: 'educacao-infantil',
  //   subject: 'matematica',
  //   externalId: 32219233,
  // },
  // {
  //   title: 'Uso de CH, NH e LH',
  //   imageUrl:
  //     'https://images.yampi.me/assets/stores/prof-paper-recursos-pedagogicos/uploads/images/uso-de-ch-nh-e-lh-66155ac3eccad-medium.png',
  //   educationLevel: 'ensino-fundamental-1',
  //   subject: 'lingua-portuguesa',
  //   externalId: 30200956,
  // },
]

export async function seedResources(prisma: PrismaClient) {
  console.log('🌱 Populando resources...')

  // Buscar todos os níveis e matérias para mapear slugs -> IDs
  const [dbLevels, dbSubjects] = await Promise.all([
    prisma.educationLevel.findMany(),
    prisma.subject.findMany()
  ])

  const levelMap = new Map(dbLevels.map(l => [l.slug, l.id]))
  console.log('Seeding resources...')

  for (const res of RESOURCES) {
    // 1. Resolve EducationLevel and Subject
    const [level, sub] = await Promise.all([
      prisma.educationLevel.findUnique({ where: { slug: res.educationLevel } }),
      prisma.subject.findUnique({ where: { slug: res.subject } }),
    ])

    if (!level) {
      console.warn(`Education level ${res.educationLevel} not found for resource ${res.title}`)
      continue
    }

    if (!sub) {
      console.warn(`Subject ${res.subject} not found for resource ${res.title}`)
      continue
    }

    // 2. Create/Update Resource first to get the ID
    let resource
    try {
      resource = await prisma.resource.upsert({
        where: { externalId: res.externalId },
        update: {
          title: res.title,
          description: `Recurso pedagógico: ${res.title}`,
          educationLevelId: level.id,
          subjectId: sub.id,
          isFree: res.isFree ?? false,
        },
        create: {
          title: res.title,
          description: `Recurso pedagógico: ${res.title}`,
          educationLevelId: level.id,
          subjectId: sub.id,
          externalId: res.externalId,
          isFree: res.isFree ?? false,
        },
      })
    } catch (error) {
      console.error(`❌ Failed to create resource ${res.title}:`, error)
      continue
    }

    // 3. Upload Image to Cloudinary using the resource ID in the folder path
    if (res.imageUrl) {
      const hint = `cover`
      try {
        const imageResult = await uploadImageFromUrl(res.imageUrl, {
          publicId: hint,
          folder: `resources/images/${resource.id}`
        })

        // 4. Update resource with the image
        await prisma.resourceImage.deleteMany({
          where: { resourceId: resource.id }
        })
        await prisma.resourceImage.create({
          data: {
            resourceId: resource.id,
            cloudinaryPublicId: imageResult.publicId,
            url: imageResult.url,
            alt: res.title,
            order: 0
          }
        })
      } catch (error) {
        console.error(`❌ Failed to upload image for ${res.title}:`, error)
      }
    }

    console.log(`✅ Resource created/updated: ${res.title}`)
  }
}
