
// ISR - Cache com revalidação
export const dynamic = 'auto'
export const revalidate = 60 // Cache por 60 segundos

export default function RequestPage() {
  return (
    <div className="container mx-auto px-4 py-4">
      <p>Página de solicitações</p>
    </div>
  );
}
