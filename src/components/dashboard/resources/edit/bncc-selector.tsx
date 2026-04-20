'use client'

import * as React from 'react'
import { Check, Search, Loader2, BookMarked, Info } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/use-debounce'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'

interface BnccSkill {
  id: string
  code: string
  description: string
  knowledgeObject?: string | null
}

interface BnccSelectorProps {
  value: string[]
  onChange: (value: string[]) => void
  educationLevel?: string
  grade?: string
  subject?: string
  disabled?: boolean
}

export function BnccSelector({
  value = [],
  onChange,
  educationLevel,
  grade,
  subject,
  disabled,
}: BnccSelectorProps) {
  const [search, setSearch] = React.useState('')
  const debouncedSearch = useDebounce(search, 300)

  // A busca acontece automaticamente baseada nas props e no search
  const { data, isLoading } = useQuery({
    queryKey: ['bncc-search', debouncedSearch, educationLevel, grade, subject],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set('q', debouncedSearch)
      if (educationLevel) params.set('educationLevel', educationLevel)
      if (grade) params.set('grade', grade)
      if (subject) params.set('subject', subject)
      
      const response = await fetch(`/api/v1/admin/bncc/search?${params.toString()}`)
      if (!response.ok) throw new Error('Falha ao buscar BNCC')
      const json = await response.json()
      return json.data as BnccSkill[]
    },
    enabled: !!educationLevel && !!grade && !disabled
  })

  const toggleSkill = (code: string) => {
    if (value.includes(code)) {
      onChange(value.filter((v) => v !== code))
    } else {
      onChange([...value, code])
    }
  }

  return (
    <div className={cn(
      "space-y-4 border border-line rounded-4 bg-white overflow-hidden transition-all duration-300 shadow-sm",
      disabled && "opacity-50 grayscale pointer-events-none"
    )}>
      {/* Header com Busca */}
      <div className="p-4 bg-paper-2 border-b border-line flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-mute/40" />
           <Input 
             placeholder="Filtrar habilidades por termo ou código..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="pl-10 h-11 bg-white border-line-soft focus:ring-terracotta rounded-3 text-sm"
           />
        </div>
        <div className="flex shrink-0 gap-2 items-center text-[11px] font-bold text-ink-soft bg-white px-4 h-11 rounded-3 border border-line-soft">
           <BookMarked className="h-4 w-4 text-terracotta" />
           {value.length} SELECIONADAS
        </div>
      </div>

      {/* Lista de Habilidades */}
      <ScrollArea className="h-[400px]">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-ink-mute">
               <Loader2 className="h-8 w-8 animate-spin text-terracotta/40" />
               <span className="text-xs font-medium italic">Sincronizando com a base BNCC...</span>
            </div>
          ) : data && data.length > 0 ? (
            data.map((skill) => {
              const isSelected = value.includes(skill.code)
              return (
                <div 
                  key={skill.id}
                  onClick={() => toggleSkill(skill.code)}
                  className={cn(
                    "group flex items-start gap-4 p-4 rounded-3 cursor-pointer transition-all border border-transparent",
                    isSelected 
                      ? "bg-terracotta-2/40 border-terracotta/10 shadow-sm" 
                      : "hover:bg-paper-2 border-transparent"
                  )}
                >
                  <div className="mt-1">
                    <Checkbox 
                      checked={isSelected} 
                      onCheckedChange={() => toggleSkill(skill.code)}
                      className={cn(
                        "h-5 w-5 rounded-md border-line transition-all group-hover:border-terracotta",
                        isSelected && "bg-terracotta border-terracotta"
                      )}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                       <span className="font-mono text-[10px] font-black text-terracotta bg-white px-2 py-0.5 rounded-full border border-terracotta/20">
                         {skill.code}
                       </span>
                       {skill.knowledgeObject && (
                         <span className="text-[10px] uppercase font-bold tracking-tight text-ink-mute opacity-70">
                           • {skill.knowledgeObject}
                         </span>
                       )}
                    </div>
                    <p className="text-[13px] leading-relaxed text-ink font-medium">
                      {skill.description}
                    </p>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
               <div className="w-16 h-16 rounded-full bg-paper-2 flex items-center justify-center">
                 <Info className="h-8 w-8 text-ink-mute" />
               </div>
               <p className="text-sm italic text-ink-soft">
                 Nenhuma habilidade encontrada para os filtros atuais.
               </p>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Footer Informativo */}
      <div className="p-4 bg-paper-2 border-t border-line text-[11px] text-ink-mute italic flex justify-between items-center">
         <div className="flex items-center gap-2">
           <Info className="h-3 w-3 text-terracotta/40" />
           <span>
             Mostrando habilidades de <b>{subject || 'todas as disciplinas'}</b> para <b>{grade}</b>
           </span>
         </div>
         {value.length > 0 && (
           <button 
             type="button" 
             onClick={() => onChange([])}
             className="text-berry hover:underline font-bold not-italic"
           >
             Limpar Seleção
           </button>
         )}
      </div>
    </div>
  )
}
