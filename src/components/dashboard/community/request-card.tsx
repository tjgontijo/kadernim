'use client'

import { motion } from 'framer-motion'
import { Heart, User, Calendar, BookOpen, GraduationCap, Flame } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/index'
import { Badge } from '@/components/ui/badge'

interface RequestCardProps {
    request: {
        id: string
        title: string
        description: string
        voteCount: number
        hasVoted: boolean
        user: { name: string; image?: string | null }
        educationLevel: { name: string }
        subject: { name: string }
        grade?: { name: string } | null
        createdAt: string
        hasBnccAlignment?: boolean
        bnccSkillCodes?: string[]
    }
    onVote: (id: string) => void
    isVoting: boolean
    rank?: number
    isHighlighted?: boolean
    disabled?: boolean
}

export function RequestCard({
    request,
    onVote,
    isVoting,
    rank,
    isHighlighted = false,
    disabled = false
}: RequestCardProps) {
    const isTrending = rank !== undefined && rank <= 3
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="h-full relative"
        >
            {isTrending && (
                <div className="absolute -top-3 -left-3 h-10 w-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black text-xl shadow-xl shadow-primary/30 z-10 border-4 border-background">
                    {rank}
                </div>
            )}

            <Card className={cn(
                "h-full group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 border-2 rounded-[32px] overflow-hidden flex flex-col",
                request.hasVoted ? "border-primary/20 bg-primary/[0.01]" : "border-border/50",
                isHighlighted && "border-primary/40 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-primary/[0.03]"
            )}>
                {/* Header: Meta info */}
                <div className="p-5 flex flex-wrap gap-2 items-center justify-between border-b border-border/40 bg-muted/5 group-hover:bg-primary/[0.04] transition-colors">
                    <div className="flex gap-2">
                        <Badge variant="secondary" className="bg-background text-[10px] font-black uppercase tracking-widest border-border/50 rounded-full px-3">
                            <BookOpen className="h-3 w-3 mr-1 text-primary" />
                            {request.subject.name}
                        </Badge>
                        {isTrending && (
                            <Badge variant="secondary" className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest border-none rounded-full px-3 shadow-lg shadow-orange-500/20 animate-pulse">
                                <Flame className="h-3 w-3 mr-1 fill-current" />
                                Em Alta
                            </Badge>
                        )}
                        {request.hasBnccAlignment && (
                            <Badge variant="secondary" className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest border-none rounded-full px-3">
                                BNCC
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-black text-muted-foreground uppercase opacity-60">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(request.createdAt).toLocaleDateString('pt-BR', { month: 'short' })}
                    </div>
                </div>

                {/* Body: Title & Description */}
                <div className="p-6 pb-4 space-y-3 flex-grow">
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-[9px] font-black uppercase border-primary/30 text-primary rounded-lg py-0">
                            {request.grade?.name || request.educationLevel.name}
                        </Badge>
                        {request.hasBnccAlignment && request.bnccSkillCodes && request.bnccSkillCodes.length > 0 && (
                            <div className="flex gap-1">
                                {request.bnccSkillCodes.slice(0, 2).map(code => (
                                    <span key={code} className="text-[9px] font-bold text-muted-foreground bg-muted px-1.5 py-0 rounded border border-border/50">
                                        {code}
                                    </span>
                                ))}
                                {request.bnccSkillCodes.length > 2 && (
                                    <span className="text-[9px] font-bold text-muted-foreground bg-muted px-1.5 py-0 rounded border border-border/50">
                                        +{request.bnccSkillCodes.length - 2}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <h3 className="text-xl font-black leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {request.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 font-medium opacity-80">
                        {request.description}
                    </p>
                </div>

                {/* Footer: Author & Vote Action */}
                <div className="p-6 pt-0 mt-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="h-10 w-10 rounded-2xl bg-muted border-2 border-border/50 overflow-hidden flex items-center justify-center group-hover:border-primary/30 transition-colors">
                            {request.user.image ? (
                                <img src={request.user.image} alt={request.user.name} className="h-full w-full object-cover" />
                            ) : (
                                <User className="h-5 w-5 text-muted-foreground" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Sugerido por</span>
                            <span className="text-sm font-black text-foreground/80 truncate max-w-[100px]">
                                {request.user.name.split(' ')[0]}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-xl font-black tabular-nums text-foreground group-hover:text-primary transition-colors">
                                {request.voteCount}
                            </div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-[-2px]">Votos</div>
                        </div>

                        <Button
                            size="icon"
                            disabled={isVoting || request.hasVoted || disabled}
                            onClick={(e) => {
                                e.stopPropagation();
                                onVote(request.id);
                            }}
                            title={disabled ? 'Apenas assinantes podem votar' : request.hasVoted ? 'Você já votou' : 'Votar neste pedido'}
                            className={cn(
                                "h-14 w-14 rounded-[20px] transition-all duration-300 relative overflow-hidden",
                                request.hasVoted
                                    ? "bg-primary/10 text-primary shadow-inner pointer-events-none"
                                    : "bg-primary text-primary-foreground shadow-[0_6px_0_0_#1d4ed8] hover:shadow-[0_4px_0_0_#1d4ed8] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none"
                            )}
                        >
                            <Heart className={cn("h-6 w-6 transition-transform group-hover:scale-125", request.hasVoted && "fill-current scale-110")} />

                            {!request.hasVoted && (
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            )}
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}
