interface ResourceOverviewProps {
  description: string
}

export function ResourceOverview({ description }: ResourceOverviewProps) {
  if (!description) return null

  // Função simples para converter **bold** em <strong>
  const renderDescription = (text: string) => {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
    return { __html: html }
  }

  return (
    <div className="mt-[24px] bg-card border border-line rounded-4 p-[32px] shadow-1">
      <h3 className="font-display font-semibold text-[20px] mb-[14px] text-ink">Sobre esta atividade</h3>
      <div 
        className="text-[14px] leading-[1.6] text-ink-soft space-y-3.5 whitespace-pre-wrap description-content"
        dangerouslySetInnerHTML={renderDescription(description)}
      />
    </div>
  )
}
