import { memo } from 'react'

export const FooterSingle = memo(function FooterSingle() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-gray-200 bg-white py-6 mt-8 text-center text-sm text-muted-foreground">
      <span>&copy; {currentYear} Kadernim. Todos os direitos reservados.</span>
    </footer>
  )
})
