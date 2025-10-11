import { main } from './seeds/index';

// Executar a função main
main()
  .then(() => console.log('Seed executado com sucesso!'))
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  });
