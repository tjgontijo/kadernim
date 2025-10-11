import { PrismaClient } from '@prisma/client';

type BNCCSeed = { code: string; description: string };

// Mapas para inferir disciplina pelos componentes dos códigos
// EI: ET, EF, EO, TS, CG
// EF: MA, LP, CI, HI, GE, AR, EF, ER
const COMPONENT_TO_SUBJECT: Record<string, string> = {
  // Educação Infantil
  ET: 'matematica',
  EF: 'portugues',          // no EI é "Escuta, fala, pensamento e imaginação"
  EO: 'socioemocional',
  TS: 'artes',
  CG: 'educacao-fisica',
  // Fundamental
  MA: 'matematica',
  LP: 'portugues',
  CI: 'ciencias',
  HI: 'historia',
  GE: 'geografia',
  AR: 'artes',
  EF_FUND: 'educacao-fisica'
};

function inferEducationLevelSlug(code: string): 'educacao-infantil' | 'fundamental-i' | 'fundamental-ii' {
  if (code.startsWith('EI')) return 'educacao-infantil';
  if (code.startsWith('EF')) {
    const year = parseInt(code.slice(2, 4), 10); // EF01..EF09
    return year <= 5 ? 'fundamental-i' : 'fundamental-ii';
  }
  // fallback
  return 'fundamental-i';
}

function inferSubjectSlug(code: string): string {
  if (code.startsWith('EI')) {
    // EI03ET03 → componente = ET
    const comp = code.slice(4, 6);
    const slug = COMPONENT_TO_SUBJECT[comp];
    if (!slug) throw new Error(`Componente EI desconhecido no código ${code}`);
    return slug;
  }
  if (code.startsWith('EF')) {
    // EF01MA01 → componente = MA; EF01EF01 → EF do Fundamental
    const comp = code.slice(4, 6);
    if (comp === 'EF') return COMPONENT_TO_SUBJECT['EF_FUND'];
    const slug = COMPONENT_TO_SUBJECT[comp];
    if (!slug) throw new Error(`Componente EF desconhecido no código ${code}`);
    return slug;
  }
  throw new Error(`Prefixo de código BNCC desconhecido em ${code}`);
}

async function upsertBnccWithRefs(prisma: PrismaClient, items: BNCCSeed[]) {
  console.log('Criando códigos BNCC com referências...');
  for (const item of items) {
    const educationLevelSlug = inferEducationLevelSlug(item.code);
    const subjectSlug = inferSubjectSlug(item.code);

    const [level, subject] = await Promise.all([
      prisma.educationLevel.findUnique({ where: { slug: educationLevelSlug } }),
      prisma.subject.findUnique({ where: { slug: subjectSlug } })
    ]);

    if (!level) throw new Error(`Nível não encontrado para ${educationLevelSlug}`);
    if (!subject) throw new Error(`Disciplina não encontrada para ${subjectSlug}`);

    await (prisma as any)['BNCCCode'].upsert({
      where: { code: item.code },
      update: {
        description: item.description,
        subjectId: subject.id,
        educationLevelId: level.id
      },
      create: {
        code: item.code,
        description: item.description,
        subjectId: subject.id,
        educationLevelId: level.id
      }
    });
    console.log(`Código BNCC criado/atualizado: ${item.code}`);
  }
}

