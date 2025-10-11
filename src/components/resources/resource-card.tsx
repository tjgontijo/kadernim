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
  description,
  imageUrl,
  subject,
  educationLevel,
  isFree,
  hasAccess,
  fileCount,
  onClick
}: ResourceCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md cursor-pointer" onClick={() => onClick(id)}>
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
        <Badge 
          className="absolute top-2 right-2" 
          variant={isFree ? "secondary" : "default"}
        >
          {isFree ? 'Gratuito' : 'Premium'}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{title}</h3>
        <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{description}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">{subject}</Badge>
          <Badge variant="outline">{educationLevel}</Badge>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
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
          {!hasAccess && !isFree && <Lock className="mr-1 h-3 w-3" />}
          {hasAccess ? 'Acessar' : (isFree ? 'Ver' : 'Comprar')}
        </Button>
      </CardFooter>
    </Card>
  )
}
