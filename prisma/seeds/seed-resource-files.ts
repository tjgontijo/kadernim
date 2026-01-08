import type { PrismaClient } from '../generated/prisma/client'

interface ResourceFileSeedItem {
  externalId: number // referencia o Resource.externalId
  name: string
  url: string
}

const FILES: ResourceFileSeedItem[] = [
  {
    externalId: 37235525,
    name: '40 Páginas de Atividades de Matemática para 5º ANO',
    url: 'https://drive.google.com/drive/folders/1ciqko34k3J3SVnv2gkxLYc9cRehOu8b9?usp=sharing',
  },
  {
    externalId: 30200121,
    name: '50 Cards - Escrita mágica',
    url: 'https://drive.google.com/drive/folders/1SqCx7E7e-Yn07MYH4TdczTrwuq5n6WCb?usp=sharing',
  },
  {
    externalId: 30201120,
    name: '50 frases e expressões para relatórios descritivos',
    url: 'https://drive.google.com/drive/folders/17hWpySvTUz594GrAOfCi_Xvw26DEwqMd?usp=sharing',
  },
  {
    externalId: 30201083,
    name: 'Álbum de figurinhas - desvendando enigmas',
    url: 'https://drive.google.com/drive/folders/1O_H6HigomkclXwT2P6GIU903toFa-_OD?usp=sharing',
  },
  {
    externalId: 32970420,
    name: 'Alfabeto Cursivo',
    url: 'https://drive.google.com/drive/folders/1yDps5Mse-wT6sttpK88BFDM3Z7cOAtii?usp=drive_link',
  },
  {
    externalId: 42219116,
    name: 'Alfabeto em Pixel Art',
    url: 'https://drive.google.com/drive/folders/1s4gPvv1TGJsMxTPE5bQmaNlVNJY-Yght?usp=sharing',
  },
  {
    externalId: 33192369,
    name: 'Apostila Alfabeto Fônico',
    url: 'https://drive.google.com/drive/folders/1crl0TKj5tSMwI-fYEnCs-b9adOPXQFuf?usp=drive_link',
  },
  {
    externalId: 32967105,
    name: 'Apostila Atividades Festa Junina',
    url: 'https://drive.google.com/drive/folders/1TSJFqP7vjBHtEdLE1oU2COGiTcc4cV_n?usp=drive_link',
  },
  {
    externalId: 33249797,
    name: 'Apostila Consciência Fonológica',
    url: 'https://drive.google.com/drive/folders/1ooDMMR3Grc1YGP94wXtFe-A8t8AnpZ0D?usp=drive_link',
  },
  {
    externalId: 34801248,
    name: 'Apostila de Atividades do Folclore',
    url: 'https://drive.google.com/drive/folders/1WGEua-gjlhhrqJUBKyWcL10W-F0H3gSv?usp=sharing',
  },
  {
    externalId: 32801347,
    name: 'Apostila Família Silábica Simples',
    url: 'https://drive.google.com/drive/folders/1FoStkq3zbPjDsnuzUDaR1PqPG_IRSbjO?usp=drive_link',
  },
  {
    externalId: 33746900,
    name: 'Apostila Famílias Silábicas - Complete',
    url: 'https://drive.google.com/drive/folders/1xBhge6IaliOHvFD8XAiKH5tscdzT17BN?usp=sharing',
  },
  {
    externalId: 32762140,
    name: 'Apostila Interpretação de Textos',
    url: 'https://drive.google.com/drive/folders/1jsBZU2MzHwB4_PBWeAVB8NeG73Llky75?usp=drive_link',
  },
  {
    externalId: 32802615,
    name: 'Apostila Numerais de 1 a 20',
    url: 'https://drive.google.com/drive/folders/121b7wvm7Eu1otkB2t7GcF0DRcJFJLHdt?usp=drive_link',
  },
  {
    externalId: 32967425,
    name: 'Apostila Organize as Sílabas Complexas',
    url: 'https://drive.google.com/drive/folders/1TfFwTZsa56hLVVWg6KB3kJu2YDRQaL77?usp=sharing',
  },
  {
    externalId: 33612530,
    name: 'As 4 Operações Matemática em Pixel Art',
    url: 'https://drive.google.com/drive/folders/17zDLKBm09GbhbsLZaXvys0vvW9OI4wY1?usp=sharing',
  },
  {
    externalId: 30200143,
    name: 'Atividade Digital de Encontro Consonantal - R e L: Recurso Pedagógico Interativo',
    url: 'https://drive.google.com/drive/folders/1ekYqH7fJU6tNityeVc7jdjmWCEGb7uWN?usp=sharing',
  },
  {
    externalId: 32923728,
    name: 'Atividade Eu Sou Assim',
    url: 'https://drive.google.com/drive/folders/1N190nIfWnln4DgXl76UZJzppkIniKQab?usp=drive_link',
  },
  {
    externalId: 30200127,
    name: 'Atividade Interativa - Formação de palavras',
    url: 'https://drive.google.com/drive/folders/1ShqIPw7iaDSz7FUZHgNUC6T62OU3jPjQ?usp=sharing',
  },
  {
    externalId: 30366028,
    name: 'Atividade Interativa - Início do outono',
    url: 'https://drive.google.com/drive/folders/1iFnIeTJIsOfUPS0TRXynoWdfcnjWD51p?usp=sharing',
  },
  {
    externalId: 37914331,
    name: 'Atividade Interativa - Voltas às Aulas - Tudo Sobre Mim',
    url: 'https://drive.google.com/drive/folders/1cs2skBL5iKVcF-ld44IC48f8DBJ3gvnZ?usp=sharing',
  },
  {
    externalId: 30354472,
    name: 'Atividade Interativa Dia Internacional da Mulher - 8 de Março',
    url: 'https://drive.google.com/drive/folders/1UHMS009bHmvd-kvlDbj0ZZoVtXy3mLsb?usp=sharing',
  },
  {
    externalId: 39305065,
    name: 'Atividade Interativa- Livro dos Sistemas Humanos',
    url: 'https://drive.google.com/drive/folders/1zoUsWeomfSvW-kzG1XVXgdZSBup5zVVE?usp=sharing',
  },
  {
    externalId: 30347427,
    name: 'Atividade Povos Indígenas do Brasil',
    url: 'https://drive.google.com/drive/folders/1B0G1598AheoG56-x2iDAZ61DcUD0c4iD?usp=sharing',
  },
  {
    externalId: 30345127,
    name: 'Atividade Proclamação da República',
    url: 'https://drive.google.com/drive/folders/1pbIkI1K7N-N_Gpedb3CkuWZoYkrQQvvU?usp=sharing',
  },
  {
    externalId: 30343622,
    name: 'Atividade Setembro Amarelo - Conscientização no Ensino Fundamental',
    url: 'https://drive.google.com/drive/folders/1i9Edke8egA1W-bBcRWlifb9UrgYYrkKo?usp=sharing',
  },
  {
    externalId: 30355549,
    name: 'Atividade Vaso de Flor Dia da Mulher - Homenagem Criativa',
    url: 'https://drive.google.com/drive/folders/1bUtsz3HY88B78nx-Ddj_aCh6xgtxcP_G?usp=sharing',
  },
  {
    externalId: 42156695,
    name: 'Atividades de Gêneros & Narrativa 5º Ano',
    url: 'https://drive.google.com/drive/folders/15BtIL-udCyKtz5UngoWOG9zH6PjbhRdL?usp=sharing',
  },
  {
    externalId: 42156742,
    name: 'Atividades de Gramática Avançada 5º Ano',
    url: 'https://drive.google.com/drive/folders/1j1hlCzRWbhvrKpIzz7uv9PWwYYAETnwb?usp=sharing',
  },
  {
    externalId: 42156785,
    name: 'Atividades de Gramática Base 5º Ano',
    url: 'https://drive.google.com/drive/folders/1CxG0go0yLaWtchbDfwSLfmHVaSzD3X_5?usp=sharing',
  },
  {
    externalId: 42156811,
    name: 'Atividades de Ortografia Certa 5º Ano',
    url: 'https://drive.google.com/drive/folders/1UpYMe0cAb--UxRaiu1SiOrg5gwREqVEX?usp=sharing',
  },
  {
    externalId: 31566073,
    name: 'ATIVIDADES PORTUGUÊS - FOLHINHAS ParteE I - 1º AO 5º ANO',
    url: 'https://drive.google.com/drive/folders/14okr_BBoWh0cUS8bSlt1R10nGiPbiIBN?usp=sharing',
  },
  {
    externalId: 42153812,
    name: 'Atividades Português 5º Ano Acervo Essencial',
    url: 'https://drive.google.com/drive/folders/1279g7r2-4IiVyUwk1QtlZVbOp3yUNxpN?usp=sharing',
  },
  {
    externalId: 42478068,
    name: 'Avaliação ciências - 4º bimestre - 4º ano',
    url: 'https://drive.google.com/drive/folders/17CE50XZS0R7VIdPB3T5ISiABubzczM6V?usp=sharing',
  },
  {
    externalId: 42311388,
    name: 'Avaliação ciências - 4º bimestre - 5º ano',
    url: 'https://drive.google.com/drive/folders/1xdE08zCzIn9WBEpqJF2EFAHIIWRCkW3h?usp=sharing',
  },
  {
    externalId: 42313389,
    name: 'Avaliação geografia - 4º bimestre - 5º ano',
    url: 'https://drive.google.com/drive/folders/1OUlAFzm0auoNKqvxFEzWkzg7gT-a1MXP?usp=sharing',
  },
  {
    externalId: 42479572,
    name: 'Avaliação geografia 4º bimestre 4º ano',
    url: 'https://drive.google.com/drive/folders/1iGUV3u34RJT60CuEskVqTpkxseoXfAfm?usp=sharing',
  },
  {
    externalId: 42315251,
    name: 'Avaliação história - 4º bimestre - 5º ano',
    url: 'https://drive.google.com/drive/folders/1Vcu73q0FdeU-DVlKaHOgqhIJNGk_eeHt?usp=sharing',
  },
  {
    externalId: 42479601,
    name: 'Avaliação história 4º bimestre 4º ano',
    url: 'https://drive.google.com/drive/folders/1W5xHlBR0ogOutDNjW2-pUYjwRTNWWeun?usp=sharing',
  },
  {
    externalId: 42317126,
    name: 'Avaliação matemática - 4º Bimestre - 5º ano',
    url: 'https://drive.google.com/drive/folders/1NOPQSGKypMNaG6sB9-I5ROA-Eu2WURSr?usp=sharing',
  },
  {
    externalId: 42479330,
    name: 'Avaliação matemática 4º bimestre 4º ano',
    url: 'https://drive.google.com/drive/folders/1NbWh1RaMh-AZed82Z3AQ-6y6rsTnD4QD?usp=sharing',
  },
  {
    externalId: 42317283,
    name: 'Avaliação português - 4º Bimestre - 5º ano',
    url: 'https://drive.google.com/drive/folders/1-U9wyDlQ_xK9NvQ7XQItabwFGy6IaYM4?usp=sharing',
  },
  {
    externalId: 42479069,
    name: 'Avaliação português 4º bimestre 4º ano',
    url: 'https://drive.google.com/drive/folders/1FCsBdSR4pdCB1mB253CPWo8nPvmrRgu0?usp=sharing',
  },
  {
    externalId: 32556256,
    name: 'Bingo Junino',
    url: 'https://drive.google.com/drive/folders/1YKDgxZqrnpc-9caaNfrpcIjt3GK31wKl?usp=drive_link',
  },
  {
    externalId: 39952412,
    name: 'Caixinhas 3D Páscoa',
    url: 'https://drive.google.com/drive/folders/1UPwm8wIdGI-aOgHhh28VyEXSMRBCe7oN?usp=sharing',
  },
  {
    externalId: 30201068,
    name: 'Capas de Caderno',
    url: 'https://drive.google.com/drive/folders/1BL5Td3jEHPHgbkq-bA947wE_PXngKbz_?usp=sharing',
  },
  {
    externalId: 30200131,
    name: 'Cards do Substantivo',
    url: 'https://drive.google.com/drive/folders/1y-aapBWaulh0TdZ5LcIChjfBo0nAIt2C?usp=sharing',
  },
  {
    externalId: 32965409,
    name: 'Cartão Jardim 3D',
    url: 'https://drive.google.com/drive/folders/1utn_sOplnq3N_rC12wrUi-grEfKItGLE?usp=drive_link',
  },
  {
    externalId: 30620983,
    name: 'Cartão Pop UP - Encontro de culturas: a chegada dos Portugueses ao Brasil',
    url: 'https://drive.google.com/drive/folders/1hOK_0xJg6JnBDkNaq4xJW_mek0bZt_vI?usp=sharing',
  },
  {
    externalId: 30353503,
    name: 'Cartão Surpresa dia dos Pais',
    url: 'https://drive.google.com/drive/folders/10S0FZBb5NaQLwyA6t21aI4US2fZqYPKh?usp=sharing',
  },
  {
    externalId: 32169562,
    name: 'Cartaz Número do Dia',
    url: 'https://drive.google.com/drive/folders/1jsfM-TJeFfVCtsLmftm6dN_OfNo876E_?usp=drive_link',
  },
  {
    externalId: 30200132,
    name: 'Casinha do Alfabeto',
    url: 'https://drive.google.com/drive/folders/1p_IdZCyDofaV9AI9eDn9MOKCJKiM0RQr?usp=sharing',
  },
  {
    externalId: 32439709,
    name: 'Casinha dos Números',
    url: 'https://drive.google.com/drive/folders/1ficc6wuzR19alvTrcuf5PRIAK-Pr5q3A?usp=drive_link',
  },
  {
    externalId: 33408866,
    name: 'Combo Folhinhas Português + Bônus Atividades',
    url: 'https://drive.google.com/drive/folders/1_w7JYEGMOqudMa-8854JmQjGRBPFJzjw?usp=sharing',
  },
  {
    externalId: 30356118,
    name: 'Combo Páscoa',
    url: 'https://drive.google.com/drive/folders/1UGsqDB_V4o2BTHn_1JyeUg31NyhOhw0K?usp=sharing',
  },
  {
    externalId: 38492181,
    name: 'Começo Brilhante - Planos de aula para a 1ª Semana (1º ano)',
    url: 'https://drive.google.com/drive/folders/1xkM2bOdjc80InDetRjWDuImQaCOYqX7b?usp=sharing',
  },
  {
    externalId: 38471695,
    name: 'Começo Brilhante - Planos de aula para a 1ª Semana (2º ano)',
    url: 'https://drive.google.com/drive/folders/1EA1PIoL9e0hgwMsOaMvlKddTA98PqEzU?usp=sharing',
  },
  {
    externalId: 38442965,
    name: 'Começo Brilhante - Planos de aula para a 1ª Semana (3º ano)',
    url: 'https://drive.google.com/drive/folders/1Qw53o_IyX55hBnzHCN0ItYej7HtksqDc?usp=sharing',
  },
  {
    externalId: 38433983,
    name: 'Começo Brilhante - Planos de aula para a 1ª Semana (4º ano)',
    url: 'https://drive.google.com/drive/folders/1lU8Mq-d8mlHpmVl-2FN6DmhBI0ZBunlq?usp=sharing',
  },
  {
    externalId: 38430779,
    name: 'Começo Brilhante - Planos de aula para a 1ª Semana (5º ano)',
    url: 'https://drive.google.com/drive/folders/19IqxRTAOOeoqPdxwlCuVcA54pdzc0aIo?usp=sharing',
  },
  {
    externalId: 32459349,
    name: 'Contando Sílabas',
    url: 'https://drive.google.com/drive/folders/1uKk2XwpnURkXH-yzLz9Ieti7XdbfMprW?usp=drive_link',
  },
  {
    externalId: 30200135,
    name: 'Conto de Terror interativo',
    url: 'https://drive.google.com/drive/folders/14ybr-u79IlaDo-8Aye-WPmeg5wTCfJqB?usp=sharing',
  },
  {
    externalId: 32942405,
    name: 'Criando Frases',
    url: 'https://drive.google.com/drive/folders/1sulAY8Q3kudJwdenAB7orYWPQeCPsrw7?usp=drive_link',
  },
  {
    externalId: 42229493,
    name: 'Dia da árvore',
    url: 'https://drive.google.com/drive/folders/1HvL-X-PcInJv_2H4-EMyGTSQ57v03TLh?usp=sharing',
  },
  {
    externalId: 36010554,
    name: 'Dia das Crianças - Cartão com Blister - Lembrancinha',
    url: 'https://drive.google.com/drive/folders/1rGmLnUtc2SioIyJKhBsvme5jAo8ByPWe?usp=sharing',
  },
  {
    externalId: 30200243,
    name: 'Escrita mágica 50 folhinhas com comandos para pequenos escritores',
    url: 'https://drive.google.com/drive/folders/1_6EaBKuXhaozCEtVcMd5UoOFqMLrpx3W?usp=sharing',
  },
  {
    externalId: 33721430,
    name: 'Explorando Emoções: Atividades Interativas Inspiradas em Divertidamente',
    url: 'https://drive.google.com/drive/folders/1tHu8EQRWvxbSmKHC4uXfFhceoTnReAUJ?usp=sharing',
  },
  {
    externalId: 30296625,
    name: 'Folhinhas de Conceito - Gênero Textual - 1º ao 5º ano',
    url: 'https://drive.google.com/drive/folders/1iTGbSxAl43EChLDIiBmTpph-Y6KDbIg0?usp=sharing',
  },
  {
    externalId: 30107631,
    name: 'Folhinhas de Conceito - Matemática 1º ao 5º ano',
    url: 'https://drive.google.com/drive/folders/1yGiDOnYqJd4Nl_Q23ufkvZoI00gRNWV2?usp=sharing',
  },
  {
    externalId: 30200991,
    name: 'Folhinhas de conceito Prevenção à Dengue',
    url: 'https://drive.google.com/drive/folders/1JMF2jklJ-HbNj7X0bAA4f2dLbFqvf_Qz?usp=sharing',
  },
  {
    externalId: 30100557,
    name: 'Folhinhas de Conceitos - Português - Parte I - 1º ao 5º ano',
    url: 'https://drive.google.com/drive/folders/1I1IBmH6sUc0u5DoFpLsaS1EfBvOGS9uw?usp=sharing',
  },
  {
    externalId: 31219018,
    name: 'Folhinhas de Conceitos - Português - Parte II - 1º ao 5º ano',
    url: 'https://drive.google.com/drive/folders/1HxDNIYRTZAFWbbzzJ8EnOnypDFiOFdfr?usp=sharing',
  },
  {
    externalId: 40339636,
    name: 'Folhinhas de Conceitos Datas Comemorativas/Sazonais',
    url: 'https://drive.google.com/drive/folders/1kYAPTPV13JHTFy2YYYbiXXvH6lqg9niP?usp=sharing',
  },
  {
    externalId: 30201437,
    name: 'Folhinhas de conceitos de ciências',
    url: 'https://drive.google.com/drive/folders/10SqUkqtNH9EN-G3v7chPpok0WJfcyXWe?usp=sharing',
  },
  {
    externalId: 30200115,
    name: 'Folhinhas de conceitos de geografia para o 1º ao 5º ano',
    url: 'https://drive.google.com/drive/folders/13CpP2ZhxOPKUKBrC8lyXxOia7wkZitSo?usp=sharing',
  },
  {
    externalId: 30201143,
    name: 'Folhinhas de conceitos História',
    url: 'https://drive.google.com/drive/folders/1edbc7FnMW04Mceq5qzVFhnPDVhaJrS1N?usp=sharing',
  },
  {
    externalId: 42181865,
    name: 'Fração em Pixel Art',
    url: 'https://drive.google.com/drive/folders/1p7dwOeQC7FJw_Zl4zXD-Ade9rfT01wG4?usp=sharing',
  },
  {
    externalId: 33350543,
    name: 'Frase Misteriosa',
    url: 'https://drive.google.com/drive/folders/1ER_RcIT4JorablBvvcZVOFW1ssL5fiXE?usp=drive_link',
  },
  {
    externalId: 30200826,
    name: 'Gênero Textual: Conto de Fadas',
    url: 'https://drive.google.com/drive/folders/1J8wRvyJi-RY8qmULMFyu5acoDDK61lPj?usp=sharing',
  },
  {
    externalId: 30200830,
    name: 'Gênero Textual: Reportagem',
    url: 'https://drive.google.com/drive/folders/1uLlpedOM3dTFSwLRctCbXCckbgkYQvUj?usp=sharing',
  },
  {
    externalId: 40651167,
    name: 'Histórias Para Missões Literárias',
    url: 'https://drive.google.com/drive/folders/164nlnziZpknRlr0Rvi5XUTI39n6aFZ_X?usp=sharing',
  },
  {
    externalId: 33915782,
    name: 'Interpretação de Frases',
    url: 'https://drive.google.com/drive/folders/16E8nDgnXydFKqIpYhFiSuFgT7Vq9Ebyt?usp=sharing',
  },
  {
    externalId: 38768242,
    name: 'Interpretando Textos (3º ano)',
    url: 'https://drive.google.com/drive/folders/1WU33B7jkWwcSdjgPOuTOFt-VYsoaOp72?usp=sharing',
  },
  {
    externalId: 39255572,
    name: 'Interpretando Textos 4°ano',
    url: 'https://drive.google.com/drive/folders/1v3IC6kiytRy-H2V3LjzozD2xijQcvqfO?usp=sharing',
  },
  {
    externalId: 39382017,
    name: 'Interpretando Textos 5°ano',
    url: 'https://drive.google.com/drive/folders/1T2RzXrjg74Epe99zzKpVcl-kO9E_UqtA?usp=sharing',
  },
  {
    externalId: 34800521,
    name: 'Jogo da Memória Folclore',
    url: 'https://drive.google.com/drive/folders/1revUnS7zx7fiaHXX7QpH170dCP5DFpCz?usp=sharing',
  },
  {
    externalId: 30200840,
    name: 'Jogos da Memória - S/SS e R/RR',
    url: 'https://drive.google.com/drive/folders/1tz-o4-BIqQ8cYqEG01yRUQKyJwiQcvA6?usp=sharing',
  },
  {
    externalId: 34801637,
    name: 'Kit de Atividades do Folclore',
    url: 'https://drive.google.com/drive/folders/1oKcDX1wXo7kUUW4iaD65jcESHwOVSKVh?usp=sharing',
  },
  {
    externalId: 33721093,
    name: 'Kit de Férias Criativas: Desafio de Recesso e Pintura Anti-Stress',
    url: 'https://drive.google.com/drive/folders/1uwV1hd6Gvw7oyLh4BQfFkyQo5uzFcZ9l?usp=sharing',
  },
  {
    externalId: 30350749,
    name: 'Kit Dia da Consciência Negra',
    url: 'https://drive.google.com/drive/folders/1O6YA039SosX0okA9NwpqCa0fNUqrtNgJ?usp=sharing',
  },
  {
    externalId: 42560107,
    name: 'Kit Dia dos Professores',
    url: 'https://drive.google.com/drive/folders/1uI0nZfuyVMKqwzLRFBHLbzdHNdD1Licz?usp=sharing',
  },
  {
    externalId: 39420230,
    name: 'Kit Interativo- Alimentação saudável',
    url: 'https://drive.google.com/drive/folders/1ld4lD7_rjADvc2uFADLenA4mEQlSi_lF?usp=sharing',
  },
  {
    externalId: 37450127,
    name: 'Kit Natal',
    url: 'https://drive.google.com/drive/folders/1vHhnwDSyrl9QilIzjFJLzHqz3KZLLyon?usp=sharing',
  },
  {
    externalId: 33071521,
    name: 'Lapbook Alfabeto',
    url: 'https://drive.google.com/drive/folders/1NQp5-nxOEYMgN3j1pNk9C4kzxfeiR8rA?usp=drive_link',
  },
  {
    externalId: 32663286,
    name: 'Lapbook Numerais de 0 a 10',
    url: 'https://drive.google.com/drive/folders/16KpjOU_LEYgC1N55msGXD7Lr0YsAarkD?usp=sharing',
  },
  {
    externalId: 36010532,
    name: 'Lembrança Dia dos Professores',
    url: 'https://drive.google.com/drive/folders/1ngrz2b4MwtPxkYOeq8Oq1e88XbvtV9h6?usp=drive_link',
  },
  {
    externalId: 32872296,
    name: 'Livrinho Minhas Férias',
    url: 'https://drive.google.com/drive/folders/1Z60UP5VfdW9Hqu2MICly5Kp7hfOLd3gS?usp=drive_link',
  },
  {
    externalId: 32964447,
    name: 'Manual dos Relatórios',
    url: 'https://drive.google.com/drive/folders/1T1WoIqNL-kn4e12WRGHGWa6PE25xzURY?usp=drive_link',
  },
  {
    externalId: 30200842,
    name: 'Narrativa Criativa - Livro Interativo com Flash Cards',
    url: 'https://drive.google.com/drive/folders/1pXN6Sm-vJi-aaxKfRPA2dKWLpJHOcz51?usp=sharing',
  },
  {
    externalId: 32964026,
    name: 'O Baú dos Tesouros',
    url: 'https://drive.google.com/drive/folders/1G3L9-E4nwoOQwGT1LESgs_tEBeZextdr?usp=drive_link',
  },
  {
    externalId: 34158154,
    name: 'O Corpo Humano',
    url: 'https://drive.google.com/drive/folders/1q60BaidxON7zF9UaOBxp_R-_u1ukJeP3?usp=sharing',
  },
  {
    externalId: 37081242,
    name: 'Oferta de Black Friday Recursos Pedagógicos Português + Bônus',
    url: 'https://drive.google.com/drive/folders/1YDVx-JMZoo_sXChRYhMkY-RkvSAEX0uv?usp=sharing',
  },
  {
    externalId: 34461430,
    name: 'Operação Maluca',
    url: 'https://drive.google.com/drive/folders/1ZChoTVZ8Ahmha90BPtsKsm1GidQeUYKx?usp=sharing',
  },
  {
    externalId: 34240101,
    name: 'Operações Matemáticas em Pixel Art - Divertidamente II',
    url: 'https://drive.google.com/drive/folders/1m8XEa4dsz3hIwkQsVVxGx8oMh3kul_Bu?usp=sharing',
  },
  {
    externalId: 35655266,
    name: 'Operações Matemáticas em Pixel Art Editável - Divertidamente II',
    url: 'https://drive.google.com/drive/folders/118fdpl7qkyzurxgmiZ5oE0ECL6ivRdjz?usp=sharing',
  },
  {
    externalId: 39893386,
    name: 'Ortografia em Pixel Art',
    url: 'https://drive.google.com/drive/folders/1rre6-_Qqgy5eDO5fQN3Q4x_EgDtYMq_b?usp=sharing',
  },
  {
    externalId: 30201002,
    name: 'Pack com 25 Estampas Criativas para Camisetas e Canecas Personalizadas',
    url: 'https://drive.google.com/drive/folders/18lGaQnwaxEB78Xr252Y-ZSoLyqIHYMRh?usp=sharing',
  },
  {
    externalId: 33306666,
    name: 'Pareando Palavrinhas',
    url: 'https://drive.google.com/drive/folders/1xt86d4n-5zzlvfWL36liLkBqeRWmp0Yf?usp=drive_link',
  },
  {
    externalId: 32719427,
    name: 'Pense Rápido',
    url: 'https://drive.google.com/drive/folders/160QNpt3uAm-XaTO9fVIT8XCugOd2cmnb?usp=drive_link',
  },
  {
    externalId: 30357444,
    name: 'Plano de Aula Independência do Brasil',
    url: 'https://drive.google.com/drive/folders/1sxL7qlfDCGhtGYtZLhRX4SRCvFmLBVF-?usp=sharing',
  },
  {
    externalId: 39959830,
    name: 'Plano de aula: A origem dos seres humanos',
    url: 'https://drive.google.com/drive/folders/1_FhjzSxEwRXa0TnVmrLhjoZ327OR-uOw?usp=sharing',
  },
  {
    externalId: 30200859,
    name: 'Plano de aula: Gênero textual Notícia',
    url: 'https://drive.google.com/drive/folders/14FGlknPDelgDiW1osluth_BpJwP_ALqK?usp=sharing',
  },
  {
    externalId: 30341530,
    name: 'Plano de aula: O planeta terra e sua Superfície',
    url: 'https://drive.google.com/drive/folders/1fdamswyo98-Dc0m15wS-gP7EWZSMozeu?usp=sharing',
  },
  {
    externalId: 41997313,
    name: 'Projeto Desafio Literário',
    url: 'https://drive.google.com/drive/folders/1SRXuyx5wplBqSX-XW7mqvK_otWmqCaDZ?usp=sharing',
  },
  {
    externalId: 40866795,
    name: 'Projeto Desvendando Conceitos de Português - Fundamental 1',
    url: 'https://drive.google.com/drive/folders/1JNKORYmRHVx4mjIMrwiQ4ZMFdlvXUa5d?usp=sharing',
  },
  {
    externalId: 40860782,
    name: 'Projeto Leitor do Futuro',
    url: 'https://drive.google.com/drive/folders/1Pkuq8l50BqWJ7PcrjhbPJtb-59eFfNX3?usp=sharing',
  },
  {
    externalId: 30200883,
    name: 'Projeto Literário: Recurso Pedagógico Completo para Professores',
    url: 'https://drive.google.com/drive/folders/1l978q8HP3HU9UmwJHYheLGy7IBDAfHkT?usp=sharing',
  },
  {
    externalId: 32962574,
    name: 'Recurso Alfabeto na Caixa',
    url: 'https://drive.google.com/drive/folders/1cX3z28VVdLfgkA1XBXWlxTQEq2-P4IMu?usp=drive_link',
  },
  {
    externalId: 32804268,
    name: 'Recurso Complete a Frase',
    url: 'https://drive.google.com/drive/folders/1eu_QACe9DV6peOW5yzWQMzLNlHxzY0hD?usp=drive_link',
  },
  {
    externalId: 30200942,
    name: 'Roda Gigante da Ordem Alfabética',
    url: 'https://drive.google.com/drive/folders/1RNNY_0CBP6DI-MniQnG_zNCzEJThePSm?usp=sharing',
  },
  {
    externalId: 34501242,
    name: 'Roleta dos Números',
    url: 'https://drive.google.com/drive/folders/1unBfpY3_2RfPIPMDwr3X_aKpEU4oSt2P?usp=sharing',
  },
  {
    externalId: 39530909,
    name: 'Sistema de Recompensas - Realis',
    url: 'https://drive.google.com/drive/folders/1Ie4F6IVu0fYTS_aLETtblQVd4vpoDSmL?usp=sharing',
  },
  {
    externalId: 34546068,
    name: 'Tabuada',
    url: 'https://drive.google.com/drive/folders/1Q6m2QtoyPqvMPKiwjqvU8CKKhITCVO-x?usp=sharing',
  },
  {
    externalId: 33625961,
    name: 'Tangram',
    url: 'https://drive.google.com/drive/folders/11pOlzmz2uxWlu1oE6d73fA0Jzj9MT2fi?usp=sharing',
  },
  {
    externalId: 32219233,
    name: 'Traçando os Numerais',
    url: 'https://drive.google.com/drive/folders/1_QzYjwDmDh9KKO0eBXz9nCo-j27gJTvx?usp=drive_link',
  },
  {
    externalId: 30200956,
    name: 'Uso de CH, NH e LH',
    url: 'https://drive.google.com/drive/folders/1ZqVIZ2iJVHziw63BsBych-5vl5SB6t8o?usp=sharing',
  }
]

export async function seedResourceFiles(prisma: PrismaClient) {
  console.log('🌱 Populando resource files...')

  for (const f of FILES) {
    const resource = await prisma.resource.findUnique({
      where: { externalId: f.externalId },
      select: { id: true },
    })

    if (!resource) {
      console.warn(`⚠️  Resource com externalId=${f.externalId} não encontrado. Pulando.`)
      continue
    }

    // evitar duplicidade por (resourceId, name)
    const exists = await prisma.resourceFile.findFirst({
      where: { resourceId: resource.id, name: f.name },
      select: { id: true },
    })

    if (exists) {
      console.log(`↪️  Arquivo já existe para externalId=${f.externalId}: ${f.name}`)
      continue
    }

    // Gerar public_id a partir do nome do arquivo (sem extensão)
    const nameWithoutExt = f.name.split('.').slice(0, -1).join('.')
    const cloudinaryPublicId = `resources/${resource.id}/${nameWithoutExt}`

    await prisma.resourceFile.create({
      data: {
        name: f.name,
        cloudinaryPublicId,
        resourceId: resource.id,
      },
    })

    console.log(`✅ Resource file criado para externalId=${f.externalId}`)
  }
}