// Lista de códigos BNCC
const bnccSeed: BNCCSeed[] = [
    { code: 'EI01EO01', description: 'Interagir com crianças e adultos, demonstrando interesse, respeito e empatia.' },
      { code: 'EI01EO02', description: 'Reconhecer e respeitar diferenças entre as pessoas.' },
      { code: 'EI02EO01', description: 'Demonstrar atitudes de cuidado, empatia e cooperação no convívio com os outros.' },
      { code: 'EI02EO02', description: 'Expressar sentimentos e emoções, respeitando o outro.' },
      { code: 'EI03EO01', description: 'Demonstrar empatia pelos outros, percebendo que as pessoas têm diferentes sentimentos, necessidades e maneiras de pensar e agir.' },
      { code: 'EI03EO02', description: 'Agir de maneira independente, com confiança em suas capacidades, reconhecendo suas conquistas e limitações.' },
      { code: 'EI03EO03', description: 'Ampliar as relações interpessoais, desenvolvendo atitudes de participação e cooperação.' },
      { code: 'EI03EO04', description: 'Comunicar suas ideias e sentimentos a pessoas e grupos diversos.' },
      { code: 'EI03EO05', description: 'Demonstrar valorização das características de seu corpo e respeitar as características dos outros com os quais convive.' },
    
      // Campo: Corpo, gestos e movimentos (CG)
      { code: 'EI01CG01', description: 'Explorar o corpo e movimentos com curiosidade e prazer.' },
      { code: 'EI02CG01', description: 'Utilizar o corpo em brincadeiras e atividades, explorando diferentes possibilidades de movimento.' },
      { code: 'EI03CG01', description: 'Aprimorar o equilíbrio, a coordenação e o controle do corpo em jogos e brincadeiras.' },
      { code: 'EI03CG02', description: 'Demonstrar controle e coordenação em movimentos mais amplos e precisos, como correr, saltar, lançar e rolar.' },
    
      // Campo: Traços, sons, cores e formas (TS)
      { code: 'EI01TS01', description: 'Explorar materiais e objetos diversos para produzir sons, traços, cores e formas.' },
      { code: 'EI02TS01', description: 'Experimentar diferentes formas de expressão artística, como desenho, pintura, modelagem e colagem.' },
      { code: 'EI03TS01', description: 'Utilizar sons produzidos por materiais, objetos e instrumentos musicais durante brincadeiras de faz de conta, encenações, criações musicais e festas.' },
      { code: 'EI03TS02', description: 'Expressar-se livremente por meio de desenho, pintura, colagem, dobradura e escultura, criando produções bidimensionais e tridimensionais.' },
      { code: 'EI03TS03', description: 'Apreciar e valorizar produções artísticas próprias e de colegas, reconhecendo diferentes formas de expressão.' },
    
      // Campo: Escuta, fala, pensamento e imaginação (EF)
      { code: 'EI01EF01', description: 'Ouvir e participar de conversas, mostrando interesse pelo que o outro diz.' },
      { code: 'EI02EF01', description: 'Relatar experiências, desejos e sentimentos por meio da fala.' },
      { code: 'EI03EF01', description: 'Participar de situações de leitura de diferentes gêneros, feitas por adultos.' },
      { code: 'EI03EF02', description: 'Falar sobre acontecimentos, narrando fatos e experiências com sequência lógica.' },
      { code: 'EI03EF03', description: 'Escolher e folhear livros, orientando-se por temas e ilustrações e tentando identificar palavras conhecidas.' },
      { code: 'EI03EF04', description: 'Recontar histórias ouvidas e planejar coletivamente roteiros de vídeos e encenações, definindo contextos, personagens e estrutura da história.' },
      { code: 'EI03EF05', description: 'Demonstrar interesse pela escrita, reconhecendo seu uso social e tentando escrever palavras e textos.' },
    
      // Campo: Espaços, tempos, quantidades, relações e transformações (ET)
      { code: 'EI01ET01', description: 'Explorar o ambiente e objetos, percebendo suas características e funções.' },
      { code: 'EI02ET01', description: 'Observar e comparar tamanhos, formas e quantidades em diferentes situações.' },
      { code: 'EI03ET01', description: 'Identificar e comparar propriedades dos objetos e materiais, como peso, tamanho e forma.' },
      { code: 'EI03ET02', description: 'Reconhecer números em diferentes contextos e utilizá-los em situações do cotidiano.' },
      { code: 'EI03ET03', description: 'Relacionar números às suas respectivas quantidades e identificar o antes, o depois e o entre em uma sequência.' },
      { code: 'EI03ET04', description: 'Utilizar noções de medida, tempo e espaço em atividades do dia a dia.' },
      { code: 'EI03ET05', description: 'Classificar objetos e figuras de acordo com suas semelhanças e diferenças.' },
  
      // LÍNGUA PORTUGUESA (LP)
      { code: 'EF01LP01', description: 'Reconhecer o próprio nome e de colegas, identificando letras e sons correspondentes.' },
      { code: 'EF01LP02', description: 'Escrever o próprio nome e outras palavras significativas, ainda que com grafias não convencionais.' },
      { code: 'EF01LP03', description: 'Escutar com atenção textos lidos ou contados e demonstrar compreensão por meio de comentários ou recontos.' },
      { code: 'EF01LP04', description: 'Participar de situações de leitura, valorizando a escuta e o turno de fala.' },
      { code: 'EF01LP05', description: 'Identificar o assunto principal de textos lidos pelo professor ou por si próprio.' },
      { code: 'EF01LP06', description: 'Ler e compreender textos curtos de uso social, como bilhetes, listas e convites.' },
      { code: 'EF01LP07', description: 'Produzir textos orais e escritos simples, de acordo com a finalidade comunicativa e o público.' },
      { code: 'EF01LP08', description: 'Revisar e reescrever textos com ajuda do professor ou dos colegas.' },
    
      // MATEMÁTICA (MA)
      { code: 'EF01MA01', description: 'Contar de forma oral objetos, eventos e elementos do cotidiano, utilizando números naturais.' },
      { code: 'EF01MA02', description: 'Registrar quantidades e resultados de contagens, utilizando algarismos e palavras.' },
      { code: 'EF01MA03', description: 'Comparar, ordenar e registrar quantidades até 100, compreendendo o valor posicional dos números.' },
      { code: 'EF01MA04', description: 'Resolver e elaborar problemas simples de adição e subtração com números naturais.' },
      { code: 'EF01MA05', description: 'Descrever e comparar figuras planas, reconhecendo formas geométricas em objetos do cotidiano.' },
      { code: 'EF01MA06', description: 'Utilizar noções de medida de comprimento, massa e tempo em situações do cotidiano.' },
      { code: 'EF01MA07', description: 'Ler e registrar informações em tabelas e gráficos simples.' },
    
      // CIÊNCIAS (CI)
      { code: 'EF01CI01', description: 'Reconhecer partes do corpo humano e sua função, compreendendo cuidados básicos com a higiene e a saúde.' },
      { code: 'EF01CI02', description: 'Observar características e necessidades dos seres vivos, identificando semelhanças e diferenças entre plantas e animais.' },
      { code: 'EF01CI03', description: 'Identificar elementos da natureza e reconhecer sua importância para a vida.' },
      { code: 'EF01CI04', description: 'Compreender mudanças no ambiente e suas causas, relacionadas a fenômenos naturais e ações humanas.' },
    
      // HISTÓRIA (HI)
      { code: 'EF01HI01', description: 'Reconhecer a si e aos outros como sujeitos com histórias e memórias próprias.' },
      { code: 'EF01HI02', description: 'Identificar transformações e permanências nas formas de viver em diferentes tempos e lugares.' },
      { code: 'EF01HI03', description: 'Reconhecer e respeitar diferentes grupos sociais e culturais, valorizando a diversidade.' },
    
      // GEOGRAFIA (GE)
      { code: 'EF01GE01', description: 'Reconhecer e representar os lugares de convivência, observando elementos da paisagem local.' },
      { code: 'EF01GE02', description: 'Compreender noções de espaço, distância e localização em situações do cotidiano.' },
      { code: 'EF01GE03', description: 'Identificar transformações no espaço em que vive, observando ações da natureza e do ser humano.' },
    
      // ARTES (AR)
      { code: 'EF01AR01', description: 'Experimentar diferentes formas de expressão artística, como desenho, pintura, colagem, modelagem e música.' },
      { code: 'EF01AR02', description: 'Apreciar produções artísticas de diferentes culturas, épocas e estilos.' },
      { code: 'EF01AR03', description: 'Criar composições visuais e sonoras utilizando materiais e instrumentos variados.' },
      { code: 'EF01AR04', description: 'Apresentar e compartilhar produções artísticas, valorizando o próprio trabalho e o dos colegas.' },
  
      { code: 'EF02LP01', description: 'Ler e compreender textos de diferentes gêneros, identificando o tema e as informações principais.' },
      { code: 'EF02LP02', description: 'Reconhecer e utilizar diferentes tipos de frases em textos orais e escritos.' },
      { code: 'EF02LP03', description: 'Produzir pequenos textos narrativos, descritivos e instrucionais, considerando a finalidade e o público-alvo.' },
      { code: 'EF02LP04', description: 'Revisar textos produzidos com a ajuda de colegas e do professor, adequando ortografia e pontuação.' },
      { code: 'EF02LP05', description: 'Identificar relações entre sons e letras, aprimorando a leitura e a escrita convencional.' },
      { code: 'EF02LP06', description: 'Participar de situações de comunicação oral, respeitando turnos de fala e adequando a linguagem ao contexto.' },
      { code: 'EF02LP07', description: 'Reconhecer o uso da pontuação e dos sinais gráficos para expressar sentido nos textos.' },
      { code: 'EF02LP08', description: 'Apreciar e comentar textos literários, demonstrando compreensão e envolvimento com a leitura.' },
    
      // MATEMÁTICA (MA)
      { code: 'EF02MA01', description: 'Contar, ler, escrever e ordenar números naturais até 1000, compreendendo o valor posicional.' },
      { code: 'EF02MA02', description: 'Resolver e elaborar problemas envolvendo adição e subtração com números naturais.' },
      { code: 'EF02MA03', description: 'Explorar regularidades e padrões em sequências numéricas simples.' },
      { code: 'EF02MA04', description: 'Comparar e estimar medidas de comprimento, massa e tempo, utilizando instrumentos convencionais.' },
      { code: 'EF02MA05', description: 'Reconhecer e nomear figuras geométricas planas e espaciais em objetos do cotidiano.' },
      { code: 'EF02MA06', description: 'Interpretar e construir gráficos e tabelas simples para organizar informações.' },
      { code: 'EF02MA07', description: 'Resolver situações-problema que envolvam adição e subtração, aplicando diferentes estratégias.' },
    
      // CIÊNCIAS (CI)
      { code: 'EF02CI01', description: 'Identificar características e necessidades dos seres vivos, reconhecendo a importância da água, do ar, da luz e do solo para a vida.' },
      { code: 'EF02CI02', description: 'Observar e descrever diferentes ambientes naturais e construídos, reconhecendo suas transformações.' },
      { code: 'EF02CI03', description: 'Compreender hábitos de higiene e alimentação como cuidados para manutenção da saúde.' },
      { code: 'EF02CI04', description: 'Investigar materiais e objetos, observando suas propriedades e transformações.' },
    
      // HISTÓRIA (HI)
      { code: 'EF02HI01', description: 'Reconhecer semelhanças e diferenças entre modos de vida de pessoas em diferentes tempos e lugares.' },
      { code: 'EF02HI02', description: 'Identificar transformações e permanências nas formas de viver, trabalhar e se relacionar em sua comunidade.' },
      { code: 'EF02HI03', description: 'Reconhecer e valorizar manifestações culturais, tradições e festas locais.' },
    
      // GEOGRAFIA (GE)
      { code: 'EF02GE01', description: 'Identificar e representar lugares de convivência e percursos conhecidos, utilizando noções de posição e distância.' },
      { code: 'EF02GE02', description: 'Observar e comparar diferentes paisagens, reconhecendo elementos naturais e construídos.' },
      { code: 'EF02GE03', description: 'Compreender a relação entre as ações humanas e as modificações no ambiente.' },
      { code: 'EF02GE04', description: 'Valorizar o cuidado com os espaços coletivos e o meio ambiente.' },
    
      // ARTES (AR)
      { code: 'EF02AR01', description: 'Explorar diferentes materiais e técnicas para criar produções artísticas individuais e coletivas.' },
      { code: 'EF02AR02', description: 'Apreciar obras de arte de diversas culturas, expressando preferências e opiniões.' },
      { code: 'EF02AR03', description: 'Experimentar sons, gestos e movimentos na criação de apresentações musicais, teatrais e corporais.' },
      { code: 'EF02AR04', description: 'Apresentar suas produções artísticas, respeitando e valorizando o trabalho dos colegas.' },
      // LÍNGUA PORTUGUESA (LP)
      { code: 'EF03LP01', description: 'Ler e compreender textos de diferentes gêneros, identificando o assunto, a finalidade e as informações principais.' },
      { code: 'EF03LP02', description: 'Reconhecer e utilizar recursos linguísticos e textuais que contribuem para a coerência e coesão do texto.' },
      { code: 'EF03LP03', description: 'Planejar, produzir e revisar textos escritos de diferentes gêneros, adequando a linguagem ao contexto e à finalidade.' },
      { code: 'EF03LP04', description: 'Ler em voz alta com fluência, respeitando a pontuação e a entonação.' },
      { code: 'EF03LP05', description: 'Identificar relações entre fonemas e grafemas, aprimorando a ortografia e a segmentação de palavras.' },
      { code: 'EF03LP06', description: 'Reconhecer o uso de tempos verbais, pronomes e adjetivos na construção de sentido dos textos.' },
      { code: 'EF03LP07', description: 'Apreciar e comentar textos literários, identificando elementos como personagens, enredo e tempo.' },
      { code: 'EF03LP08', description: 'Utilizar a escrita para relatar experiências, registrar observações e comunicar ideias.' },
    
      // MATEMÁTICA (MA)
      { code: 'EF03MA01', description: 'Ler, escrever, ordenar e comparar números naturais até 10.000, reconhecendo o valor posicional.' },
      { code: 'EF03MA02', description: 'Resolver e elaborar problemas de adição e subtração, utilizando estratégias pessoais e convencionais.' },
      { code: 'EF03MA03', description: 'Compreender e utilizar a multiplicação como adição de parcelas iguais e a divisão como repartição ou medida.' },
      { code: 'EF03MA04', description: 'Reconhecer e utilizar fatos básicos da multiplicação e da divisão em situações do cotidiano.' },
      { code: 'EF03MA05', description: 'Identificar, nomear e comparar figuras geométricas planas e espaciais, observando suas características.' },
      { code: 'EF03MA06', description: 'Estimar, medir e comparar grandezas de comprimento, massa, tempo e capacidade, utilizando instrumentos adequados.' },
      { code: 'EF03MA07', description: 'Ler, interpretar e construir gráficos e tabelas simples, analisando informações e dados.' },
      { code: 'EF03MA08', description: 'Resolver problemas envolvendo multiplicação e divisão com números naturais em contextos significativos.' },
    
      // CIÊNCIAS (CI)
      { code: 'EF03CI01', description: 'Investigar características, necessidades e habitats dos seres vivos, compreendendo suas relações com o ambiente.' },
      { code: 'EF03CI02', description: 'Reconhecer a importância da água, do ar, do solo e da luz para a manutenção da vida.' },
      { code: 'EF03CI03', description: 'Identificar as principais partes do corpo humano e suas funções, compreendendo hábitos saudáveis.' },
      { code: 'EF03CI04', description: 'Observar e descrever transformações que ocorrem na natureza, relacionando-as com fenômenos naturais e ações humanas.' },
    
      // HISTÓRIA (HI)
      { code: 'EF03HI01', description: 'Compreender o conceito de tempo histórico, reconhecendo mudanças e permanências nas formas de viver e conviver.' },
      { code: 'EF03HI02', description: 'Identificar diferentes formas de registro da história e valorizar a memória como forma de preservação do passado.' },
      { code: 'EF03HI03', description: 'Reconhecer modos de vida e tradições culturais de diferentes grupos sociais, respeitando a diversidade.' },
    
      // GEOGRAFIA (GE)
      { code: 'EF03GE01', description: 'Identificar elementos naturais e humanos da paisagem e compreender suas transformações ao longo do tempo.' },
      { code: 'EF03GE02', description: 'Reconhecer o espaço geográfico como resultado da relação entre natureza e sociedade.' },
      { code: 'EF03GE03', description: 'Ler e interpretar mapas simples, reconhecendo símbolos e legendas.' },
      { code: 'EF03GE04', description: 'Compreender a importância da preservação ambiental e das ações sustentáveis no cotidiano.' },
    
      // ARTES (AR)
      { code: 'EF03AR01', description: 'Explorar linguagens artísticas diversas, como artes visuais, música, teatro e dança, criando produções autorais.' },
      { code: 'EF03AR02', description: 'Apreciar e analisar obras artísticas, identificando elementos visuais, sonoros e corporais.' },
      { code: 'EF03AR03', description: 'Participar de apresentações artísticas, valorizando o processo de criação individual e coletiva.' },
      { code: 'EF03AR04', description: 'Experimentar diferentes técnicas e materiais para expressar ideias e sentimentos por meio da arte.' },
  
      // LÍNGUA PORTUGUESA (LP)
      { code: 'EF04LP01', description: 'Ler e compreender textos de diferentes gêneros, identificando a ideia principal, informações explícitas e implícitas.' },
      { code: 'EF04LP02', description: 'Reconhecer a estrutura e a finalidade de textos narrativos, descritivos, informativos e instrucionais.' },
      { code: 'EF04LP03', description: 'Planejar, produzir e revisar textos escritos de forma colaborativa e autônoma, considerando destinatário e objetivo comunicativo.' },
      { code: 'EF04LP04', description: 'Utilizar recursos de coesão textual, como conectivos e pronomes, para organizar as ideias no texto.' },
      { code: 'EF04LP05', description: 'Reconhecer e empregar pontuação, ortografia e paragrafação para aprimorar a clareza e a expressividade do texto.' },
      { code: 'EF04LP06', description: 'Ler em voz alta com fluência, entonação e ritmo adequados, respeitando a pontuação e o gênero textual.' },
      { code: 'EF04LP07', description: 'Apreciar e analisar textos literários, reconhecendo personagens, enredo, tempo, espaço e narrador.' },
      { code: 'EF04LP08', description: 'Identificar e utilizar recursos expressivos da linguagem em textos poéticos e narrativos.' },
    
      // MATEMÁTICA (MA)
      { code: 'EF04MA01', description: 'Ler, escrever e comparar números naturais até a ordem de centenas de milhar.' },
      { code: 'EF04MA02', description: 'Resolver e elaborar problemas com as quatro operações, utilizando diferentes estratégias de cálculo.' },
      { code: 'EF04MA03', description: 'Compreender o conceito de multiplicação e divisão como operações inversas.' },
      { code: 'EF04MA04', description: 'Utilizar o sistema monetário brasileiro em situações de compra, troco e cálculo de valores.' },
      { code: 'EF04MA05', description: 'Identificar e classificar figuras geométricas planas e espaciais, reconhecendo seus elementos e propriedades.' },
      { code: 'EF04MA06', description: 'Estimar e medir grandezas de comprimento, massa, tempo, temperatura e capacidade, utilizando unidades convencionais.' },
      { code: 'EF04MA07', description: 'Analisar e representar dados em tabelas, gráficos de colunas e pictogramas.' },
      { code: 'EF04MA08', description: 'Reconhecer frações como representação de partes de um todo e utilizá-las em situações cotidianas.' },
    
      // CIÊNCIAS (CI)
      { code: 'EF04CI01', description: 'Identificar características dos seres vivos e compreender suas interações com o meio ambiente.' },
      { code: 'EF04CI02', description: 'Compreender o ciclo de vida de plantas e animais e sua relação com o ambiente.' },
      { code: 'EF04CI03', description: 'Investigar propriedades dos materiais e as transformações provocadas por aquecimento, mistura ou outros processos.' },
      { code: 'EF04CI04', description: 'Reconhecer fenômenos naturais relacionados ao tempo atmosférico e às estações do ano.' },
      { code: 'EF04CI05', description: 'Analisar a importância da água e do solo e identificar práticas sustentáveis para sua conservação.' },
    
      // HISTÓRIA (HI)
      { code: 'EF04HI01', description: 'Compreender o processo de formação do território brasileiro, reconhecendo a presença indígena e africana na história nacional.' },
      { code: 'EF04HI02', description: 'Identificar aspectos da organização social, política e econômica do Brasil colonial.' },
      { code: 'EF04HI03', description: 'Reconhecer as transformações ocorridas no espaço urbano e rural ao longo do tempo.' },
      { code: 'EF04HI04', description: 'Valorizar as diferentes formas de resistência e luta de povos indígenas, africanos e afrodescendentes.' },
    
      // GEOGRAFIA (GE)
      { code: 'EF04GE01', description: 'Localizar e representar, em mapas, o município, o estado e o país, reconhecendo seus limites e vizinhanças.' },
      { code: 'EF04GE02', description: 'Analisar elementos naturais e humanos que compõem a paisagem local e regional.' },
      { code: 'EF04GE03', description: 'Compreender a relação entre sociedade e natureza na ocupação e uso do espaço geográfico.' },
      { code: 'EF04GE04', description: 'Reconhecer problemas ambientais e propor atitudes para a preservação e melhoria do ambiente.' },
    
      // ARTES (AR)
      { code: 'EF04AR01', description: 'Explorar diferentes linguagens artísticas para expressar ideias, emoções e percepções.' },
      { code: 'EF04AR02', description: 'Criar composições visuais e sonoras, utilizando diferentes técnicas e materiais.' },
      { code: 'EF04AR03', description: 'Apreciar e analisar obras de arte, reconhecendo contextos históricos, culturais e estéticos.' },
      { code: 'EF04AR04', description: 'Participar de apresentações artísticas, respeitando e valorizando a produção coletiva.' },
  
      { code: 'EF05LP01', description: 'Ler e compreender textos de diferentes gêneros, identificando o tema, as ideias principais e secundárias e o ponto de vista do autor.' },
      { code: 'EF05LP02', description: 'Analisar a estrutura e os elementos que caracterizam textos narrativos, poéticos, jornalísticos e instrucionais.' },
      { code: 'EF05LP03', description: 'Planejar, produzir, revisar e editar textos escritos, considerando o gênero, a finalidade e o público-alvo.' },
      { code: 'EF05LP04', description: 'Empregar adequadamente pontuação, ortografia e paragrafação, visando à clareza e coesão textual.' },
      { code: 'EF05LP05', description: 'Reconhecer e utilizar recursos linguísticos e expressivos para construir sentidos nos textos.' },
      { code: 'EF05LP06', description: 'Ler em voz alta com fluência, entonação e ritmo adequados, respeitando o gênero e o contexto.' },
      { code: 'EF05LP07', description: 'Apreciar, analisar e comparar textos literários de diferentes autores e épocas.' },
      { code: 'EF05LP08', description: 'Identificar relações entre linguagem verbal e não verbal em diferentes textos.' },
    
      // MATEMÁTICA (MA)
      { code: 'EF05MA01', description: 'Ler, escrever e ordenar números naturais e racionais (na forma decimal), compreendendo seus usos no cotidiano.' },
      { code: 'EF05MA02', description: 'Resolver e elaborar problemas envolvendo as quatro operações com números naturais e decimais.' },
      { code: 'EF05MA03', description: 'Explorar relações entre multiplicação e divisão, identificando padrões e regularidades.' },
      { code: 'EF05MA04', description: 'Compreender e utilizar frações em contextos de parte-todo, medida e operador.' },
      { code: 'EF05MA05', description: 'Identificar, nomear e representar figuras geométricas planas e espaciais, reconhecendo seus elementos e propriedades.' },
      { code: 'EF05MA06', description: 'Resolver problemas que envolvam perímetro, área e volume, utilizando unidades de medida convencionais.' },
      { code: 'EF05MA07', description: 'Analisar e interpretar dados apresentados em tabelas e gráficos, tirando conclusões e comparando informações.' },
      { code: 'EF05MA08', description: 'Resolver problemas que envolvam o sistema monetário brasileiro e situações de proporcionalidade simples.' },
    
      // CIÊNCIAS (CI)
      { code: 'EF05CI01', description: 'Identificar características dos seres vivos e compreender as relações entre os organismos e o ambiente.' },
      { code: 'EF05CI02', description: 'Reconhecer o ciclo da água e sua importância para os seres vivos e o equilíbrio ambiental.' },
      { code: 'EF05CI03', description: 'Investigar propriedades dos materiais e suas transformações físicas e químicas no cotidiano.' },
      { code: 'EF05CI04', description: 'Compreender as fontes de energia e suas formas de utilização na sociedade, relacionando-as ao consumo consciente.' },
      { code: 'EF05CI05', description: 'Analisar as consequências das ações humanas sobre o meio ambiente e propor atitudes sustentáveis.' },
    
      // HISTÓRIA (HI)
      { code: 'EF05HI01', description: 'Compreender o processo de formação do Brasil, relacionando a colonização, a diversidade cultural e a resistência indígena e africana.' },
      { code: 'EF05HI02', description: 'Identificar os principais fatos e transformações políticas, sociais e econômicas do período colonial e imperial.' },
      { code: 'EF05HI03', description: 'Reconhecer o papel das lutas sociais na construção da cidadania brasileira.' },
      { code: 'EF05HI04', description: 'Analisar aspectos da vida cotidiana em diferentes contextos históricos e culturais.' },
    
      // GEOGRAFIA (GE)
      { code: 'EF05GE01', description: 'Compreender a organização do território brasileiro, identificando regiões, estados e capitais.' },
      { code: 'EF05GE02', description: 'Analisar a diversidade natural e cultural do Brasil, reconhecendo a influência das relações humanas sobre o espaço.' },
      { code: 'EF05GE03', description: 'Compreender a dinâmica populacional e as atividades econômicas no território brasileiro.' },
      { code: 'EF05GE04', description: 'Identificar problemas ambientais e discutir práticas sustentáveis de uso dos recursos naturais.' },
    
      // ARTES (AR)
      { code: 'EF05AR01', description: 'Criar produções artísticas utilizando diferentes linguagens, materiais e técnicas.' },
      { code: 'EF05AR02', description: 'Apreciar e analisar obras de arte, reconhecendo estilos, contextos e significados.' },
      { code: 'EF05AR03', description: 'Participar de apresentações artísticas, valorizando a cooperação e o respeito entre os participantes.' },
      { code: 'EF05AR04', description: 'Explorar elementos visuais, sonoros e corporais na criação e interpretação de produções artísticas.' }
  ];

export async function seedBNCC(prisma: PrismaClient) {
  console.log('🌱 Populando códigos BNCC...');
  
  await upsertBnccWithRefs(prisma, bnccSeed);
  
  console.log('✅ Códigos BNCC populados com sucesso!');
}