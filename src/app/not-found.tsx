import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8f9fa] p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-[#1D3557] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-[#457B9D] mb-6">Página não encontrada</h2>
        <p className="text-[#1D3557] mb-8">
          Desculpe, a página que você está procurando não existe ou foi movida.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#1D3557] text-white font-medium py-2 px-6 rounded-md hover:bg-[#2a4a6e] transition-colors"
        >
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
}
