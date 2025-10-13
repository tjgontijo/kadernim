'use client'

import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { FileText, Lock } from 'lucide-react'

interface ResourceCardProps {
  id: string
  title: string
  description: string
  imageUrl: string
  subject: string
  educationLevel: string
  isFree: boolean
  hasAccess: boolean
  fileCount: number
  onClick: (id: string) => void
}

export function ResourceCard({
  id,
  title,
  imageUrl,
  subject,
  educationLevel,
  isFree,
  hasAccess,
  fileCount,
  onClick
}: ResourceCardProps) {
  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md cursor-pointer ${!hasAccess ? 'opacity-70' : ''}`} onClick={() => onClick(id)}>
      <div className="relative">
        <AspectRatio ratio={16/9}>
          <Image
            src={imageUrl}
            alt={title}
            fill
            unoptimized
            className="object-cover"
          />
        </AspectRatio>
        {!hasAccess && (
          <Badge 
            className="absolute top-2 right-2 bg-black/70 text-white hover:bg-black/80" 
            variant="secondary"
          >
            <Lock className="mr-1 h-3 w-3" />
            Bloqueado
          </Badge>
        )}
      </div>
      <CardContent className="py-0 px-4">
        <h3 className="font-semibold text-lg mb-3 line-clamp-2">{title}</h3>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">{subject}</Badge>
          <Badge variant="outline">{educationLevel}</Badge>
          {isFree && <Badge variant="secondary" className="text-xs">Gratuito</Badge>}
        </div>
      </CardContent>
      <CardFooter className="py-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <FileText className="h-3 w-3" />
          <span>{fileCount} {fileCount === 1 ? 'arquivo' : 'arquivos'}</span>
        </div>
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onClick(id);
          }} 
          variant={hasAccess ? "default" : "outline"}
          size="sm"
          className="cursor-pointer"
        >
          {!hasAccess && <Lock className="mr-1 h-3 w-3" />}
          {hasAccess ? 'Acessar' : 'Desbloquear'}
        </Button>
      </CardFooter>
    </Card>
  )
}
