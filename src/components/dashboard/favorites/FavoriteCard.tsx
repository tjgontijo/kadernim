'use client'

import Link from 'next/link'
import { LazyImage } from '@/components/shared/lazy-image'
import { Lock, Heart } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useToggleFavorite } from '@/hooks/resources/use-resources'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { BadgeEducationLevel } from '../resources/BadgeEducationLevel'
import { BadgeSubject } from '../resources/BadgeSubject'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useState } from 'react'

interface FavoriteCardProps {
  id: string
  title: string
  description?: string | null
  thumbUrl?: string | null
  educationLevel: string
  subject: string
  subjectColor?: string | null
  subjectTextColor?: string | null
  hasAccess: boolean
  index: number // Used for random-like rotation
}

export function FavoriteCard({
  id,
  title,
  description,
  thumbUrl,
  educationLevel,
  subject,
  subjectColor,
  subjectTextColor,
  hasAccess,
  index
}: FavoriteCardProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const toggleFavorite = useToggleFavorite()

  // Organic rotations classes (standard Tailwind arbitrary values) - Ensuring none are too close to 0deg
  const rotations = [
    'rotate-[-1.8deg]', 
    'rotate-[1.5deg]', 
    'rotate-[-2.2deg]', 
    'rotate-[1.9deg]', 
    'rotate-[-1.4deg]', 
    'rotate-[2.1deg]'
  ]
  const rotation = rotations[index % rotations.length]

  const onRemoveConfirm = async () => {
    try {
      await toggleFavorite.mutateAsync(id)
      toast.success('Removido dos favoritos', {
        duration: 2000,
      })
      setIsConfirmOpen(false)
    } catch (error) {
      toast.error('Erro ao remover favorito')
    }
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsConfirmOpen(true)
  }


  return (
    <div className={cn("group relative transition-all duration-300 hover:scale-[1.02] hover:z-10", rotation)}>
      {/* Scrapbook Tape Effect */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-terracotta/20 backdrop-blur-sm border-x border-dashed border-terracotta/30 z-20 shadow-sm rotate-[-2deg] opacity-80 group-hover:opacity-100 transition-opacity" />

      <Link href={`/resources/${id}`} className="block h-full">
        <Card className="flex h-full flex-col overflow-hidden border-line-soft bg-card shadow-lg rounded-none p-4 pb-3">
          {/* Main Image */}
          <div className="relative aspect-square bg-paper-2 overflow-hidden border border-line-soft rounded-[12px]">
            {thumbUrl ? (
              <LazyImage
                src={thumbUrl}
                alt={title}
                fill
                className="object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-6 text-center">
                <span className="font-hand text-ink-mute text-lg leading-tight">{title}</span>
              </div>
            )}

            {!hasAccess && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-paper/40 backdrop-blur-[1px]">
                <Lock className="h-6 w-6 text-terracotta/80" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col pt-4 gap-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-base font-semibold text-ink line-clamp-2 leading-tight flex-1">
                {title}
              </h3>
              <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogTrigger asChild>
                  <button
                    onClick={handleFavoriteClick}
                    className="shrink-0 p-1.5 rounded-full hover:bg-berry-2 transition-colors -mt-1 -mr-1"
                    aria-label="Remover dos favoritos"
                  >
                    <Heart className="h-5 w-5 fill-terracotta text-terracotta" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remover dos favoritos?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Este recurso deixará de aparecer no seu mural de favoritos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveConfirm()
                      }}
                      className="bg-terracotta hover:bg-terracotta-hover text-white"
                    >
                      Remover
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <Separator className="border-line/40 border-dashed" />

            <div className="flex flex-wrap items-center gap-1.5">
              <BadgeEducationLevel level={educationLevel} />
              <BadgeSubject 
                subject={subject} 
                color={subjectColor}
                textColor={subjectTextColor}
              />
            </div>
          </div>
        </Card>
      </Link>
    </div>
  )
}
