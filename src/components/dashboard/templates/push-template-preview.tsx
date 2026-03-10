'use client';

import React from 'react';
import { Bell } from 'lucide-react';

interface PushTemplatePreviewProps {
    title: string;
    body: string;
    icon?: string | null;
    image?: string | null;
}

export function PushTemplatePreview({
    title,
    body,
    icon,
    image,
}: PushTemplatePreviewProps) {
    return (
        <div className="bg-muted rounded-xl p-4 shadow-lg border">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {icon ? (
                        <img src={icon} alt="Icon" className="w-full h-full object-cover" />
                    ) : (
                        <Bell className="w-5 h-5 text-primary" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                            Kadernim
                        </span>
                        <span className="text-[10px] text-muted-foreground">agora</span>
                    </div>
                    <p className="font-semibold text-sm mt-0.5 truncate">
                        {title || 'Título da Notificação'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {body || 'Corpo da mensagem aparecerá aqui...'}
                    </p>
                </div>
            </div>
            {image && (
                <div className="mt-3 rounded-lg overflow-hidden border bg-background/50">
                    <img
                        src={image}
                        alt="Notification preview"
                        className="w-full h-32 object-cover"
                    />
                </div>
            )}
        </div>
    );
}
